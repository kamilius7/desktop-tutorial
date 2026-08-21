"use client";

import { use, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Users, GraduationCap, Calendar, Pencil, Trash2, ScanLine, FilePlus2 } from "lucide-react";
import type { CourseDTO, NoteDTO } from "@/lib/types";
import { Button, ConfirmDialog, EmptyState, Field, Input, Modal, NoteCardSkeleton, Select, Skeleton, Textarea } from "@/components/ui";
import { NoteList } from "@/components/note-card";
import { JoinButton } from "@/components/course-card";
import { useCurrentUser } from "@/components/shell";
import { DEPARTMENTS } from "@/lib/constants";
import { safeJson } from "@/lib/utils";
import { toast } from "sonner";

const courseFetcher = (url: string) => fetch(url).then((r) => safeJson<{ course: CourseDTO }>(r));
const notesFetcher = (url: string) => fetch(url).then((r) => safeJson<{ notes: NoteDTO[] }>(r));

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const user = useCurrentUser();
  const { data, mutate, isLoading } = useSWR(`/api/courses/${id}`, courseFetcher);
  const { data: notesData, isLoading: notesLoading } = useSWR(`/api/notes?courseId=${id}`, notesFetcher);
  const course = data?.course;
  const notes = notesData?.notes ?? [];

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", professor: "", department: "", semester: "", description: "" });

  if (isLoading) {
    return <div className="space-y-6"><Skeleton className="h-8 w-36" /><Skeleton className="h-44" /><div className="grid gap-4 sm:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <NoteCardSkeleton key={i} />)}</div></div>;
  }
  if (!course) {
    return <EmptyState icon={<BookOpen />} title="Course not found" description="This course may have been deleted." action={<Link href="/courses"><Button>Back to courses</Button></Link>} />;
  }

  const isCreator = course.createdById === user?.id;

  const saveEdit = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/courses/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      mutate({ course: d.course }, { revalidate: false });
      setEditOpen(false);
      toast.success("Course updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't update course");
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/courses/${id}`, { method: "DELETE" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      toast.success("Course deleted");
      router.push("/courses");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't delete course");
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 transition-colors hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-3xl text-white" style={{ background: `linear-gradient(120deg, ${course.color}, ${course.color}99)` }}>
        <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4 p-6 sm:p-8">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur-sm">{course.code} · {course.semester}</div>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-balance">{course.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] font-medium text-white/85">
              <span className="inline-flex items-center gap-1.5"><GraduationCap className="h-4 w-4" /> {course.department}</span>
              {course.professor && <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4" /> {course.professor}</span>}
              <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {course.semester}</span>
            </div>
            {course.description && <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/80">{course.description}</p>}
            <div className="mt-5 flex items-center gap-5 text-sm font-bold">
              <span>{course.noteCount} notes</span>
              <span>{course.memberCount} members</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/upload?course=${course.id}`}>
              <Button className="!bg-white text-slate-900 hover:!bg-white/90"><ScanLine className="h-4 w-4" /> Share notes</Button>
            </Link>
            <div className="[&_button]:!border-white/30 [&_button]:!text-white [&_button]:hover:!bg-white/10">
              <JoinButton course={course} size="md" onChange={(c) => mutate({ course: c }, { revalidate: false })} />
            </div>
            {isCreator && (
              <>
                <Button variant="secondary" size="md" className="!border-white/30 !bg-white/10 !text-white hover:!bg-white/20" onClick={() => { setForm({ name: course.name, professor: course.professor, department: course.department, semester: course.semester, description: course.description }); setEditOpen(true); }}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="secondary" size="md" className="!border-white/30 !bg-white/10 !text-white hover:!bg-rose-500/80" onClick={() => setDeleteOpen(true)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-slate-900">
            <BookOpen className="h-5 w-5 text-brand-500" /> Shared notes
          </h2>
          <Link href={`/upload?course=${course.id}`}><Button variant="secondary" size="sm"><FilePlus2 className="h-3.5 w-3.5" /> Add yours</Button></Link>
        </div>
        {notesLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <NoteCardSkeleton key={i} />)}</div>
        ) : notes.length === 0 ? (
          <EmptyState
            icon={<ScanLine />}
            title={`No notes for ${course.code} yet`}
            description="Scan your lecture notes or upload a past exam — your classmates in this course will see it instantly."
            action={<Link href={`/upload?course=${course.id}`}><Button>Upload the first note</Button></Link>}
          />
        ) : (
          <NoteList notes={notes} />
        )}
      </div>

      {/* Edit modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={`Edit ${course.code}`} wide>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Course name"><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></Field>
          </div>
          <Field label="Department">
            <Select value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </Select>
          </Field>
          <Field label="Professor"><Input value={form.professor} onChange={(e) => setForm((f) => ({ ...f, professor: e.target.value }))} /></Field>
          <Field label="Semester"><Input value={form.semester} onChange={(e) => setForm((f) => ({ ...f, semester: e.target.value }))} /></Field>
          <Field label="Description"><Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></Field>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={saveEdit} loading={saving}>Save changes</Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={doDelete}
        loading={deleting}
        title={`Delete ${course.code}?`}
        message={course.noteCount > 0 ? "This course still has shared notes, so it can't be deleted. Remove the notes first." : "The course and its enrollments will be permanently removed."}
      />
    </div>
  );
}
