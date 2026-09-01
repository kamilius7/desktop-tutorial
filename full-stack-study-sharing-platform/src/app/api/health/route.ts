import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

<<<<<<< HEAD
/**
 * Liveness probe. Deliberately returns no version, stack, or config detail —
 * only an opaque ok/fail — so it is safe to expose unauthenticated.
 * Full env validation (throw-at-startup) lives in src/lib/env.ts.
 */
export async function GET() {
  if (!process.env.DATABASE_URL || !process.env.MESSAGE_ENCRYPTION_KEY) {
    return Response.json({ ok: false }, { status: 503 });
  }
=======
export async function GET() {
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
  try {
    await db.execute(sql`select 1`);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
