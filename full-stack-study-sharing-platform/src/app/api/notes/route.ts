import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, gt, ilike, inArray, or, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { db } from "@/db";
import { notes, courses, users, enrollments, bookmarks } from "@/db/schema";
import { getUser } from "@/lib/session";
import { noteFields, rowToNote } from "@/lib/queries";
import { MAX_UPLOAD_SIZE } from "@/lib/constants";
import { checkOrigin } from "@/lib/csrf";
import { rateLimit } from "@/lib/rate-limit";

const ALLOWED = ["pdf", "docx", "doc", "pptx", "ppt", "txt", "md", "png", "jpg", "jpeg", "zip"];

export async function GET(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const q = sp.get("q")?.trim().slice(0, 100);
  const courseId = sp.get("courseId");
  const scope = sp.get("scope") ?? "all"; // all | mydept | following | mine | bookmarked
  const type = sp.get("type");
  const sort = sp.get("sort") ?? "recent";
  const limit = Math.min(Number(sp.get("limit") ?? 60), 100);

  const conditions = [];
  if (courseId) conditions.push(eq(notes.courseId, courseId));
  if (q) {
    const like = `%${q}%`;
    conditions.push(or(ilike(notes.title, like), ilike(notes.description, like), ilike(courses.code, like), ilike(courses.name, like)));
  }
  if (scope === "mydept") conditions.push(eq(courses.department, user.department));
  if (scope === "mine") conditions.push(eq(notes.uploaderId, user.id));
  if (scope === "following") {
    const joined = await db.select({ courseId: enrollments.courseId }).from(enrollments).where(eq(enrollments.userId, user.id));
    const ids = joined.map((j) => j.courseId);
    if (ids.length === 0) return NextResponse.json({ notes: [] });
    conditions.push(inArray(notes.courseId, ids));
  }
  if (scope === "bookmarked") {
    const saved = await db.select({ noteId: bookmarks.noteId }).from(bookmarks).where(eq(bookmarks.userId, user.id));
    const ids = saved.map((s) => s.noteId);
    if (ids.length === 0) return NextResponse.json({ notes: [] });
    conditions.push(inArray(notes.id, ids));
  }
  if (type) conditions.push(eq(notes.fileType, type));

  const order =
    sort === "downloads"
      ? desc(notes.downloads)
      : sort === "likes"
        ? sql`(select count(*) from note_likes nl where nl.note_id = ${notes.id}) desc`
        : desc(notes.createdAt);

  const rows = await db
    .select(noteFields(user.id))
    .from(notes)
    .innerJoin(courses, eq(notes.courseId, courses.id))
    .innerJoin(users, eq(notes.uploaderId, users.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(order)
    .limit(limit);

  return NextResponse.json({ notes: rows.map(rowToNote) });
}

export async function POST(req: NextRequest) {
  const originError = checkOrigin(req);
  if (originError) return originError;
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!rateLimit(`note-upload:${user.id}`, 20, 60 * 60 * 1000)) return NextResponse.json({ error: "Too many uploads" }, { status: 429 });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Invalid form data" }, { status: 400 });

  const file = form.get("file");
  const title = String(form.get("title") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const courseId = String(form.get("courseId") ?? "");
  const tags = String(form.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim().toLowerCase().replace(/\s+/g, "-"))
    .filter(Boolean)
    .filter((tag) => tag.length <= 30)
    .slice(0, 6);
  const isScan = String(form.get("isScan") ?? "") === "1";

  if (!(file instanceof File) || file.size === 0) return NextResponse.json({ error: "A file is required" }, { status: 400 });
  if (file.name.includes("\0")) return NextResponse.json({ error: "Invalid file name" }, { status: 400 });
  if (title.length < 3) return NextResponse.json({ error: "Title must be at least 3 characters" }, { status: 400 });
  if (title.length > 200 || description.length > 2000) return NextResponse.json({ error: "Title or description is too long" }, { status: 400 });
  if (file.size > MAX_UPLOAD_SIZE) return NextResponse.json({ error: "File exceeds the 25MB limit" }, { status: 400 });

  const ext = (file.name.split(".").pop() ?? "").toLowerCase();
  const fileType = isScan && ["jpg", "jpeg", "png"].includes(ext) ? "scan" : ext || "pdf";
  const allowedCheck = isScan ? true : ALLOWED.includes(ext);
  if (!allowedCheck) return NextResponse.json({ error: `Unsupported file type: .${ext}` }, { status: 400 });
  const expectedMime: Record<string, string[]> = { pdf: ["application/pdf"], doc: ["application/msword"], docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"], ppt: ["application/vnd.ms-powerpoint"], pptx: ["application/vnd.openxmlformats-officedocument.presentationml.presentation"], txt: ["text/plain"], md: ["text/markdown", "text/plain"], png: ["image/png"], jpg: ["image/jpeg"], jpeg: ["image/jpeg"], zip: ["application/zip"] };
  if (file.type && !(expectedMime[ext] ?? []).includes(file.type)) return NextResponse.json({ error: "File type does not match its extension" }, { status: 400 });
  const daily = await db.select({ id: notes.id }).from(notes).where(and(eq(notes.uploaderId, user.id), gt(notes.createdAt, new Date(Date.now() - 86400000)))).limit(10);
  if (daily.length >= 10) return NextResponse.json({ error: "Daily upload limit reached" }, { status: 429 });

  const courseRows = await db.select({ id: courses.id }).from(courses).where(eq(courses.id, courseId)).limit(1);
  if (!courseRows[0]) return NextResponse.json({ error: "Please pick a valid course" }, { status: 400 });

  const storedName = path.basename(`${randomUUID()}.${ext || "bin"}`);
  const dir = path.join(process.cwd(), "uploads");
  await fs.mkdir(dir, { recursive: true });
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, storedName), buf);

  const [row] = await db
    .insert(notes)
    .values({
      title,
      description,
      courseId,
      uploaderId: user.id,
      fileName: storedName,
      originalName: file.name.replace(/[<>]/g, ""),
      fileType,
      fileSize: file.size,
      tags,
      isScan,
    })
    .returning({ id: notes.id });

  const full = await db
    .select(noteFields(user.id))
    .from(notes)
    .innerJoin(courses, eq(notes.courseId, courses.id))
    .innerJoin(users, eq(notes.uploaderId, users.id))
    .where(eq(notes.id, row.id))
    .limit(1);

  return NextResponse.json({ note: rowToNote(full[0]) }, { status: 201 });
}
