import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { getUser } from "@/lib/session";

const MIME: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  doc: "application/msword",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ppt: "application/vnd.ms-powerpoint",
  txt: "text/plain; charset=utf-8",
  md: "text/markdown; charset=utf-8",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  zip: "application/zip",
  bin: "application/octet-stream",
};

export async function GET(req: NextRequest, ctx: { params: Promise<{ name: string }> }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name } = await ctx.params;

  // sanitize: no path traversal
  const safe = path.basename(name);
<<<<<<< HEAD
  if (safe !== name || safe.includes("\0")) return NextResponse.json({ error: "Invalid file name" }, { status: 400 });
=======
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
  const filePath = path.join(process.cwd(), "uploads", safe);
  let data: Buffer;
  try {
    data = await fs.readFile(filePath);
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const download = req.nextUrl.searchParams.get("download") === "1";
  const noteId = req.nextUrl.searchParams.get("note");
  const orig = req.nextUrl.searchParams.get("as");

  if (download && noteId) {
<<<<<<< HEAD
    await db.execute(sql`update notes set downloads = downloads + 1 where id = ${noteId} and file_name = ${safe}`);
=======
    await db.execute(sql`update notes set downloads = downloads + 1 where id = ${noteId}`);
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
  }

  const ext = (safe.split(".").pop() ?? "").toLowerCase();
  const mime = MIME[ext] ?? "application/octet-stream";
  const filename = orig && download ? encodeURIComponent(orig) : encodeURIComponent(safe);

  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": mime,
      "Content-Length": String(data.length),
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${filename}"`,
      "Cache-Control": "private, max-age=60",
    },
  });
}
