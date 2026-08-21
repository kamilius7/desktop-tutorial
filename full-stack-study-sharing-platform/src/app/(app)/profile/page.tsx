"use client";

import { useState } from "react";
import useSWR, { mutate as globalMutate } from "swr";
import { useRouter } from "next/navigation";
import { FileText, Download, Heart, UserRound, Pencil, Trash2, Mail, Building2, Check } from "lucide-react";
import type { NoteDTO, UserDTO } from "@/lib/types";
import { Avatar, Button, Field, Input, NoteCardSkeleton, Select, StatCard, Textarea, ConfirmDialog } from "@/components/ui";
import { useCurrentUser } from "@/components/shell";
import { NoteList } from "@/components/note-card";
import { DEPARTMENTS, YEARS, AVATAR_COLORS } from "@/lib/constants";
import { cn, safeJson } from "@/lib/utils";
import { toast } from "sonner";

const notesFetcher = (url: string) => fetch(url).then((r) => safeJson<{ notes: NoteDTO[] }>(r));
const dashFetcher = (url: string) => fetch(url).then((r) => safeJson<{ stats: { myNotes: number; totalDownloads: number; totalLikes: number } }>(r));

export default function ProfilePage() {
  const router = useRouter();
  const user = useCurrentUser();
  const [form, setForm] = useState<UserDTO | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<NoteDTO | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data: notesData, mutate: mutateNotes, isLoading: notesLoading } = useSWR("/api/notes?scope=mine", notesFetcher);
  const { data: dashData } = useSWR("/api/dashboard", dashFetcher);
  const notes = notesData?.notes ?? [];
  const current = form ?? user;

  const update = (patch: Partial<UserDTO>) => {
    setForm({ ...(current as UserDTO), ...patch });
    setDirty(true);
  };

  const save = async () => {
    if (!current) return;
    setSaving(true);
    try {
      const res = await fetch("/api/auth/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(current) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      toast.success("Profile updated");
      setDirty(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save profile");
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/notes/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      mutateNotes({ notes: notes.filter((n) => n.id !== deleteTarget.id) }, { revalidate: false });
      toast.success("Note deleted");
      setDeleteTarget(null);
      globalMutate("/api/dashboard");
    } catch {
      toast.error("Couldn't delete note");
    } finally {
      setDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Profile card */}
      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white">
        <div className="h-24 bg-gradient-to-r from-ink-900 via-ink-800 to-brand-700 relative">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
        </div>
        <div className="px-6 pb-6 sm:px-8">
          <div className="-mt-10 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="relative">
                <Avatar name={current?.name ?? "?"} color={current?.avatarColor ?? "#6366f1"} size={84} className="ring-4 ring-white shadow-lg" />
                {dirty && <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-white ring-2 ring-white"><Pencil className="h-2.5 w-2.5" /></span>}
              </div>
              <div className="pb-1">
                <h1 className="font-display text-2xl font-bold text-slate-900">{user.name}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-slate-400">
                  <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {user.email}</span>
                  <span className="inline-flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {user.department}</span>
                </div>
              </div>
            </div>
            <Button onClick={save} loading={saving} disabled={!dirty}>
              <Check className="h-4 w-4" /> {dirty ? "Save changes" : "Saved"}
            </Button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Display name">
              <Input value={current?.name ?? ""} onChange={(e) => update({ name: e.target.value })} />
            </Field>
            <Field label="Year of study">
              <Select value={current?.year ?? ""} onChange={(e) => update({ year: e.target.value })}>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </Select>
            </Field>
            <Field label="Department">
              <Select value={current?.department ?? ""} onChange={(e) => update({ department: e.target.value })}>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </Select>
            </Field>
            <Field label="Avatar color">
              <div className="flex h-11 items-center gap-2">
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => update({ avatarColor: c })}
                    className={cn("h-7 w-7 rounded-full transition-transform hover:scale-110", current?.avatarColor === c && "ring-2 ring-slate-900 ring-offset-2")}
                    style={{ background: c }}
                    aria-label={`Color ${c}`}
                  />
                ))}
              </div>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Bio" hint="Shown on the students directory — 300 characters max">
                <Textarea value={current?.bio ?? ""} onChange={(e) => update({ bio: e.target.value })} placeholder="What do you study? What are your notes famous for?" className="!min-h-[80px]" maxLength={300} />
              </Field>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={<FileText />} label="Notes shared" value={dashData?.stats.myNotes ?? "…"} accent="#6366f1" />
        <StatCard icon={<Download />} label="Downloads earned" value={dashData?.stats.totalDownloads ?? "…"} accent="#0ea5e9" />
        <StatCard icon={<Heart />} label="Karma received" value={dashData?.stats.totalLikes ?? "…"} accent="#f43f5e" />
      </div>

      {/* My uploads */}
      <div>
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-slate-900">
          <UserRound className="h-5 w-5 text-brand-500" /> My uploads
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">{notes.length}</span>
        </h2>
        {notesLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">{Array.from({ length: 2 }).map((_, i) => <NoteCardSkeleton key={i} />)}</div>
        ) : notes.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 px-8 py-12 text-center">
            <FileText className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">You haven&apos;t shared any notes yet</p>
            <p className="mt-1 text-xs text-slate-400">Your first upload earns you a spot in the contributors list.</p>
            <Button className="mt-5" onClick={() => router.push("/upload")}>Scan & upload</Button>
          </div>
        ) : (
          <div className="space-y-3">
            <NoteList notes={notes} />
            <div className="grid gap-4 sm:grid-cols-2">
              {notes.map((n) => (
                <div key={`manage-${n.id}`} className="flex items-center justify-end gap-2 rounded-xl bg-white/60 px-2 py-1.5 -mt-2">
                  <span className="mr-auto truncate pl-2 text-xs font-semibold text-slate-400">Manage “{n.title}”</span>
                  <Button variant="ghost" size="sm" onClick={() => router.push(`/notes/${n.id}`)}><Pencil className="h-3.5 w-3.5" /> Open & edit</Button>
                  <Button variant="ghost" size="sm" className="!text-rose-500 hover:!bg-rose-50" onClick={() => setDeleteTarget(n)}><Trash2 className="h-3.5 w-3.5" /> Delete</Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={doDelete}
        loading={deleting}
        title="Delete this note?"
        message={deleteTarget ? `“${deleteTarget.title}” will be permanently removed, including its file, likes and comments.` : ""}
      />
    </div>
  );
}
