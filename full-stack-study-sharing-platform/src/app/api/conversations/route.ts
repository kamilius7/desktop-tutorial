import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { conversations, conversationMembers, users } from "@/db/schema";
import { getUser } from "@/lib/session";
import type { ConversationDTO } from "@/lib/types";
<<<<<<< HEAD
import { decryptMessage } from "@/lib/message-crypto";
=======
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd

type ConvoRow = {
  conversation_id: string;
  other_id: string;
  other_name: string;
  other_color: string;
  other_department: string;
  last_message: string | null;
  last_message_at: string | Date | null;
  last_sender_id: string | null;
  unread_count: string | number;
};

const convoListQuery = (viewerId: string) => sql`
  select
    cm.conversation_id,
    u.id as other_id,
    u.name as other_name,
    u.avatar_color as other_color,
    u.department as other_department,
    (select content from messages m where m.conversation_id = cm.conversation_id order by created_at desc limit 1) as last_message,
    (select created_at from messages m where m.conversation_id = cm.conversation_id order by created_at desc limit 1) as last_message_at,
    (select sender_id from messages m where m.conversation_id = cm.conversation_id order by created_at desc limit 1) as last_sender_id,
    (select count(*)::int from messages m
       where m.conversation_id = cm.conversation_id
         and m.sender_id <> ${viewerId}
         and m.created_at > cm.last_read_at) as unread_count
  from conversation_members cm
  join conversation_members cm2
    on cm2.conversation_id = cm.conversation_id and cm2.user_id <> ${viewerId}
  join users u on u.id = cm2.user_id
  where cm.user_id = ${viewerId}
  order by last_message_at desc nulls last
`;

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const res = await db.execute(convoListQuery(user.id));
  const convos: ConversationDTO[] = (res.rows as unknown as ConvoRow[]).map((r) => ({
    id: String(r.conversation_id),
    otherId: String(r.other_id),
    otherName: String(r.other_name),
    otherColor: String(r.other_color),
    otherDepartment: String(r.other_department),
<<<<<<< HEAD
    lastMessage: r.last_message == null ? null : decryptMessage(String(r.last_message)),
=======
    lastMessage: r.last_message == null ? null : String(r.last_message),
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
    lastMessageAt: r.last_message_at == null ? null : new Date(r.last_message_at).toISOString(),
    lastSenderId: r.last_sender_id == null ? null : String(r.last_sender_id),
    unreadCount: Number(r.unread_count ?? 0),
  }));
  return NextResponse.json({ conversations: convos });
}

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const otherId = String(body.userId ?? "");
  if (!otherId || otherId === user.id) return NextResponse.json({ error: "Invalid participant" }, { status: 400 });
  const other = await db.select().from(users).where(eq(users.id, otherId)).limit(1);
  if (!other[0]) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  // reuse an existing 1:1 conversation if present
  const existing = await db.execute(sql<{ conversation_id: string }>`
    select cm.conversation_id from conversation_members cm
    join conversation_members cm2 on cm2.conversation_id = cm.conversation_id and cm2.user_id = ${otherId}
    where cm.user_id = ${user.id}
    limit 1
  `);
  let convoId = existing.rows[0]?.conversation_id as string | undefined;
  if (!convoId) {
    const [convo] = await db.insert(conversations).values({ createdAt: new Date() }).returning();
    convoId = convo.id;
    await db.insert(conversationMembers).values([
      { conversationId: convoId, userId: user.id },
      { conversationId: convoId, userId: otherId },
    ]);
  }
  return NextResponse.json({
    conversation: {
      id: convoId,
      otherId: other[0].id,
      otherName: other[0].name,
      otherColor: other[0].avatarColor,
      otherDepartment: other[0].department,
      lastMessage: null,
      lastMessageAt: null,
      lastSenderId: null,
      unreadCount: 0,
    } satisfies ConversationDTO,
  });
}
