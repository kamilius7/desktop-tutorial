import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import fs from "node:fs/promises";
import path from "node:path";
import { db } from "@/db";
import { notes, courses, users } from "@/db/schema";
import { getUser } from "@/lib/session";
import { noteFields, rowToNote } from "@/lib/queries";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const rows = await db
    .select(noteFields(user.id))
    .from(notes)
    .innerJoin(courses, eq(notes.courseId, courses.id))
    .innerJoin(users, eq(notes.uploaderId, users.id))
    .where(eq(notes.id, id))
    .limit(1);
  if (!rows[0]) return NextResponse.json({ error: "Note not found" }, { status: 404 });
  return NextResponse.json({ note: rowToNote(rows[0]) });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const existing = await db.select().from(notes).where(eq(notes.id, id)).limit(1);
  if (!existing[0]) return NextResponse.json({ error: "Note not found" }, { status: 404 });
  if (existing[0].uploaderId !== user.id) return NextResponse.json({ error: "Only the uploader can edit this note" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const title = String(body.title ?? existing[0].title).trim();
  const description = String(body.description ?? existing[0].description).trim();
  const tags = Array.isArray(body.tags)
    ? body.tags.map((t: unknown) => String(t).trim().toLowerCase().replace(/\s+/g, "-")).filter(Boolean).slice(0, 6)
    : existing[0].tags;
  if (title.length < 3) return NextResponse.json({ error: "Title must be at least 3 characters" }, { status: 400 });

  await db.update(notes).set({ title, description, tags }).where(eq(notes.id, id));
  const rows = await db
    .select(noteFields(user.id))
    .from(notes)
    .innerJoin(courses, eq(notes.courseId, courses.id))
    .innerJoin(users, eq(notes.uploaderId, users.id))
    .where(eq(notes.id, id))
    .limit(1);
  return NextResponse.json({ note: rowToNote(rows[0]) });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const existing = await db.select().from(notes).where(eq(notes.id, id)).limit(1);
  if (!existing[0]) return NextResponse.json({ error: "Note not found" }, { status: 404 });
  if (existing[0].uploaderId !== user.id) return NextResponse.json({ error: "Only the uploader can delete this note" }, { status: 403 });

  await db.delete(notes).where(eq(notes.id, id));
  await fs.unlink(path.join(process.cwd(), "uploads", existing[0].fileName)).catch(() => {});
  return NextResponse.json({ ok: true });
}
