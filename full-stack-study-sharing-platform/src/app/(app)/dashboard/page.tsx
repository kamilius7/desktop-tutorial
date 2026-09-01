"use client";

import useSWR from "swr";
<<<<<<< HEAD
import { useState } from "react";
import Link from "next/link";
import { FileText, Download, Heart, BookOpen, ScanLine, Search, ArrowRight, Flame, Bookmark, Trophy, Check, Clock, Play, Hash } from "lucide-react";
=======
import Link from "next/link";
import { FileText, Download, Heart, BookOpen, ScanLine, Search, ArrowRight, Flame, Bookmark, Trophy } from "lucide-react";
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
import { format } from "date-fns";
import type { DashboardDTO } from "@/lib/types";
import { StatCard, Skeleton, NoteCardSkeleton, Avatar, EmptyState, Button } from "@/components/ui";
import { NoteCard } from "@/components/note-card";
import { useCurrentUser } from "@/components/shell";
import { safeJson } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => safeJson<DashboardDTO>(r));

export default function DashboardPage() {
  const user = useCurrentUser();
  const { data, isLoading } = useSWR("/api/dashboard", fetcher, { refreshInterval: 30000 });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = user?.name.split(" ")[0] ?? "there";

<<<<<<< HEAD
  const [focus, setFocus] = useState("today");
  const [complete, setComplete] = useState<string[]>([]);
  const focusItems = [
    { id: "math", course: "MATH 241", title: "Integration by parts", meta: "Shared notes · 12 min", color: "#f7c6b8" },
    { id: "bio", course: "BIO 112", title: "Cellular respiration", meta: "Scan · 4 pages · 8 min", color: "#cbdcc4" },
    { id: "hist", course: "HIST 208", title: "The New Deal, 1933–39", meta: "Study guide · 18 min", color: "#d7d2ef" },
  ];
  return (
    <div className="space-y-8">
      <div>
        <div className="text-[10px] font-extrabold uppercase tracking-[.15em] text-primary">{format(new Date(), "EEEE, MMMM d")} · Campus feed</div>
        <h1 className="mt-2 font-display text-3xl font-extrabold leading-none tracking-tight text-ink-900 sm:text-4xl">{greeting},<br /><em className="font-serif text-primary">{firstName}.</em></h1>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Link href="/notes" className="rounded-2xl bg-[#ef684e] p-4 text-white shadow-sm transition hover:-translate-y-0.5"><Search className="h-5 w-5" /><b className="mt-2 block text-sm">Find notes</b><span className="mt-1 block text-xs text-white/75">Search your campus library</span></Link>
          <Link href="/upload" className="rounded-2xl border border-ink-900 bg-[#ded8f1] p-4 text-ink-900 shadow-sm transition hover:-translate-y-0.5"><ScanLine className="h-5 w-5" /><b className="mt-2 block text-sm">Scan & upload</b><span className="mt-1 block text-xs text-ink-700">Turn paper into shared notes</span></Link>
        </div>
      </div>

      <section className="hidden relative overflow-hidden rounded-[22px] bg-ink-900 p-5 text-white shadow-lg shadow-ink-900/15">
        <div className="absolute -right-8 -top-10 h-44 w-44 rounded-full border-[18px] border-white/5" />
        <div className="flex items-start justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-ink-100/70">Today&apos;s route</p><p className="mt-2 text-sm font-semibold">Three short stops. <span className="text-[#f7b95d]">Plenty of time.</span></p></div><b className="font-serif text-2xl">{complete.length}<small className="font-sans text-xs text-ink-100/70">/3</small></b></div>
        <div className="mt-4 h-1.5 rounded-full bg-white/15"><div className="h-full rounded-full bg-[#f7b95d]" style={{ width: `${complete.length * 33}%` }} /></div>
      </section>
      <section className="hidden"><div className="mb-3 flex items-center justify-between"><h2 className="text-[16px] font-extrabold">Your focus<br />queue</h2><div className="rounded-xl bg-muted p-1 text-[10px] font-bold"><button onClick={() => setFocus("today")} className={focus === "today" ? "rounded-lg bg-surface px-3 py-1.5 shadow-sm" : "px-3 py-1.5 text-ink-600"}>Today</button><button onClick={() => setFocus("saved")} className={focus === "saved" ? "rounded-lg bg-surface px-3 py-1.5 shadow-sm" : "px-3 py-1.5 text-ink-600"}>Saved</button></div></div>
      <div className="space-y-2">{focusItems.map((item) => <button key={item.id} onClick={() => setComplete((v) => v.includes(item.id) ? v.filter((x) => x !== item.id) : [...v, item.id])} className="flex w-full items-center gap-3 rounded-[18px] border border-border bg-surface p-3 text-left"><span className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: item.color }}><Hash className="h-5 w-5 text-ink-800" /></span><span className="min-w-0 flex-1"><span className="block text-[10px] font-extrabold tracking-wider text-ink-600">{item.course}</span><b className="block truncate text-sm">{item.title}</b><small className="text-[10px] text-ink-600">{item.meta}</small></span><span className={complete.includes(item.id) ? "flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white" : "h-6 w-6 rounded-full border border-[#d9d2c7]"}>{complete.includes(item.id) && <Check className="h-4 w-4" />}</span></button>)}</div></section>
      <section className="hidden flex items-center gap-3 border-y border-border py-4"><Clock className="h-5 w-5 text-primary" /><div className="flex-1"><span className="text-[10px] font-extrabold tracking-wider text-ink-600">NEXT UP · 2:30 PM</span><b className="block text-sm">25-minute focus sprint</b></div><button onClick={() => window.alert("Focus sprint started — 25 minutes on the clock.")} className="inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white"><Play className="h-3 w-3 fill-white" /> Start</button></section>
      <div className="flex items-end justify-between"><h2 className="font-display text-2xl font-extrabold leading-none text-ink-900">Your semester, in<br />motion</h2><span className="text-[11px] text-ink-600">Since September</span></div>
=======
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.14em] text-brand-500">{format(new Date(), "EEEE, MMMM d")}</div>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-slate-900 text-balance">
            {greeting}, {firstName}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Here&apos;s what&apos;s happening in <span className="font-semibold text-slate-700">{user?.department}</span> today.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/notes"><Button variant="secondary"><Search className="h-4 w-4" /> Find notes</Button></Link>
          <Link href="/upload"><Button><ScanLine className="h-4 w-4" /> Scan & upload</Button></Link>
        </div>
      </div>

      {/* Stats */}
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {isLoading || !data ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[92px]" />)
        ) : (
          <>
            <StatCard icon={<FileText />} label="Notes shared" value={data.stats.myNotes} accent="#6366f1" />
            <StatCard icon={<Download />} label="Total downloads" value={data.stats.totalDownloads} accent="#0ea5e9" />
            <StatCard icon={<Heart />} label="Karma received" value={data.stats.totalLikes} accent="#f43f5e" />
            <StatCard icon={<BookOpen />} label="Courses joined" value={data.stats.coursesJoined} accent="#10b981" />
          </>
        )}
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_340px]">
        {/* Feed */}
        <section>
          <div className="mb-4 flex items-center justify-between">
<<<<<<< HEAD
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink-950">
              <Flame className="h-5 w-5 text-brand-500" /> Fresh in your network
=======
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-slate-900">
              <Flame className="h-5 w-5 text-orange-500" /> Fresh in your network
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
            </h2>
            <Link href="/notes" className="inline-flex items-center gap-1 text-[13px] font-bold text-brand-600 hover:text-brand-700">
              View library <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {isLoading || !data ? (
            <div className="grid gap-4 sm:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <NoteCardSkeleton key={i} />)}</div>
          ) : data.feed.length === 0 ? (
            <EmptyState
              icon={<BookOpen />}
              title="Your feed is quiet"
              description="Join courses in your department to see the notes your classmates share, right here."
              action={<Link href="/courses"><Button>Browse courses</Button></Link>}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {data.feed.map((n, i) => <NoteCard key={n.id} note={n} index={i} />)}
            </div>
          )}
        </section>

        {/* Right rail */}
        <aside className="space-y-5">
          {/* Trending courses */}
<<<<<<< HEAD
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm shadow-ink-950/5">
            <h3 className="mb-4 flex items-center gap-2 font-display text-[15px] font-bold text-ink-950">
=======
          <div className="rounded-3xl border border-slate-100 bg-white p-5">
            <h3 className="mb-4 flex items-center gap-2 font-display text-[15px] font-bold text-slate-900">
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
              <Flame className="h-4 w-4 text-brand-500" /> Trending in {user?.department}
            </h3>
            <div className="space-y-1">
              {isLoading || !data
                ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14" />)
                : data.trendingCourses.map((c, i) => (
                    <Link key={c.id} href={`/courses/${c.id}`} className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-slate-50">
                      <span className="w-4 text-center font-display text-sm font-extrabold text-slate-300">{i + 1}</span>
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg font-display text-[11px] font-extrabold text-white" style={{ background: c.color }}>
                        {c.code.replace(/[0-9]/g, "").slice(0, 3)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13px] font-bold text-slate-800 group-hover:text-brand-600">{c.code} — {c.name}</div>
                        <div className="text-[11px] font-medium text-slate-400">{c.noteCount} notes · {c.memberCount} members</div>
                      </div>
                    </Link>
                  ))}
              {data && data.trendingCourses.length === 0 && <p className="py-6 text-center text-xs text-slate-400">No courses in your department yet — create the first!</p>}
            </div>
            <Link href="/courses" className="mt-3 block text-center text-[13px] font-bold text-brand-600 hover:text-brand-700">Browse all courses</Link>
          </div>

          {/* Top contributors */}
<<<<<<< HEAD
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm shadow-ink-950/5">
            <h3 className="mb-4 flex items-center gap-2 font-display text-[15px] font-bold text-ink-950">
=======
          <div className="rounded-3xl border border-slate-100 bg-white p-5">
            <h3 className="mb-4 flex items-center gap-2 font-display text-[15px] font-bold text-slate-900">
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
              <Trophy className="h-4 w-4 text-amber-500" /> Top contributors
            </h3>
            <div className="space-y-1">
              {isLoading || !data
                ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12" />)
                : data.topContributors.map((s, i) => (
                    <Link key={s.id} href="/students" className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-slate-50">
                      <Avatar name={s.name} color={s.avatarColor} size={34} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13px] font-bold text-slate-800">{s.name}</div>
                        <div className="text-[11px] font-medium text-slate-400">{s.department}</div>
                      </div>
                      <div className="flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-extrabold text-rose-500">
                        <Heart className="h-3 w-3 fill-rose-500" /> {s.likeCount}
                      </div>
                      {i === 0 && <span className="text-amber-500"><Trophy className="h-3.5 w-3.5 fill-amber-400" /></span>}
                    </Link>
                  ))}
            </div>
          </div>

          {/* Saved for later */}
<<<<<<< HEAD
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm shadow-ink-950/5">
            <h3 className="mb-4 flex items-center gap-2 font-display text-[15px] font-bold text-ink-950">
=======
          <div className="rounded-3xl border border-slate-100 bg-white p-5">
            <h3 className="mb-4 flex items-center gap-2 font-display text-[15px] font-bold text-slate-900">
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
              <Bookmark className="h-4 w-4 text-amber-500" /> Saved for later
            </h3>
            <div className="space-y-1">
              {isLoading || !data
                ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-11" />)
                : data.recentBookmarks.length === 0
                  ? <p className="py-4 text-center text-xs text-slate-400">Bookmark notes to reach them quickly.</p>
                  : data.recentBookmarks.slice(0, 3).map((n) => (
                      <Link key={n.id} href={`/notes/${n.id}`} className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-slate-50">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg text-white" style={{ background: n.courseColor }}>
                          <FileText className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[13px] font-bold text-slate-800 group-hover:text-brand-600">{n.title}</div>
                          <div className="text-[11px] font-medium text-slate-400">{n.courseCode}</div>
                        </div>
                      </Link>
                    ))}
            </div>
            <Link href="/bookmarks" className="mt-3 block text-center text-[13px] font-bold text-brand-600 hover:text-brand-700">All bookmarks</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
