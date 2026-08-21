"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Bookmark, Download, MessageSquare, FileText, ScanLine } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn, formatBytes } from "@/lib/utils";
import type { NoteDTO } from "@/lib/types";
import { Avatar, Badge, FileChip } from "@/components/ui";
import { useCurrentUser } from "@/components/shell";
import { toast } from "sonner";

export function useNoteActions(note: NoteDTO, onDeleted?: (id: string) => void) {
  const [liked, setLiked] = useState(note.liked);
  const [likes, setLikes] = useState(note.likes);
  const [bookmarked, setBookmarked] = useState(note.bookmarked);
  const [likeBusy, setLikeBusy] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);

  const toggleLike = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (likeBusy) return;
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikes((l) => l + (nextLiked ? 1 : -1));
    setLikeBusy(true);
    try {
      const res = await fetch(`/api/notes/${note.id}/like`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setLiked(data.liked);
        setLikes(data.likes);
      } else throw new Error(data.error);
    } catch {
      setLiked(!nextLiked);
      setLikes((l) => l - (nextLiked ? 1 : -1));
      toast.error("Couldn't update like");
    } finally {
      setLikeBusy(false);
    }
  };

  const toggleBookmark = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (saveBusy) return;
    const next = !bookmarked;
    setBookmarked(next);
    setSaveBusy(true);
    try {
      const res = await fetch(`/api/notes/${note.id}/bookmark`, { method: "POST" });
      const data = await res.json();
      if (res.ok) setBookmarked(data.bookmarked);
      else throw new Error();
      toast.success(data.bookmarked ? "Saved to bookmarks" : "Removed from bookmarks");
    } catch {
      setBookmarked(!next);
      toast.error("Couldn't update bookmark");
    } finally {
      setSaveBusy(false);
    }
  };

  return { liked, likes, bookmarked, toggleLike, toggleBookmark, onDeleted };
}

export function NoteCard({ note, index = 0, onDeleted, onEdit }: { note: NoteDTO; index?: number; onDeleted?: (id: string) => void; onEdit?: (note: NoteDTO) => void }) {
  const router = useRouter();
  const user = useCurrentUser();
  const { liked, likes, bookmarked, toggleLike, toggleBookmark } = useNoteActions(note);
  const mine = user?.id === note.uploaderId;
  void onDeleted; void onEdit; void mine;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.4), ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/notes/${note.id}`} className="block">
        <article className="group rounded-2xl border border-slate-100 bg-white p-5 card-lift">
          <div className="flex items-start gap-4">
            <div
              className="relative flex h-12 w-11 shrink-0 items-center justify-center rounded-lg text-white shadow-sm"
              style={{ background: `linear-gradient(135deg, ${note.courseColor}, ${note.courseColor}bb)` }}
            >
              <FileText className="h-5 w-5" />
              <span className="absolute -bottom-1 -right-1"><FileChip type={note.fileType} /></span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-[15px] font-bold leading-snug text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2">
                  {note.title}
                </h3>
                {note.isScan && (
                  <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 shrink-0">
                    <ScanLine className="h-3 w-3" /> SCANNED
                  </span>
                )}
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-500 line-clamp-2">{note.description}</p>
              <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
                <Badge color={note.courseColor}>{note.courseCode}</Badge>
                <span className="inline-flex items-center gap-1.5 text-slate-500">
                  <Avatar name={note.uploaderName} color={note.uploaderColor} size={18} />
                  <span className="font-semibold text-slate-600">{note.uploaderName}</span>
                </span>
                <span className="text-slate-400">{formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}</span>
                <span className="text-slate-300">·</span>
                <span className="text-slate-400">{formatBytes(note.fileSize)}</span>
              </div>
              {note.tags.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {note.tags.slice(0, 4).map((t) => (
                    <button
                      key={t}
                      onClick={(e) => { e.preventDefault(); router.push(`/notes?q=${encodeURIComponent(t)}`); }}
                      className="rounded-md bg-slate-50 px-1.5 py-0.5 text-[11px] font-medium text-slate-500 transition-colors hover:bg-brand-50 hover:text-brand-600"
                    >
                      #{t}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 border-t border-slate-50 pt-3">
            <button
              onClick={toggleLike}
              className={cn("inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors", liked ? "text-rose-500" : "text-slate-400 hover:bg-slate-50 hover:text-rose-500")}
            >
              <Heart className={cn("h-4 w-4 transition-transform", liked && "fill-rose-500 scale-110")} /> {likes}
            </button>
            <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-400">
              <MessageSquare className="h-4 w-4" /> {note.commentCount}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-400">
              <Download className="h-4 w-4" /> {note.downloads}
            </span>
            <button
              onClick={toggleBookmark}
              className={cn("ml-auto inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors", bookmarked ? "text-amber-500" : "text-slate-400 hover:bg-slate-50 hover:text-amber-500")}
            >
              <Bookmark className={cn("h-4 w-4 transition-transform", bookmarked && "fill-amber-400 text-amber-400 scale-110")} />
              <span className="hidden sm:inline">{bookmarked ? "Saved" : "Save"}</span>
            </button>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}

export function NoteList({ notes, onDeleted, onEdit }: { notes: NoteDTO[]; onDeleted?: (id: string) => void; onEdit?: (note: NoteDTO) => void }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {notes.map((n, i) => (
        <NoteCard key={n.id} note={n} index={i} onDeleted={onDeleted} onEdit={onEdit} />
      ))}
    </div>
  );
}
