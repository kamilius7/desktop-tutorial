"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { BookOpen, Plus, Search } from "lucide-react";
import type { CourseDTO } from "@/lib/types";
import { Button, EmptyState, Field, Input, Modal, Select, Skeleton, Tabs, Textarea } from "@/components/ui";
import { CourseCard } from "@/components/course-card";
import { useCurrentUser } from "@/components/shell";
import { DEPARTMENTS } from "@/lib/constants";
import { safeJson } from "@/lib/utils";
import { toast } from "sonner";

const fetcher = (url: string) => fetch(url).then((r) => safeJson<{ courses: CourseDTO[] }>(r));

function CourseSkeleton() {
  return <Skeleton className="h-[172px]" />;
}

export default function CoursesPage() {
  const user = useCurrentUser();
  const [tab, setTab] = useState("mydept");
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", department: user?.department ?? "", professor: "", semester: "Spring 2026", description: "" });
  const [saving, setSaving] = useState(false);

  const url = useMemo(() => {
    const p = new URLSearchParams();
    if (tab !== "all") p.set("scope", tab);
    if (q.trim()) p.set("q", q.trim());
    return `/api/courses?${p.toString()}`;
  }, [tab, q]);

  const { data, isLoading, mutate } = useSWR(url, fetcher, { keepPreviousData: true });
  let courses = data?.courses ?? [];
  if (dept) courses = courses.filter((c) => c.department === dept);

  const upsertCourse = (c: CourseDTO) => {
    mutate({ courses: (data?.courses ?? []).map((x) => (x.id === c.id ? c : x)) }, { revalidate: false });
  };

  const createCourse = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/courses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      toast.success(`${d.course.code} created — you're enrolled`);
      setCreateOpen(false);
      setForm({ code: "", name: "", department: user?.department ?? "", professor: "", semester: "Spring 2026", description: "" });
      mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't create course");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
<<<<<<< HEAD
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink-950">Courses</h1>
          <p className="mt-1 text-sm text-ink-600">Join courses to follow their notes and classmates.</p>
=======
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">Courses</h1>
          <p className="mt-1 text-sm text-slate-500">Join courses to follow their notes and classmates.</p>
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
        </div>
        <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" /> New course</Button>
      </div>

<<<<<<< HEAD
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface p-3 shadow-sm shadow-ink-950/5">
=======
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3">
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
        <Tabs value={tab} onChange={setTab} options={[{ value: "mydept", label: "My department" }, { value: "joined", label: "Joined" }, { value: "all", label: "All campus" }]} />
        <div className="relative min-w-48 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search code, name, professor…" className="h-[42px] pl-9" />
        </div>
        <Select value={dept} onChange={(e) => setDept(e.target.value)} className="!h-[42px] w-52">
          <option value="">All departments</option>
          {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <CourseSkeleton key={i} />)}</div>
      ) : courses.length === 0 ? (
        <EmptyState
          icon={<BookOpen />}
          title={q ? `No courses match “${q}”` : tab === "joined" ? "You haven't joined any courses yet" : "No courses here yet"}
          description={q ? "Try another search term." : tab === "joined" ? "Browse your department or all campus and join the ones you're taking." : "Create the first course and invite your classmates."}
          action={tab === "joined" ? <Button variant="secondary" onClick={() => setTab("mydept")}>Browse my department</Button> : <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" /> Create a course</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c, i) => <CourseCard key={c.id} course={c} index={i} onChange={upsertCourse} />)}
        </div>
      )}

      {/* Create modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create a course" wide>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Course code" hint="e.g. CS201">
            <Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} placeholder="CS201" />
          </Field>
          <Field label="Semester">
            <Input value={form.semester} onChange={(e) => setForm((f) => ({ ...f, semester: e.target.value }))} placeholder="Spring 2026" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Course name">
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Data Structures" />
            </Field>
          </div>
          <Field label="Department">
            <Select value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </Select>
          </Field>
          <Field label="Professor (optional)">
            <Input value={form.professor} onChange={(e) => setForm((f) => ({ ...f, professor: e.target.value }))} placeholder="Prof. A. Scholar" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description (optional)">
              <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="What does this course cover? Weekly labs? Project?" />
            </Field>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button onClick={createCourse} loading={saving} disabled={!form.code || !form.name || !form.department}>Create course</Button>
        </div>
      </Modal>
    </div>
  );
}
