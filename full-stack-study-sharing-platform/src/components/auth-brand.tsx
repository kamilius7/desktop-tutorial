"use client";

<<<<<<< HEAD
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { GraduationCap, FileText, ScanLine, MessagesSquare, BookOpenCheck, Sparkles } from "lucide-react";

/* Constellation canvas */
function ConstellationCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;
    const nodeCount = 32;
    type Node = { x: number; y: number; vx: number; vy: number; r: number; pulse: number; pulseSpeed: number };
    const nodes: Node[] = [];

    const resize = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      const ratio = window.devicePixelRatio;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const init = () => {
      nodes.length = 0;
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: 2 + Math.random() * 3,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: 0.02 + Math.random() * 0.02,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;
        node.pulse += node.pulseSpeed;
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 130) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(134, 239, 172, ${(1 - distance / 130) * 0.25})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      for (const node of nodes) {
        const glow = 0.5 + 0.5 * Math.sin(node.pulse);
        const radius = node.r + glow * 1.5;
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius * 3);
        gradient.addColorStop(0, `rgba(74, 222, 128, ${0.7 + glow * 0.3})`);
        gradient.addColorStop(1, "rgba(74, 222, 128, 0)");
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(134, 239, 172, ${0.8 + glow * 0.2})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    const resizeObserver = new ResizeObserver(() => { resize(); init(); });
    resizeObserver.observe(canvas);
    resize();
    init();
    draw();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="constellation-canvas opacity-60" />;
}

const floatCards = [
  { icon: FileText, label: "AVL Trees — annotated", sub: "CS201 · 189 downloads", delay: 0, x: "6%", y: "18%" },
  { icon: ScanLine, label: "Midterm 2024 (scan)", sub: "CS301 · past exam", delay: 0.9, x: "55%", y: "36%" },
  { icon: MessagesSquare, label: '"thanks for the notes!!"', sub: "Maya → Jonas", delay: 1.5, x: "10%", y: "64%" },
  { icon: BookOpenCheck, label: "DP Cheat Sheet", sub: "CS301 · 342 downloads", delay: 2.1, x: "52%", y: "76%" },
=======
import { motion } from "framer-motion";
import { GraduationCap, FileText, ScanLine, MessagesSquare, BookOpenCheck, Sparkles } from "lucide-react";

const floatCards = [
  { icon: FileText, label: "AVL Trees — annotated", sub: "CS201 · 189 downloads", delay: 0, x: "6%", y: "16%" },
  { icon: ScanLine, label: "Midterm 2024 (scan)", sub: "CS201 · past exam", delay: 0.8, x: "58%", y: "34%" },
  { icon: MessagesSquare, label: "“thanks for the notes!!”", sub: "Maya → Jonas", delay: 1.4, x: "12%", y: "62%" },
  { icon: BookOpenCheck, label: "DP Cheat Sheet", sub: "CS301 · 342 downloads", delay: 2, x: "56%", y: "74%" },
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
];

export function AuthBrand() {
  return (
<<<<<<< HEAD
    <div className="relative hidden w-[52%] overflow-hidden bg-paper lg:flex lg:flex-col">
      <ConstellationCanvas />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_16%,transparent_0_150px,#cfc7bb_151px_152px,transparent_153px),radial-gradient(#e2673f_1px,transparent_1px)] bg-[length:auto,14px_14px] opacity-50" />

      <div className="relative z-10 flex items-center gap-3 p-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 shadow-lg shadow-brand-500/30">
            <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <span className="font-serif text-xl font-bold text-ink-900">StudyShare</span>
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-center px-12 xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-brand-400/40 bg-brand-500/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-brand-200"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400" />
          Campus Knowledge Network
        </motion.div>
=======
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
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
<<<<<<< HEAD
          className="font-serif text-5xl font-bold leading-[1.05] text-ink-900 xl:text-6xl text-balance"
        >
          Every note your campus has to offer —
          <span className="bg-gradient-to-r from-brand-300 to-brand-400 bg-clip-text text-transparent"> in one place.</span>
=======
          className="font-display text-4xl font-bold leading-[1.12] text-white xl:text-5xl text-balance"
        >
          Every note your campus has to offer —
          <span className="bg-gradient-to-r from-brand-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent"> in one place.</span>
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
<<<<<<< HEAD
          className="mt-5 max-w-md text-[15px] leading-relaxed text-ink-700"
=======
          className="mt-5 max-w-md text-[15px] leading-relaxed text-ink-100/60"
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
        >
          Scan lecture notes, share past exams, join your department&apos;s courses and chat with classmates. Built for students, by students.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
<<<<<<< HEAD
          className="mt-10 flex items-center gap-8"
        >
          {[{ n: "24+", l: "shared notes" }, { n: "17", l: "live courses" }, { n: "8", l: "departments" }].map((s) => (
            <div key={s.l} className="text-center">
              <div className="font-display text-2xl font-bold text-white">{s.n}</div>
              <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-ink-100/40">{s.l}</div>
=======
          className="mt-10 flex items-center gap-6 text-sm text-ink-100/70"
        >
          {[{ n: "24+", l: "shared notes" }, { n: "17", l: "live courses" }, { n: "8", l: "departments" }].map((s) => (
            <div key={s.l}>
              <div className="font-display text-2xl font-bold text-white">{s.n}</div>
              <div className="text-xs font-medium text-ink-100/45">{s.l}</div>
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
            </div>
          ))}
        </motion.div>
      </div>

      {/* Floating cards */}
      {floatCards.map((c, i) => (
        <motion.div
          key={i}
<<<<<<< HEAD
          className="absolute z-10 hidden items-center gap-3 rounded-2xl bg-white/[0.06] p-3.5 pr-5 ring-1 ring-white/10 backdrop-blur-md xl:flex"
          style={{ left: c.x, top: c.y }}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: [0, -9, 0], scale: 1 }}
          transition={{
            opacity: { duration: 0.6, delay: 0.6 + c.delay * 0.25 },
            scale: { duration: 0.6, delay: 0.6 + c.delay * 0.25 },
            y: { duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: c.delay },
          }}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/20 text-brand-200">
            <c.icon className="h-4 w-4" />
=======
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
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
          </div>
          <div>
            <div className="text-[13px] font-bold text-white">{c.label}</div>
            <div className="text-[11px] font-medium text-ink-100/50">{c.sub}</div>
          </div>
        </motion.div>
      ))}

<<<<<<< HEAD
      <div className="relative z-10 flex items-center gap-2 px-10 pb-8 text-xs font-medium text-ink-100/35">
=======
      <div className="relative z-10 flex items-center gap-2 px-10 pb-8 text-xs font-medium text-ink-100/40">
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
        <Sparkles className="h-3.5 w-3.5" />
        Spring 2026 midterm season is live
      </div>
    </div>
  );
}
