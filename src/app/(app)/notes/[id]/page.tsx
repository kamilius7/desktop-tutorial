"use client";

import { use, useState } from "react";
import useSWR, { mutate as globalMutate } from "swr";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Download, Heart, Bookmark, MessageSquare, Pencil, Trash2, Send,
  MessageCircle, FileWarning, GraduationCap, ScanLine,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { NoteDTO, CommentDTO } from "@/lib/types";
import { Avatar, Badge, Button, ConfirmDialog, EmptyState, Field, Input, Modal, Skeleton, TagInput, Textarea, FileChip } from "@/components/ui";
import { useCurrentUser } from "@/components/shell";
import { formatBytes, safeJson } from "@/lib/utils";
import { toast } from "sonner";

const fetcher = (url: string) => fetch(url).then((r) => safeJson<{ note: NoteDTO }>(r));
const commentsFetcher = (url: string) => fetch(url).then((r) => safeJson<{ comments: CommentDTO[] }>(r));

const PREVIEWABLE = ["pdf", "md", "txt", "png", "jpg", "jpeg"];

export default function NoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const user = useCurrentUser();
  const { data, mutate, isLoading } = useSWR(`/api/notes/${id}`, fetcher);
  const { data: commentsData, mutate: mutateComments, isLoading: commentsLoading } = useSWR(`/api/notes/${id}/comments`, commentsFetcher);
  const note = data?.note;
  const comments = commentsData?.comments ?? [];

  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", description: "", tags: [] as string[] });
  const [saving, setSaving] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [chatBusy, setChatBusy] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Skeleton className="h-[70vh]" />
          <div className="space-y-4"><Skeleton className="h-48" /><Skeleton className="h-40" /></div>
        </div>
      </div>
    );
  }
  if (!note) {
    return <EmptyState icon={<FileWarning />} title="Note not found" description="It may have been removed by its owner." action={<Link href="/notes"><Button>Back to library</Button></Link>} />;
  }

  const mine = user?.id === note.uploaderId;
  const fileUrl = `/api/files/${note.fileName}?note=${note.id}`;
  const downloadUrl = `${fileUrl}&download=1&as=${encodeURIComponent(note.originalName)}`;

  const toggleLike = async () => {
    if (actionBusy) return;
    setActionBusy(true);
    const optimistic = { ...note, liked: !note.liked, likes: note.likes + (note.liked ? -1 : 1) };
    mutate({ note: optimistic }, { revalidate: false });
    try {
      const res = await fetch(`/api/notes/${id}/like`, { method: "POST" });
      const d = await res.json();
      if (!res.ok) throw new Error();
      mutate({ note: { ...optimistic, liked: d.liked, likes: d.likes } }, { revalidate: false });
    } catch {
      mutate();
      toast.error("Couldn't update like");
    } finally {
      setActionBusy(false);
    }
  };

  const toggleBookmark = async () => {
    const optimistic = { ...note, bookmarked: !note.bookmarked };
    mutate({ note: optimistic }, { revalidate: false });
    try {
      const res = await fetch(`/api/notes/${id}/bookmark`, { method: "POST" });
      const d = await res.json();
      if (!res.ok) throw new Error();
      mutate({ note: { ...optimistic, bookmarked: d.bookmarked } }, { revalidate: false });
      toast.success(d.bookmarked ? "Saved to bookmarks" : "Removed from bookmarks");
    } catch {
      mutate();
      toast.error("Couldn't update bookmark");
    }
  };

  const addComment = async (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;
    setSending(true);
    setDraft("");
    const optimistic: CommentDTO = {
      id: `tmp-${Date.now()}`, noteId: id, authorId: user!.id, authorName: user!.name, authorColor: user!.avatarColor, content, createdAt: new Date().toISOString(),
    };
    mutateComments({ comments: [optimistic, ...comments] }, { revalidate: false });
    mutate({ note: { ...note, commentCount: note.commentCount + 1 } }, { revalidate: false });
    try {
      const res = await fetch(`/api/notes/${id}/comments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content }) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      mutateComments({ comments: [d.comment, ...comments] }, { revalidate: false });
    } catch (err) {
      mutateComments(); mutate();
      setDraft(content);
      toast.error(err instanceof Error ? err.message : "Couldn't post comment");
    } finally {
      setSending(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    const keep = comments;
    mutateComments({ comments: comments.filter((c) => c.id !== commentId) }, { revalidate: false });
    mutate({ note: { ...note, commentCount: Math.max(0, note.commentCount - 1) } }, { revalidate: false });
    try {
      const res = await fetch(`/api/notes/${id}/comments?commentId=${commentId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Comment removed");
    } catch {
      mutateComments({ comments: keep }, { revalidate: false });
      mutate();
      toast.error("Couldn't delete comment");
    }
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/notes/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editForm) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      mutate({ note: d.note }, { revalidate: false });
      setEditOpen(false);
      toast.success("Note updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't update note");
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Note deleted");
      globalMutate((key) => typeof key === "string" && key.startsWith("/api/notes"), undefined, { revalidate: true });
      router.push(note ? `/courses/${note.courseId}` : "/notes");
    } catch {
      toast.error("Couldn't delete note");
      setDeleting(false);
    }
  };

  const startChat = async () => {
    if (mine || chatBusy) return;
    setChatBusy(true);
    try {
      const res = await fetch("/api/conversations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: note.uploaderId }) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      router.push(`/messages?c=${d.conversation.id}`);
    } catch {
      toast.error("Couldn't open conversation");
      setChatBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm font-bold text-ink-600 transition-colors hover:text-ink-950">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_330px]">
        {/* Left: preview + comments */}
        <div className="space-y-6">
          {/* Preview */}
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm shadow-ink-950/5">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-500">
                <FileChip type={note.fileType} />
                <span className="max-w-48 truncate">{note.originalName}</span>
                <span className="text-slate-300">·</span>
                <span>{formatBytes(note.fileSize)}</span>
              </div>
              <a href={downloadUrl}>
                <Button variant="secondary" size="sm"><Download className="h-3.5 w-3.5" /> Download</Button>
              </a>
            </div>
            {PREVIEWABLE.includes(note.fileType) ? (
              <iframe title={note.title} src={fileUrl} className="pdf-frame w-full bg-slate-100" />
            ) : (
              <div className="flex flex-col items-center justify-center bg-slate-50 py-20 text-center">
                <FileWarning className="mb-3 h-10 w-10 text-slate-300" />
                <p className="text-sm font-semibold text-slate-600">Preview isn&apos;t available for .{note.fileType} files</p>
                <p className="mt-1 text-xs text-slate-400">Download the file to open it on your device.</p>
                <a href={downloadUrl} className="mt-4"><Button size="sm"><Download className="h-3.5 w-3.5" /> Download file</Button></a>
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm shadow-ink-950/5">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink-950">
              <MessageCircle className="h-5 w-5 text-brand-500" /> Discussion
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">{note.commentCount}</span>
            </h2>
            <form onSubmit={addComment} className="mt-4 flex items-start gap-3">
              <Avatar name={user?.name ?? "?"} color={user?.avatarColor ?? "#6366f1"} size={36} />
              <div className="flex-1">
                <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Ask a question or leave feedback…" className="!min-h-[44px]" onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { addComment(e); } }} />
                <div className="mt-2 flex justify-end">
                  <Button type="submit" size="sm" loading={sending} disabled={!draft.trim()}><Send className="h-3.5 w-3.5" /> Comment</Button>
                </div>
              </div>
            </form>
            <div className="mt-2 space-y-4">
              {commentsLoading ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14" />)
              ) : comments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
                  No comments yet — start the discussion.
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {comments.map((c) => (
                    <motion.div key={c.id} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }} className="group flex items-start gap-3">
                      <Avatar name={c.authorName} color={c.authorColor} size={34} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-[13px] font-bold text-slate-800">{c.authorName}</span>
                          <span className="text-[11px] text-slate-400">{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
                        </div>
                        <p className="mt-0.5 whitespace-pre-wrap text-[13.5px] leading-relaxed text-slate-600">{c.content}</p>
                      </div>
                      {(c.authorId === user?.id || mine) && (
                        <button onClick={() => deleteComment(c.id)} className="rounded-lg p-1.5 text-slate-300 opacity-0 transition-all hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100" title="Delete comment">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>

        {/* Right: meta */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm shadow-ink-950/5">
            <div className="flex items-start gap-2">
              <h1 className="font-display text-xl font-bold leading-snug text-ink-950 text-balance">{note.title}</h1>
              {note.isScan && <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-extrabold text-emerald-600"><ScanLine className="h-3 w-3" /> SCAN</span>}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-ink-600 whitespace-pre-wrap">{note.description}</p>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {note.tags.map((t) => (
                <Link key={t} href={`/notes?q=${encodeURIComponent(t)}`} className="rounded-lg bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-500 transition-colors hover:bg-brand-50 hover:text-brand-600">#{t}</Link>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              {[
                { v: note.likes, l: "likes" },
                { v: note.downloads, l: "downloads" },
                { v: note.commentCount, l: "comments" },
              ].map((s) => (
                <div key={s.l} className="rounded-xl bg-slate-50 px-2 py-2.5">
                  <div className="font-display text-lg font-extrabold text-slate-900">{s.v}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{s.l}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex gap-2">
              <Button variant={note.liked ? "danger" : "secondary"} className="flex-1" onClick={toggleLike}>
                <Heart className={note.liked ? "h-4 w-4 fill-white" : "h-4 w-4"} /> {note.liked ? "Liked" : "Like"}
              </Button>
              <Button variant="secondary" className={note.bookmarked ? "!border-amber-300 !bg-amber-50 !text-amber-600" : ""} onClick={toggleBookmark}>
                <Bookmark className={note.bookmarked ? "h-4 w-4 fill-amber-500 text-amber-500" : "h-4 w-4"} />
              </Button>
            </div>

            {mine && (
              <div className="mt-2 flex gap-2">
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => { setEditForm({ title: note.title, description: note.description, tags: note.tags }); setEditOpen(true); }}>
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button variant="secondary" size="sm" className="!text-rose-600 hover:!bg-rose-50" onClick={() => setDeleteOpen(true)}>
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            )}
          </div>

          {/* Course */}
          <Link href={`/courses/${note.courseId}`} className="block rounded-2xl border border-border bg-surface p-5 card-lift shadow-sm shadow-ink-950/5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl font-display text-[13px] font-extrabold text-white" style={{ background: `linear-gradient(135deg, ${note.courseColor}, ${note.courseColor}bb)` }}>
                {note.courseCode.replace(/[0-9]/g, "").slice(0, 3)}
              </div>
              <div className="min-w-0">
                <Badge color={note.courseColor}>{note.courseCode}</Badge>
                <div className="mt-0.5 truncate text-sm font-bold text-slate-800">{note.courseName}</div>
              </div>
            </div>
            <div className="mt-3 text-xs font-medium text-slate-400">{note.department} · View course page →</div>
          </Link>

          {/* Uploader */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm shadow-ink-950/5">
            <div className="flex items-center gap-3">
              <Avatar name={note.uploaderName} color={note.uploaderColor} size={44} />
              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-slate-900">{note.uploaderName} {mine && <span className="text-xs font-semibold text-slate-400">(you)</span>}</div>
                <div className="flex items-center gap-1 text-xs font-medium text-slate-500"><GraduationCap className="h-3.5 w-3.5" /> {note.uploaderDepartment}</div>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-400">Shared {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}</p>
            {!mine && (
              <Button variant="dark" className="mt-4 w-full" onClick={startChat} loading={chatBusy}>
                <MessageSquare className="h-4 w-4" /> Message {note.uploaderName.split(" ")[0]}
              </Button>
            )}
          </div>
        </aside>
      </div>

      {/* Edit modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit note">
        <div className="space-y-4">
          <Field label="Title"><Input value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} /></Field>
          <Field label="Description"><Textarea value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} /></Field>
          <Field label="Tags"><TagInput tags={editForm.tags} onChange={(tags) => setEditForm((f) => ({ ...f, tags }))} /></Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={saveEdit} loading={saving}>Save changes</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={doDelete}
        loading={deleting}
        title="Delete this note?"
        message={`“${note.title}” and its file will be permanently removed. This cannot be undone.`}
      />
    </div>
  );
}
