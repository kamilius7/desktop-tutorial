import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { notes, noteLikes, bookmarks, comments, users } from "@/db/schema";
import { getUser } from "@/lib/session";

type Ctx = { params: Promise<{ id: string; action: string }> };

async function ensureNote(id: string) {
  const rows = await db.select({ id: notes.id }).from(notes).where(eq(notes.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, action } = await ctx.params;
  if (action !== "comments") return NextResponse.json({ error: "Unknown action" }, { status: 404 });

  const rows = await db
    .select({
      id: comments.id,
      noteId: comments.noteId,
      authorId: comments.authorId,
      authorName: users.name,
      authorColor: users.avatarColor,
      content: comments.content,
      createdAt: comments.createdAt,
    })
    .from(comments)
    .innerJoin(users, eq(comments.authorId, users.id))
    .where(eq(comments.noteId, id))
    .orderBy(desc(comments.createdAt))
    .limit(50);
  return NextResponse.json({
    comments: rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
  });
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, action } = await ctx.params;
  if (!(await ensureNote(id))) return NextResponse.json({ error: "Note not found" }, { status: 404 });

  if (action === "like") {
    const existing = await db
      .select()
      .from(noteLikes)
      .where(and(eq(noteLikes.noteId, id), eq(noteLikes.userId, user.id)))
      .limit(1);
    let liked: boolean;
    if (existing[0]) {
      await db.delete(noteLikes).where(and(eq(noteLikes.noteId, id), eq(noteLikes.userId, user.id)));
      liked = false;
    } else {
      await db.insert(noteLikes).values({ noteId: id, userId: user.id }).onConflictDoNothing();
      liked = true;
    }
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(noteLikes)
      .where(eq(noteLikes.noteId, id));
    return NextResponse.json({ liked, likes: Number(count) });
  }

  if (action === "bookmark") {
    const existing = await db
      .select()
      .from(bookmarks)
      .where(and(eq(bookmarks.noteId, id), eq(bookmarks.userId, user.id)))
      .limit(1);
    let bookmarked: boolean;
    if (existing[0]) {
      await db.delete(bookmarks).where(and(eq(bookmarks.noteId, id), eq(bookmarks.userId, user.id)));
      bookmarked = false;
    } else {
      await db.insert(bookmarks).values({ noteId: id, userId: user.id }).onConflictDoNothing();
      bookmarked = true;
    }
    return NextResponse.json({ bookmarked });
  }

  if (action === "comments") {
    const body = await req.json().catch(() => ({}));
    const content = String(body.content ?? "").trim();
    if (content.length < 1) return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });
    if (content.length > 1000) return NextResponse.json({ error: "Comment is too long" }, { status: 400 });
    const [row] = await db
      .insert(comments)
      .values({ noteId: id, authorId: user.id, content })
      .returning();
    return NextResponse.json(
      {
        comment: {
          id: row.id,
          noteId: row.noteId,
          authorId: user.id,
          authorName: user.name,
          authorColor: user.avatarColor,
          content: row.content,
          createdAt: row.createdAt.toISOString(),
        },
      },
      { status: 201 },
    );
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 404 });
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, action } = await ctx.params;
  if (action !== "comments") return NextResponse.json({ error: "Unknown action" }, { status: 404 });
  const commentId = req.nextUrl.searchParams.get("commentId");
  if (!commentId) return NextResponse.json({ error: "commentId is required" }, { status: 400 });
  const rows = await db.select().from(comments).where(eq(comments.id, commentId)).limit(1);
  if (!rows[0]) return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  const noteOwner = await db.select({ uploaderId: notes.uploaderId }).from(notes).where(eq(notes.id, id)).limit(1);
  const canDelete = rows[0].authorId === user.id || noteOwner[0]?.uploaderId === user.id;
  if (!canDelete) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  await db.delete(comments).where(eq(comments.id, commentId));
  return NextResponse.json({ ok: true });
}
