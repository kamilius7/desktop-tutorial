"use client";

import { motion } from "framer-motion";
import { GraduationCap, FileText, ScanLine, MessagesSquare, BookOpenCheck, Sparkles } from "lucide-react";

const floatCards = [
  { icon: FileText, label: "AVL Trees — annotated", sub: "CS201 · 189 downloads", delay: 0, x: "6%", y: "16%" },
  { icon: ScanLine, label: "Midterm 2024 (scan)", sub: "CS201 · past exam", delay: 0.8, x: "58%", y: "34%" },
  { icon: MessagesSquare, label: "“thanks for the notes!!”", sub: "Maya → Jonas", delay: 1.4, x: "12%", y: "62%" },
  { icon: BookOpenCheck, label: "DP Cheat Sheet", sub: "CS301 · 342 downloads", delay: 2, x: "56%", y: "74%" },
];

export function AuthBrand() {
  return (
    <div className="relative hidden w-[52%] overflow-hidden bg-ink-900 lg:flex lg:flex-col">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-[480px] w-[480px] rounded-full bg-brand-500/25 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-[520px] w-[520px] rounded-full bg-violet-500/20 blur-[130px]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.35]" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "26px 26px" }} />

      <div className="relative z-10 flex items-center gap-3 p-10">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 shadow-lg shadow-brand-500/40">
          <GraduationCap className="h-5.5 w-5.5 text-white" />
        </div>
        <span className="font-display text-xl font-bold text-white">StudyShare</span>
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-center px-12 xl:px-16">
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-4xl font-bold leading-[1.12] text-white xl:text-5xl text-balance"
        >
          Every note your campus has to offer —
          <span className="bg-gradient-to-r from-brand-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent"> in one place.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 max-w-md text-[15px] leading-relaxed text-ink-100/60"
        >
          Scan lecture notes, share past exams, join your department&apos;s courses and chat with classmates. Built for students, by students.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-10 flex items-center gap-6 text-sm text-ink-100/70"
        >
          {[{ n: "24+", l: "shared notes" }, { n: "17", l: "live courses" }, { n: "8", l: "departments" }].map((s) => (
            <div key={s.l}>
              <div className="font-display text-2xl font-bold text-white">{s.n}</div>
              <div className="text-xs font-medium text-ink-100/45">{s.l}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Floating cards */}
      {floatCards.map((c, i) => (
        <motion.div
          key={i}
          className="absolute z-10 hidden xl:flex items-center gap-3 rounded-2xl bg-white/[0.07] p-3.5 pr-5 ring-1 ring-white/10 backdrop-blur-md"
          style={{ left: c.x, top: c.y }}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: [0, -8, 0], scale: 1 }}
          transition={{
            opacity: { duration: 0.6, delay: 0.5 + c.delay * 0.3 },
            scale: { duration: 0.6, delay: 0.5 + c.delay * 0.3 },
            y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: c.delay },
          }}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-brand-200">
            <c.icon className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="text-[13px] font-bold text-white">{c.label}</div>
            <div className="text-[11px] font-medium text-ink-100/50">{c.sub}</div>
          </div>
        </motion.div>
      ))}

      <div className="relative z-10 flex items-center gap-2 px-10 pb-8 text-xs font-medium text-ink-100/40">
        <Sparkles className="h-3.5 w-3.5" />
        Spring 2026 midterm season is live
      </div>
    </div>
  );
}
