import { sql } from "drizzle-orm";
import { notes, courses, users } from "@/db/schema";
import type { NoteDTO } from "@/lib/types";

/** Column selection that hydrates a NoteDTO (with viewer-relative flags). */
export const noteFields = (viewerId: string) => ({
  id: notes.id,
  title: notes.title,
  description: notes.description,
  courseId: notes.courseId,
  courseCode: courses.code,
  courseName: courses.name,
  courseColor: courses.color,
  department: courses.department,
  uploaderId: notes.uploaderId,
  uploaderName: users.name,
  uploaderColor: users.avatarColor,
  uploaderDepartment: users.department,
  fileName: notes.fileName,
  originalName: notes.originalName,
  fileType: notes.fileType,
  fileSize: notes.fileSize,
  tags: notes.tags,
  downloads: notes.downloads,
  isScan: notes.isScan,
  createdAt: notes.createdAt,
  likes: sql<number>`(select count(*)::int from note_likes nl where nl.note_id = ${notes.id})`,
  liked: sql<boolean>`exists(select 1 from note_likes nl where nl.note_id = ${notes.id} and nl.user_id = ${viewerId})`,
  bookmarked: sql<boolean>`exists(select 1 from bookmarks b where b.note_id = ${notes.id} and b.user_id = ${viewerId})`,
  commentCount: sql<number>`(select count(*)::int from comments c where c.note_id = ${notes.id})`,
});

export const noteJoins = {
  notes,
  courses,
  users,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function rowToNote(row: any): NoteDTO {
  return {
    ...row,
    createdAt:
      row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
    tags: row.tags ?? [],
    likes: Number(row.likes ?? 0),
    commentCount: Number(row.commentCount ?? 0),
    downloads: Number(row.downloads ?? 0),
    liked: Boolean(row.liked),
    bookmarked: Boolean(row.bookmarked),
    isScan: Boolean(row.isScan),
  };
}
