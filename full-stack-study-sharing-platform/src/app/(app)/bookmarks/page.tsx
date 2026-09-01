"use client";

import useSWR from "swr";
import Link from "next/link";
import { Bookmark, BookmarkX } from "lucide-react";
import type { NoteDTO } from "@/lib/types";
import { Button, EmptyState, NoteCardSkeleton } from "@/components/ui";
import { NoteList } from "@/components/note-card";
import { safeJson } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => safeJson<{ notes: NoteDTO[] }>(r));

export default function BookmarksPage() {
  const { data, isLoading } = useSWR("/api/notes?scope=bookmarked", fetcher, { refreshInterval: 10000 });
  const notes = data?.notes ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2.5 font-display text-2xl font-bold tracking-tight text-ink-950">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Bookmark className="h-5 w-5" /></span>
          Bookmarks
        </h1>
        <p className="mt-1.5 text-sm text-ink-600">
          {isLoading ? "Loading…" : `${notes.length} saved note${notes.length === 1 ? "" : "s"} — your personal exam-season stash.`}
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <NoteCardSkeleton key={i} />)}</div>
      ) : notes.length === 0 ? (
        <EmptyState
          icon={<BookmarkX />}
          title="No bookmarks yet"
          description="Tap the Save button on any note and it will live here — perfect for exam week."
          action={<Link href="/notes"><Button>Browse the library</Button></Link>}
        />
      ) : (
        <NoteList notes={notes} />
      )}
    </div>
  );
}
