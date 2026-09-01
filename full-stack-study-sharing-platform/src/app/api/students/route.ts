import { NextRequest, NextResponse } from "next/server";
<<<<<<< HEAD
import { and, asc, eq, ilike, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getUser } from "@/lib/session";
import type { PublicProfileDTO } from "@/lib/types";
=======
import { and, asc, eq, ilike, ne, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getUser } from "@/lib/session";
import type { StudentDTO } from "@/lib/types";
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd

export async function GET(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sp = req.nextUrl.searchParams;
  const q = sp.get("q")?.trim();
  const dept = sp.get("department");

  const conditions = [ne(users.id, user.id)];
  if (q) {
    const like = `%${q}%`;
<<<<<<< HEAD
    conditions.push(ilike(users.name, like));
=======
    conditions.push(or(ilike(users.name, like), ilike(users.email, like))!);
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
  }
  if (dept) conditions.push(eq(users.department, dept));

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
<<<<<<< HEAD
=======
      email: users.email,
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
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

<<<<<<< HEAD
  const students: PublicProfileDTO[] = rows.map((r) => ({ ...r, noteCount: Number(r.noteCount), likeCount: Number(r.likeCount) }));
=======
  const students: StudentDTO[] = rows.map((r) => ({ ...r, noteCount: Number(r.noteCount), likeCount: Number(r.likeCount) }));
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
  return NextResponse.json({ students });
}
