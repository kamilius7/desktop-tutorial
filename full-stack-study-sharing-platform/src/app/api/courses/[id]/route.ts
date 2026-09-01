import { NextRequest, NextResponse } from "next/server";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/db";
import { courses, enrollments, notes } from "@/db/schema";
import { getUser } from "@/lib/session";
import { DEPARTMENTS } from "@/lib/constants";

type Ctx = { params: Promise<{ id: string }> };

async function loadCourse(id: string, viewerId: string) {
  const rows = await db
    .select({
      id: courses.id,
      code: courses.code,
      name: courses.name,
      department: courses.department,
      professor: courses.professor,
      semester: courses.semester,
      description: courses.description,
      color: courses.color,
      createdById: courses.createdById,
      createdAt: courses.createdAt,
      memberCount: sql<number>`(select count(*)::int from enrollments e where e.course_id = ${courses.id})`,
      noteCount: sql<number>`(select count(*)::int from notes n where n.course_id = ${courses.id})`,
      joined: sql<boolean>`exists(select 1 from enrollments e where e.course_id = ${courses.id} and e.user_id = ${viewerId})`,
    })
    .from(courses)
    .where(eq(courses.id, id))
    .limit(1);
  const r = rows[0];
  if (!r) return null;
  return {
    ...r,
    createdAt: r.createdAt.toISOString(),
    memberCount: Number(r.memberCount),
    noteCount: Number(r.noteCount),
    joined: Boolean(r.joined),
  };
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const course = await loadCourse(id, user.id);
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });
  return NextResponse.json({ course });
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const action = String(body.action ?? "");
  const exists = await db.select({ id: courses.id }).from(courses).where(eq(courses.id, id)).limit(1);
  if (!exists[0]) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  if (action === "join") {
    await db.insert(enrollments).values({ userId: user.id, courseId: id }).onConflictDoNothing();
  } else if (action === "leave") {
    await db.delete(enrollments).where(and(eq(enrollments.userId, user.id), eq(enrollments.courseId, id)));
  } else {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
  const course = await loadCourse(id, user.id);
  return NextResponse.json({ course });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const existing = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
  if (!existing[0]) return NextResponse.json({ error: "Course not found" }, { status: 404 });
  if (existing[0].createdById !== user.id) return NextResponse.json({ error: "Only the course creator can edit it" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const name = String(body.name ?? existing[0].name).trim();
  const professor = String(body.professor ?? existing[0].professor).trim();
  const description = String(body.description ?? existing[0].description).trim();
  const semester = String(body.semester ?? existing[0].semester).trim();
  const department = DEPARTMENTS.includes(body.department) ? String(body.department) : existing[0].department;
  if (name.length < 3) return NextResponse.json({ error: "Course name must be at least 3 characters" }, { status: 400 });

  await db.update(courses).set({ name, professor, description, semester, department }).where(eq(courses.id, id));
  const course = await loadCourse(id, user.id);
  return NextResponse.json({ course });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const existing = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
  if (!existing[0]) return NextResponse.json({ error: "Course not found" }, { status: 404 });
  if (existing[0].createdById !== user.id) return NextResponse.json({ error: "Only the course creator can delete it" }, { status: 403 });
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(notes).where(eq(notes.courseId, id));
  if (Number(count) > 0) {
    return NextResponse.json({ error: "This course has shared notes and cannot be deleted" }, { status: 409 });
  }
  await db.delete(courses).where(eq(courses.id, id));
  return NextResponse.json({ ok: true });
}
