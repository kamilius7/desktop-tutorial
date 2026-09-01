import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import fs from "node:fs/promises";
import path from "node:path";
import { db } from "@/db";
import { notes, users } from "@/db/schema";
import { clearSignedOut, createSession, destroySession, getUser } from "@/lib/session";
import { hashPassword, verifyPassword } from "@/lib/password";
import { AVATAR_COLORS, DEPARTMENTS } from "@/lib/constants";

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

type Ctx = { params: Promise<{ action: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const { action } = await ctx.params;
  if (action !== "me") return bad("Unknown action", 404);
  const user = await getUser();
  if (!user) return bad("Unauthorized", 401);
  return NextResponse.json({ user });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { action } = await ctx.params;
  if (action !== "profile") return bad("Unknown action", 404);
  const user = await getUser();
  if (!user) return bad("Unauthorized", 401);
  const body = await req.json().catch(() => null);
  const name = String(body?.name ?? user.name).trim();
  const department = String(body?.department ?? user.department);
  const year = String(body?.year ?? user.year);
  const bio = String(body?.bio ?? user.bio).slice(0, 300);
  const avatarColor = AVATAR_COLORS.includes(body?.avatarColor) ? String(body.avatarColor) : user.avatarColor;
  if (name.length < 2) return bad("Name must be at least 2 characters");
  if (!DEPARTMENTS.includes(department as (typeof DEPARTMENTS)[number])) return bad("Invalid department");
  await db.update(users).set({ name, department, year, bio, avatarColor }).where(eq(users.id, user.id));
  return NextResponse.json({ user: { ...user, name, department, year, bio, avatarColor } });
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { action } = await ctx.params;

  if (action === "logout") {
    await destroySession();
    return NextResponse.json({ ok: true });
  }

  if (action === "login") {
    const body = await req.json().catch(() => null);
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");
    if (!email || !password) return bad("Email and password are required");
    const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = rows[0];
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return bad("Invalid email or password", 401);
    }
    await createSession(user.id);
    await clearSignedOut();
    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, department: user.department, bio: user.bio, year: user.year, avatarColor: user.avatarColor },
    });
  }

  if (action === "register") {
    const body = await req.json().catch(() => null);
    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");
    const department = String(body?.department ?? "");
    const year = String(body?.year ?? "1st Year");
    if (name.length < 2) return bad("Please enter your full name");
    if (!/^\S+@\S+\.\S+$/.test(email)) return bad("Please enter a valid email");
    if (password.length < 6) return bad("Password must be at least 6 characters");
    if (!DEPARTMENTS.includes(department as (typeof DEPARTMENTS)[number])) return bad("Please choose your department");
    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existing[0]) return bad("An account with this email already exists", 409);
    const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    const [user] = await db
      .insert(users)
      .values({ name, email, passwordHash: hashPassword(password), department, year, avatarColor, bio: "" })
      .returning();
    await createSession(user.id);
    await clearSignedOut();
    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, department: user.department, bio: user.bio, year: user.year, avatarColor: user.avatarColor },
    });
  }

  return bad("Unknown action", 404);
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const { action } = await ctx.params;
  if (action !== "account") return bad("Unknown action", 404);
  const user = await getUser();
  if (!user) return bad("Unauthorized", 401);

  // Remove uploaded files belonging to this user's notes.
  const myNotes = await db.select({ fileName: notes.fileName }).from(notes).where(eq(notes.uploaderId, user.id));
  await Promise.all(
    myNotes.map((n) => fs.unlink(path.join(process.cwd(), "uploads", n.fileName)).catch(() => {})),
  );

  // Deleting the user cascades to their notes, likes, bookmarks,
  // comments, enrollments, sessions and message rows (FK onDelete cascade).
  await db.delete(users).where(eq(users.id, user.id));

  // Remove conversations that are now empty (both members deleted).
  await db.execute(sql`
    delete from conversations
    where not exists (
      select 1 from conversation_members cm
      where cm.conversation_id = conversations.id
    )
  `);

  await destroySession();
  return NextResponse.json({ ok: true });
}
