import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import fs from "node:fs/promises";
import path from "node:path";
import { db } from "@/db";
import { notes, sessions, users } from "@/db/schema";
import {
  clearPendingAuth,
  clearSignedOut,
  createSession,
  destroySession,
  getPendingAuth,
  getUser,
  setPendingAuth,
} from "@/lib/session";
import { hashPassword, verifyPassword } from "@/lib/password";
import { AVATAR_COLORS, DEPARTMENTS } from "@/lib/constants";
import { checkOrigin } from "@/lib/csrf";
import { rateLimit } from "@/lib/rate-limit";
import { generateAndSendOtp, verifyOtp } from "@/lib/otp";

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

type Ctx = { params: Promise<{ action: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const { action } = await ctx.params;
  if (action === "me") {
    const user = await getUser();
    if (!user) return bad("Unauthorized", 401);
    return NextResponse.json({ user });
  }

  if (action === "pending") {
    const pending = await getPendingAuth();
    if (!pending) return NextResponse.json({ pending: null });
    return NextResponse.json({
      pending: {
        email: pending.email,
        purpose: pending.purpose,
      },
    });
  }

  return bad("Unknown action", 404);
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
  const bio = String(body?.bio ?? user.bio).trim().slice(0, 500);
  const avatarColor = AVATAR_COLORS.includes(body?.avatarColor) ? String(body.avatarColor) : user.avatarColor;
  if (name.length < 2) return bad("Name must be at least 2 characters");
  if (name.length > 100) return bad("Name must be at most 100 characters");
  if (!DEPARTMENTS.includes(department as (typeof DEPARTMENTS)[number])) return bad("Invalid department");
  await db.update(users).set({ name, department, year, bio, avatarColor }).where(eq(users.id, user.id));
  return NextResponse.json({ user: { ...user, name, department, year, bio, avatarColor } });
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const originError = checkOrigin(req);
  if (originError) return originError;
  const { action } = await ctx.params;

  if (["login", "register", "verify-otp", "resend-otp", "forgot-password", "reset-password"].includes(action)) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (!rateLimit(`auth:${ip}`, 20, 60_000)) return bad("Too many attempts. Try again shortly.", 429);
  }

  if (action === "logout") {
    await destroySession();
    await clearPendingAuth();
    return NextResponse.json({ ok: true });
  }

  // --- LOGIN ---
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

    // Generate and send OTP, set short-lived pending cookie
    await generateAndSendOtp(user.id, user.email, "login");
    await setPendingAuth({ userId: user.id, email: user.email, purpose: "login" });

    return NextResponse.json({
      step: "otp",
      email: user.email,
    });
  }

  // --- REGISTER ---
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
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash: hashPassword(password),
        department,
        year,
        avatarColor,
        bio: "",
        emailVerified: false,
      })
      .returning();

    await generateAndSendOtp(newUser.id, email, "register");
    await setPendingAuth({ userId: newUser.id, email, purpose: "register" });

    return NextResponse.json({
      step: "otp",
      email,
    });
  }

  // --- VERIFY OTP ---
  if (action === "verify-otp") {
    const pending = await getPendingAuth();
    if (!pending) return bad("Verification session expired. Please start over.", 400);

    const body = await req.json().catch(() => null);
    const code = String(body?.code ?? "").trim();
    // Purpose is always taken from the server-side pending cookie; trusting the
    // client body here caused a purpose mismatch (e.g. "register" sent while the
    // OTP was issued as "login"/"reset"), making fresh codes report as expired.
    const purpose = pending.purpose;

    if (!code) return bad("Code is required", 400);

    const result = await verifyOtp(pending.userId, purpose, code, {
      // Reset codes stay unused here so reset-password can verify them again
      // before actually changing the password.
      markUsed: purpose !== "reset",
    });
    if (result === "invalid") return bad("Incorrect code", 400);
    if (result === "expired") return bad("Code expired — request a new one", 400);

    if (purpose === "reset") {
      return NextResponse.json({ ok: true, step: "new_password" });
    }

    if (purpose === "register") {
      await db.update(users).set({ emailVerified: true }).where(eq(users.id, pending.userId));
    }

    await createSession(pending.userId);
    await clearSignedOut();
    await clearPendingAuth();

    const rows = await db.select().from(users).where(eq(users.id, pending.userId)).limit(1);
    const u = rows[0];

    return NextResponse.json({
      ok: true,
      user: u
        ? {
            id: u.id,
            name: u.name,
            email: u.email,
            department: u.department,
            bio: u.bio,
            year: u.year,
            avatarColor: u.avatarColor,
            emailVerified: u.emailVerified,
          }
        : undefined,
    });
  }

  // --- RESEND OTP ---
  if (action === "resend-otp") {
    const pending = await getPendingAuth();
    if (!pending) return bad("No pending verification found. Please start over.", 400);

    const allowed = rateLimit(`resend:${pending.userId}`, 3, 10 * 60_000);
    if (!allowed) {
      return bad("Too many resend attempts. Please wait a few minutes before trying again.", 429);
    }

    await generateAndSendOtp(pending.userId, pending.email, pending.purpose);
    return NextResponse.json({ ok: true });
  }

  // --- FORGOT PASSWORD ---
  if (action === "forgot-password") {
    const body = await req.json().catch(() => null);
    const email = String(body?.email ?? "").trim().toLowerCase();
    if (!email) return bad("Email is required", 400);

    const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = rows[0];

    if (user) {
      await generateAndSendOtp(user.id, user.email, "reset");
      await setPendingAuth({ userId: user.id, email: user.email, purpose: "reset" });
    } else {
      await setPendingAuth({ userId: "anonymous", email, purpose: "reset" });
    }

    // Always return step: "otp" to prevent email enumeration
    return NextResponse.json({ ok: true, step: "otp", email });
  }

  // --- RESET PASSWORD ---
  if (action === "reset-password") {
    const pending = await getPendingAuth();
    if (!pending || pending.purpose !== "reset" || pending.userId === "anonymous") {
      return bad("Password reset session expired. Please start over.", 400);
    }

    const body = await req.json().catch(() => null);
    const newPassword = String(body?.newPassword ?? "");
    const code = String(body?.code ?? "").trim();

    // Require a fresh, verified reset OTP — never allow password change
    // without proving possession of the code sent to the account email.
    if (!code) return bad("Verification code is required", 400);
    const result = await verifyOtp(pending.userId, "reset", code, { markUsed: true });
    if (result === "invalid") return bad("Incorrect code", 400);
    if (result === "expired") return bad("Code expired — request a new one", 400);

    if (newPassword.length < 8) {
      return bad("Password must be at least 8 characters", 400);
    }

    const hashed = hashPassword(newPassword);
    await db.update(users).set({ passwordHash: hashed }).where(eq(users.id, pending.userId));

    // Invalidate all existing sessions for this user
    await db.delete(sessions).where(eq(sessions.userId, pending.userId));
    await clearPendingAuth();

    return NextResponse.json({ ok: true });
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
  await clearPendingAuth();
  return NextResponse.json({ ok: true });
}
