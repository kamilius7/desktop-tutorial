import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { and, eq, gt } from "drizzle-orm";

export const SESSION_COOKIE = "ss_session";
const SESSION_DAYS = 30;

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  department: string;
  bio: string;
  year: string;
  avatarColor: string;
};

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(sessions).values({ id: token, userId, expiresAt });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(sessions).where(eq(sessions.id, token));
  jar.delete(SESSION_COOKIE);
}

export async function getUser(): Promise<SessionUser | null> {
  // Auth is relaxed for previewing: if there is no signed-in session,
  // browse as the seeded demo student. A valid session cookie (after
  // register/login) still takes precedence.
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
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(and(eq(sessions.id, token), gt(sessions.expiresAt, new Date())))
      .limit(1);
    if (rows[0]) return rows[0];
  }
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
}
