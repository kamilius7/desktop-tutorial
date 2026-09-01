import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { and, eq, gt } from "drizzle-orm";
<<<<<<< HEAD
import { LEGACY_SESSION_COOKIE, PENDING_COOKIE, SESSION_COOKIE } from "@/lib/cookie-name";

export { SESSION_COOKIE, PENDING_COOKIE };
=======

export const SESSION_COOKIE = "ss_session";
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
const SESSION_DAYS = 30;

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  department: string;
  bio: string;
  year: string;
  avatarColor: string;
<<<<<<< HEAD
  role?: "student" | "admin";
  emailVerified: boolean;
};

export type PendingAuth = {
  userId: string;
  email: string;
  purpose: "login" | "register" | "reset";
=======
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
};

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(sessions).values({ id: token, userId, expiresAt });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
<<<<<<< HEAD
    // Strict: the cookie is never sent on cross-site requests. This app has
    // no OAuth/top-level cross-site navigation flows, so strict is safe.
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    // NOTE: path must stay "/" — the cookie is read server-side by both API
    // routes and page layouts (/dashboard etc.), so a "/api" path restriction
    // would break page authentication. The `__Host-` prefix (production)
    // additionally requires path=/ and forbids a Domain attribute.
=======
    sameSite: "lax",
    expires: expiresAt,
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
    path: "/",
  });
}

export async function destroySession() {
  const jar = await cookies();
<<<<<<< HEAD
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
=======
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(sessions).where(eq(sessions.id, token));
  jar.delete(SESSION_COOKIE);
}

export async function getUser(): Promise<SessionUser | null> {
  // Auth is relaxed for previewing: if there is no signed-in session,
  // browse as the seeded demo student. A valid session cookie (after
  // register/login) still takes precedence.
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
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
<<<<<<< HEAD
        role: users.role,
        emailVerified: users.emailVerified,
=======
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(and(eq(sessions.id, token), gt(sessions.expiresAt, new Date())))
      .limit(1);
    if (rows[0]) return rows[0];
  }
<<<<<<< HEAD
  return null;
=======
  const demo = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      department: users.department,
      bio: users.bio,
      year: users.year,
      avatarColor: users.avatarColor,
    })
    .from(users)
    .where(eq(users.email, "maya@university.edu"))
    .limit(1);
  return demo[0] ?? null;
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
}
