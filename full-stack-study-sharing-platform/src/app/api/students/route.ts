import { NextRequest, NextResponse } from "next/server";
import { and, asc, eq, ilike, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getUser } from "@/lib/session";
import type { PublicProfileDTO } from "@/lib/types";

export async function GET(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sp = req.nextUrl.searchParams;
  const q = sp.get("q")?.trim();
  const dept = sp.get("department");

  const conditions = [ne(users.id, user.id)];
  if (q) {
    const like = `%${q}%`;
    conditions.push(ilike(users.name, like));
  }
  if (dept) conditions.push(eq(users.department, dept));

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      department: users.department,
      bio: users.bio,
      year: users.year,
      avatarColor: users.avatarColor,
      noteCount: sql<number>`(select count(*)::int from notes n where n.uploader_id = ${users.id})`,
      likeCount: sql<number>`(select count(*)::int from note_likes nl join notes n on n.id = nl.note_id where n.uploader_id = ${users.id})`,
    })
    .from(users)
    .where(and(...conditions))
    .orderBy(asc(users.name))
    .limit(60);

  const students: PublicProfileDTO[] = rows.map((r) => ({ ...r, noteCount: Number(r.noteCount), likeCount: Number(r.likeCount) }));
  return NextResponse.json({ students });
}
