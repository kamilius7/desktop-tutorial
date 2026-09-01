"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import { Files, Search, ScanLine, SortAsc, LibraryBig } from "lucide-react";
import type { NoteDTO } from "@/lib/types";
import { Button, EmptyState, Input, NoteCardSkeleton, Select, Tabs, Skeleton } from "@/components/ui";
import { NoteList } from "@/components/note-card";
import { useCurrentUser } from "@/components/shell";
import { safeJson } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => safeJson<{ notes: NoteDTO[] }>(r));

function NotesInner() {
  const user = useCurrentUser();
  const sp = useSearchParams();
  const [scope, setScope] = useState(sp.get("scope") ?? "mydept");
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [sort, setSort] = useState("recent");
  const [type, setType] = useState("");

  const url = useMemo(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    p.set("scope", scope);
    p.set("sort", sort);
    if (type) p.set("type", type);
    return `/api/notes?${p.toString()}`;
  }, [q, scope, sort, type]);

  const { data, isLoading } = useSWR(url, fetcher, { keepPreviousData: true });
  const notes = data?.notes ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink-950">Notes Library</h1>
          <p className="mt-1 text-sm text-ink-600">
            {isLoading ? <Skeleton className="inline-block h-4 w-40" /> : `${notes.length} note${notes.length === 1 ? "" : "s"} ${scope === "mydept" ? `in ${user?.department}` : scope === "all" ? "across campus" : scope === "following" ? "in your courses" : "bookmarked"}`}
          </p>
        </div>
        <Link href="/upload"><Button><ScanLine className="h-4 w-4" /> Scan & upload</Button></Link>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface p-3 shadow-sm shadow-ink-950/5">
        <Tabs
          value={scope}
          onChange={setScope}
          options={[
            { value: "mydept", label: "My department" },
            { value: "following", label: "My courses" },
            { value: "bookmarked", label: "Bookmarked" },
            { value: "all", label: "All campus" },
          ]}
        />
        <div className="relative min-w-48 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search titles, tags, courses…" className="h-[42px] pl-9" />
        </div>
        <Select value={type} onChange={(e) => setType(e.target.value)} className="!h-[42px] w-32">
          <option value="">All types</option>
          <option value="pdf">PDF</option>
          <option value="docx">Word</option>
          <option value="md">Notes (md)</option>
          <option value="scan">Scans</option>
        </Select>
        <div className="relative">
          <SortAsc className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Select value={sort} onChange={(e) => setSort(e.target.value)} className="!h-[42px] w-36 pl-9">
            <option value="recent">Newest</option>
            <option value="likes">Most liked</option>
            <option value="downloads">Most downloaded</option>
          </Select>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">{Array.from({ length: 6 }).map((_, i) => <NoteCardSkeleton key={i} />)}</div>
      ) : notes.length === 0 ? (
        <EmptyState
          icon={q ? <Search /> : scope === "bookmarked" ? <LibraryBig /> : <Files />}
          title={q ? `No results for “${q}”` : "Nothing here yet"}
          description={
            q
              ? "Try a different keyword, course code, or clear the search to browse everything."
              : scope === "bookmarked"
                ? "Tap the bookmark icon on any note and it will appear here for quick access."
                : scope === "following"
                  ? "Join a course first and its shared notes will appear in this feed."
                  : "Be the first to share notes with your department — scan a page and upload it."
          }
          action={q ? <Button variant="secondary" onClick={() => setQ("")}>Clear search</Button> : <Link href="/upload"><Button>Upload a note</Button></Link>}
        />
      ) : (
        <NoteList notes={notes} />
      )}
    </div>
  );
}

export default function NotesPage() {
  return (
    <Suspense fallback={<div className="grid gap-4 sm:grid-cols-2">{Array.from({ length: 6 }).map((_, i) => <NoteCardSkeleton key={i} />)}</div>}>
      <NotesInner />
    </Suspense>
  );
}
