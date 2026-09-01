import { NextResponse } from "next/server";
import { desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { notes, courses, users, enrollments, bookmarks } from "@/db/schema";
import { getUser } from "@/lib/session";
import { noteFields, rowToNote } from "@/lib/queries";
<<<<<<< HEAD
import type { DashboardDTO, PublicProfileDTO } from "@/lib/types";
=======
import type { DashboardDTO } from "@/lib/types";
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [statsRow] = await db
    .select({
      myNotes: sql<number>`(select count(*)::int from notes n where n.uploader_id = ${user.id})`,
      totalDownloads: sql<number>`coalesce((select sum(n.downloads)::int from notes n where n.uploader_id = ${user.id}), 0)`,
      totalLikes: sql<number>`(select count(*)::int from note_likes nl join notes n on n.id = nl.note_id where n.uploader_id = ${user.id})`,
      coursesJoined: sql<number>`(select count(*)::int from enrollments e where e.user_id = ${user.id})`,
    })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  const joinedRows = await db.select({ courseId: enrollments.courseId }).from(enrollments).where(eq(enrollments.userId, user.id));
  const joinedIds = joinedRows.map((r) => r.courseId);

  const deptCourseRows = await db.select({ id: courses.id }).from(courses).where(eq(courses.department, user.department));
  const deptIds = deptCourseRows.map((r) => r.id);
  const feedIds = Array.from(new Set([...joinedIds, ...deptIds]));

  const feed = feedIds.length
    ? (
        await db
          .select(noteFields(user.id))
          .from(notes)
          .innerJoin(courses, eq(notes.courseId, courses.id))
          .innerJoin(users, eq(notes.uploaderId, users.id))
          .where(inArray(notes.courseId, feedIds))
          .orderBy(desc(notes.createdAt))
          .limit(8)
      ).map(rowToNote)
    : [];

  const trendingCourses = (
    await db
      .select({
        id: courses.id,
        code: courses.code,
        name: courses.name,
        department: courses.department,
        professor: courses.professor,
        semester: courses.semester,
        description: courses.description,
        color: courses.color,
        createdById: courses.createdById,
        createdAt: courses.createdAt,
        memberCount: sql<number>`(select count(*)::int from enrollments e where e.course_id = ${courses.id})`,
        noteCount: sql<number>`(select count(*)::int from notes n where n.course_id = ${courses.id})`,
        joined: sql<boolean>`exists(select 1 from enrollments e where e.course_id = ${courses.id} and e.user_id = ${user.id})`,
      })
      .from(courses)
      .where(eq(courses.department, user.department))
      .orderBy(desc(sql`(select count(*) from notes n where n.course_id = ${courses.id})`))
      .limit(5)
  ).map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    memberCount: Number(r.memberCount),
    noteCount: Number(r.noteCount),
    joined: Boolean(r.joined),
  }));

  const bookmarkIds = (await db.select({ noteId: bookmarks.noteId }).from(bookmarks).where(eq(bookmarks.userId, user.id)).orderBy(desc(bookmarks.createdAt)).limit(4)).map((b) => b.noteId);
  const recentBookmarks = bookmarkIds.length
    ? (
        await db
          .select(noteFields(user.id))
          .from(notes)
          .innerJoin(courses, eq(notes.courseId, courses.id))
          .innerJoin(users, eq(notes.uploaderId, users.id))
          .where(inArray(notes.id, bookmarkIds))
          .limit(4)
      ).map(rowToNote)
    : [];

  const topContributors = (
    await db
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
      .orderBy(desc(sql`(select count(*) from note_likes nl join notes n on n.id = nl.note_id where n.uploader_id = ${users.id})`))
      .limit(5)
<<<<<<< HEAD
  ).map((r): PublicProfileDTO => ({ ...r, noteCount: Number(r.noteCount), likeCount: Number(r.likeCount) }));
=======
  ).map((r) => ({ ...r, noteCount: Number(r.noteCount), likeCount: Number(r.likeCount) }));
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd

  const payload: DashboardDTO = {
    stats: {
      myNotes: Number(statsRow?.myNotes ?? 0),
      totalDownloads: Number(statsRow?.totalDownloads ?? 0),
      totalLikes: Number(statsRow?.totalLikes ?? 0),
      coursesJoined: Number(statsRow?.coursesJoined ?? 0),
    },
    feed,
    trendingCourses,
    topContributors,
    recentBookmarks,
  };
  return NextResponse.json(payload);
}
