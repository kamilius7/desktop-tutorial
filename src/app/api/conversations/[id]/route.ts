import { NextRequest, NextResponse } from "next/server";
import { and, asc, eq, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { conversationMembers, messages, users } from "@/db/schema";
import { getUser } from "@/lib/session";

type Ctx = { params: Promise<{ id: string }> };

async function memberOrFail(convoId: string, userId: string) {
  const rows = await db
    .select()
    .from(conversationMembers)
    .where(and(eq(conversationMembers.conversationId, convoId), eq(conversationMembers.userId, userId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const member = await memberOrFail(id, user.id);
  if (!member) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

  const other = await db
    .select({ id: users.id, name: users.name, avatarColor: users.avatarColor, department: users.department, bio: users.bio })
    .from(conversationMembers)
    .innerJoin(users, eq(conversationMembers.userId, users.id))
    .where(and(eq(conversationMembers.conversationId, id), ne(conversationMembers.userId, user.id)))
    .limit(1);
  if (!other[0]) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

  const rows = await db
    .select({
      id: messages.id,
      conversationId: messages.conversationId,
      senderId: messages.senderId,
      senderName: users.name,
      senderColor: users.avatarColor,
      content: messages.content,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .innerJoin(users, eq(messages.senderId, users.id))
    .where(eq(messages.conversationId, id))
    .orderBy(asc(messages.createdAt))
    .limit(200);

  const last = rows[rows.length - 1];
  if (last && last.createdAt > member.lastReadAt) {
    await db
      .update(conversationMembers)
      .set({ lastReadAt: new Date() })
      .where(and(eq(conversationMembers.conversationId, id), eq(conversationMembers.userId, user.id)));
  }

  return NextResponse.json({
    other: other[0],
    messages: rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
  });
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const member = await memberOrFail(id, user.id);
  if (!member) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const content = String(body.content ?? "").trim();
  if (!content) return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
  if (content.length > 2000) return NextResponse.json({ error: "Message is too long" }, { status: 400 });

  const [row] = await db.insert(messages).values({ conversationId: id, senderId: user.id, content }).returning();
  await db
    .update(conversationMembers)
    .set({ lastReadAt: new Date() })
    .where(and(eq(conversationMembers.conversationId, id), eq(conversationMembers.userId, user.id)));

  return NextResponse.json(
    {
      message: {
        id: row.id,
        conversationId: row.conversationId,
        senderId: user.id,
        senderName: user.name,
        senderColor: user.avatarColor,
        content: row.content,
        createdAt: row.createdAt.toISOString(),
      },
    },
    { status: 201 },
  );
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const member = await memberOrFail(id, user.id);
  if (!member) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  await db.execute(sql`delete from conversations where id = ${id}`);
  return NextResponse.json({ ok: true });
}
