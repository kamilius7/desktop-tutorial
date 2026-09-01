"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Users, Check, Plus } from "lucide-react";
import type { CourseDTO } from "@/lib/types";
import { Button } from "@/components/ui";
import { toast } from "sonner";

export function JoinButton({ course, onChange, size = "sm" }: { course: CourseDTO; onChange?: (c: CourseDTO) => void; size?: "sm" | "md" }) {
  const [joined, setJoined] = useState(course.joined);
  const [busy, setBusy] = useState(false);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    const next = !joined;
    setJoined(next);
    setBusy(true);
    try {
      const res = await fetch(`/api/courses/${course.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: next ? "join" : "leave" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setJoined(data.course.joined);
      onChange?.(data.course);
      toast.success(data.course.joined ? `Joined ${course.code}` : `Left ${course.code}`);
    } catch {
      setJoined(!next);
      toast.error("Couldn't update enrollment");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button variant={joined ? "secondary" : "dark"} size={size} onClick={toggle} loading={busy}>
      {joined ? <><Check className="h-3.5 w-3.5" /> Joined</> : <><Plus className="h-3.5 w-3.5" /> Join</>}
    </Button>
  );
}

export function CourseCard({ course, index = 0, onChange }: { course: CourseDTO; index?: number; onChange?: (c: CourseDTO) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.35), ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/courses/${course.id}`} className="block h-full">
        <article className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-5 card-lift shadow-sm shadow-ink-950/5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl font-display text-sm font-extrabold text-white shadow-sm" style={{ background: `linear-gradient(135deg, ${course.color}, ${course.color}bb)` }}>
              {course.code.replace(/[0-9]/g, "").slice(0, 3)}
            </div>
            <span className="rounded-lg bg-muted/60 px-2 py-1 font-mono text-[11px] font-bold text-ink-700">{course.code}</span>
          </div>
          <h3 className="mt-3 font-display text-[15px] font-bold leading-snug text-ink-950 group-hover:text-brand-600 transition-colors line-clamp-2">{course.name}</h3>
          <p className="mt-0.5 text-xs font-medium text-ink-600">{course.professor || course.department}</p>
          <div className="mt-auto flex items-center justify-between pt-4">
            <div className="flex items-center gap-3 text-xs font-semibold text-ink-600">
              <span className="inline-flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{course.noteCount} notes</span>
              <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{course.memberCount}</span>
            </div>
            <JoinButton course={course} onChange={onChange} />
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
