import { NextRequest, NextResponse } from "next/server";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { courses, enrollments } from "@/db/schema";
import { getUser } from "@/lib/session";
import { COURSE_COLORS, DEPARTMENTS } from "@/lib/constants";
import type { CourseDTO } from "@/lib/types";

function courseFields(viewerId: string) {
  return {
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
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function rowToCourse(r: any): CourseDTO {
  return {
    ...r,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
    memberCount: Number(r.memberCount ?? 0),
    noteCount: Number(r.noteCount ?? 0),
    joined: Boolean(r.joined),
  };
}

export async function GET(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sp = req.nextUrl.searchParams;
  const q = sp.get("q")?.trim();
  const scope = sp.get("scope") ?? "all"; // all | mydept | joined
  const sort = sp.get("sort") ?? "code";

  const conditions = [];
  if (scope === "mydept") conditions.push(eq(courses.department, user.department));
  if (scope === "joined") {
    conditions.push(sql`exists(select 1 from enrollments e where e.course_id = ${courses.id} and e.user_id = ${user.id})`);
  }
  if (q) {
    const like = `%${q}%`;
    conditions.push(or(ilike(courses.code, like), ilike(courses.name, like), ilike(courses.professor, like)));
  }

  const rows = await db
    .select(courseFields(user.id))
    .from(courses)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(
      sort === "notes"
        ? desc(sql`(select count(*) from notes n where n.course_id = ${courses.id})`)
        : sort === "members"
          ? desc(sql`(select count(*) from enrollments e where e.course_id = ${courses.id})`)
          : asc(courses.code),
    )
    .limit(120);

  return NextResponse.json({ courses: rows.map(rowToCourse) });
}

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const code = String(body?.code ?? "").trim().toUpperCase();
  const name = String(body?.name ?? "").trim();
  const department = String(body?.department ?? "");
  const professor = String(body?.professor ?? "").trim();
  const semester = String(body?.semester ?? "Spring 2026").trim();
  const description = String(body?.description ?? "").trim();
  if (!/^[A-Z]{1,6}\s?\d{2,4}[A-Z]?$/.test(code)) return NextResponse.json({ error: "Course code should look like CS201" }, { status: 400 });
  if (name.length < 3) return NextResponse.json({ error: "Course name must be at least 3 characters" }, { status: 400 });
  if (!DEPARTMENTS.includes(department as (typeof DEPARTMENTS)[number])) return NextResponse.json({ error: "Please choose a valid department" }, { status: 400 });

  const dup = await db
    .select({ id: courses.id })
    .from(courses)
    .where(and(eq(courses.code, code.replace(/\s/g, "")), eq(courses.semester, semester)))
    .limit(1);
  if (dup[0]) return NextResponse.json({ error: `${code} already exists for ${semester}` }, { status: 409 });

  const color = COURSE_COLORS[Math.floor(Math.random() * COURSE_COLORS.length)];
  const [row] = await db
    .insert(courses)
    .values({ code: code.replace(/\s/g, ""), name, department, professor, semester, description, color, createdById: user.id })
    .returning({ id: courses.id });
  await db.insert(enrollments).values({ userId: user.id, courseId: row.id }).onConflictDoNothing();

  const fresh = await db.select(courseFields(user.id)).from(courses).where(eq(courses.id, row.id)).limit(1);
  return NextResponse.json({ course: rowToCourse(fresh[0]) }, { status: 201 });
}
