"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { motion } from "framer-motion";
import { FileText, Heart, MessagesSquare, Search, UserRound, Users } from "lucide-react";
import type { StudentDTO } from "@/lib/types";
import { Avatar, Button, EmptyState, Input, Select, Skeleton } from "@/components/ui";
import { useCurrentUser } from "@/components/shell";
import { DEPARTMENTS } from "@/lib/constants";
import { safeJson } from "@/lib/utils";
import { toast } from "sonner";

const fetcher = (url: string) => fetch(url).then((r) => safeJson<{ students: StudentDTO[] }>(r));

export default function StudentsPage() {
  const router = useRouter();
  const user = useCurrentUser();
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const url = useMemo(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (dept) p.set("department", dept);
    return `/api/students?${p.toString()}`;
  }, [q, dept]);

  const { data, isLoading } = useSWR(url, fetcher, { keepPreviousData: true });
  const students = data?.students ?? [];

  const message = async (userId: string) => {
    setBusy(userId);
    try {
      const res = await fetch("/api/conversations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId }) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      router.push(`/messages?c=${d.conversation.id}`);
    } catch {
      toast.error("Couldn't open conversation");
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
<<<<<<< HEAD
        <h1 className="flex items-center gap-2.5 font-display text-2xl font-bold tracking-tight text-ink-950">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-ink-900"><Users className="h-5 w-5" /></span>
          Students on campus
        </h1>
        <p className="mt-1.5 text-sm text-ink-600">Find classmates, see what they share, and start a conversation.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface p-3 shadow-sm shadow-ink-950/5">
=======
        <h1 className="flex items-center gap-2.5 font-display text-2xl font-bold tracking-tight text-slate-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-600"><Users className="h-5 w-5" /></span>
          Students on campus
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">Find classmates, see what they share, and start a conversation.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3">
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
        <div className="relative min-w-48 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email…" className="h-[42px] pl-9" />
        </div>
        <Select value={dept} onChange={(e) => setDept(e.target.value)} className="!h-[42px] w-56">
          <option value="">All departments</option>
          {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44" />)}</div>
      ) : students.length === 0 ? (
        <EmptyState icon={<Users />} title="No students found" description="Try a different search or department filter." action={<Button variant="secondary" onClick={() => { setQ(""); setDept(""); }}>Reset filters</Button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {students.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
<<<<<<< HEAD
              className="rounded-2xl border border-border bg-surface p-5 card-lift shadow-sm shadow-ink-950/5"
=======
              className="rounded-2xl border border-slate-100 bg-white p-5 card-lift"
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
            >
              <div className="flex items-center gap-3">
                <Avatar name={s.name} color={s.avatarColor} size={48} />
                <div className="min-w-0">
<<<<<<< HEAD
                  <div className="truncate font-display text-[15px] font-bold text-ink-950">{s.name}</div>
                  <div className="truncate text-xs font-medium text-slate-400">{s.department} · {s.year}</div>
                </div>
              </div>
              {s.bio && <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-ink-600">{s.bio}</p>}
              <div className="mt-3 flex items-center gap-3 text-xs font-semibold text-ink-600">
=======
                  <div className="truncate font-display text-[15px] font-bold text-slate-900">{s.name}</div>
                  <div className="truncate text-xs font-medium text-slate-400">{s.department} · {s.year}</div>
                </div>
              </div>
              {s.bio && <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-slate-500">{s.bio}</p>}
              <div className="mt-3 flex items-center gap-3 text-xs font-semibold text-slate-400">
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
                <span className="inline-flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> {s.noteCount} notes</span>
                <span className="inline-flex items-center gap-1"><Heart className="h-3.5 w-3.5 text-rose-400" /> {s.likeCount} likes</span>
              </div>
              <Button variant="dark" size="sm" className="mt-4 w-full" onClick={() => message(s.id)} loading={busy === s.id}>
                <MessagesSquare className="h-3.5 w-3.5" /> Message
              </Button>
            </motion.div>
          ))}
        </div>
      )}

      {/* self note */}
      <p className="text-center text-xs text-slate-400">
        <UserRound className="mr-1 inline h-3.5 w-3.5" /> You&apos;re visible here as <span className="font-bold">{user?.name}</span> — complete your profile to stand out.
      </p>
    </div>
  );
}
