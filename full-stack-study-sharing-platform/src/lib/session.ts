import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { and, eq, gt } from "drizzle-orm";
import { LEGACY_SESSION_COOKIE, PENDING_COOKIE, SESSION_COOKIE } from "@/lib/cookie-name";

export { SESSION_COOKIE, PENDING_COOKIE };
const SESSION_DAYS = 30;

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  department: string;
  bio: string;
  year: string;
  avatarColor: string;
  role?: "student" | "admin";
  emailVerified: boolean;
};

export type PendingAuth = {
  userId: string;
  email: string;
  purpose: "login" | "register" | "reset";
};

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(sessions).values({ id: token, userId, expiresAt });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    // Strict: the cookie is never sent on cross-site requests. This app has
    // no OAuth/top-level cross-site navigation flows, so strict is safe.
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    // NOTE: path must stay "/" — the cookie is read server-side by both API
    // routes and page layouts (/dashboard etc.), so a "/api" path restriction
    // would break page authentication. The `__Host-` prefix (production)
    // additionally requires path=/ and forbids a Domain attribute.
    path: "/",
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value ?? jar.get(LEGACY_SESSION_COOKIE)?.value;
  if (token) await db.delete(sessions).where(eq(sessions.id, token));
  jar.delete(SESSION_COOKIE);
  // Clear cookies issued under the pre-`__Host-` name as well.
  jar.delete(LEGACY_SESSION_COOKIE);
}

/** Clear the signed-out marker; call after successful login/register. */
export async function clearSignedOut() {
  return;
}

export async function setPendingAuth(data: PendingAuth) {
  const jar = await cookies();
  jar.set(PENDING_COOKIE, JSON.stringify(data), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 600, // 10 minutes
    path: "/",
  });
}

export async function getPendingAuth(): Promise<PendingAuth | null> {
  const jar = await cookies();
  const val = jar.get(PENDING_COOKIE)?.value;
  if (!val) return null;
  try {
    const parsed = JSON.parse(val);
    if (parsed && parsed.userId && parsed.purpose) return parsed as PendingAuth;
  } catch {}
  return null;
}

export async function clearPendingAuth() {
  const jar = await cookies();
  jar.delete(PENDING_COOKIE);
}

export async function getUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        department: users.department,
        bio: users.bio,
        year: users.year,
        avatarColor: users.avatarColor,
        role: users.role,
        emailVerified: users.emailVerified,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(and(eq(sessions.id, token), gt(sessions.expiresAt, new Date())))
      .limit(1);
    if (rows[0]) return rows[0];
  }
  return null;
}
