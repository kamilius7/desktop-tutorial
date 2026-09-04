"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BookOpen, Check, Files, GraduationCap, Users } from "lucide-react";

const STORAGE_KEY = "studyshare-intro-v1";

const slides = [
  {
    eyebrow: "Find your focus",
    title: "Every note you need, in one place.",
    description: "Browse course notes, past exams, and department resources without the noise.",
    icon: BookOpen,
    label: "AVL Trees — annotated",
    meta: "CS 240 · shared notes",
  },
  {
    eyebrow: "Share what works",
    title: "Make good study material travel further.",
    description: "Scan, upload, and organize the resources that helped you understand it.",
    icon: Files,
    label: "Midterm 2024 (scan)",
    meta: "MATH 221 · past exam",
  },
  {
    eyebrow: "Learn together",
    title: "Your campus knowledge, shared.",
    description: "Join course conversations, find classmates, and keep moving forward together.",
    icon: Users,
    label: "Thanks for the notes!",
    meta: "ENG 108 · course chat",
  },
];

export function WelcomeScreen() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState(0);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    setShowIntro(window.localStorage.getItem(STORAGE_KEY) !== "complete");
    setReady(true);
  }, []);

  const finish = () => {
    window.localStorage.setItem(STORAGE_KEY, "complete");
    router.push("/dashboard");
  };

  if (!ready || !showIntro) return null;
  const slide = slides[step];
  const Icon = slide.icon;

  return (
    <main className="min-h-screen overflow-hidden bg-paper text-ink-950">
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-5 sm:px-8 sm:py-7">
        <div className="pointer-events-none absolute inset-0 bg-dots opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent_82%)]" />
        <header className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-brand-500 shadow-lg shadow-brand-500/20">
              <GraduationCap className="size-5 text-white" />
            </div>
            <div>
              <div className="font-display text-[17px] font-extrabold leading-none text-ink-900">StudyShare</div>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-600">Campus network</div>
            </div>
          </div>
          <button onClick={finish} className="rounded-lg px-2 py-2 text-xs font-bold text-ink-600 transition-colors hover:bg-muted hover:text-ink-900">Skip intro</button>
        </header>

        <div className="relative z-10 flex flex-1 items-center py-10 sm:py-14 lg:py-10">
          <div className="grid w-full items-center gap-10 lg:grid-cols-[1.05fr_.95fr] lg:gap-20">
            <div className="order-2 max-w-xl lg:order-1">
              <div className="mb-6 flex items-center gap-2" aria-label={`Step ${step + 1} of ${slides.length}`}>
                {slides.map((item, index) => (
                  <button key={item.eyebrow} onClick={() => setStep(index)} aria-label={`Go to step ${index + 1}`} className={`h-1.5 rounded-full transition-all ${index === step ? "w-10 bg-brand-500" : "w-5 bg-ink-800/20 hover:bg-ink-800/40"}`} />
                ))}
                <span className="ml-2 font-mono text-[11px] font-bold text-ink-600">0{step + 1} / 0{slides.length}</span>
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28 }}>
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-600">{slide.eyebrow}</p>
                  <h1 className="mt-4 max-w-lg font-serif text-[2.75rem] font-semibold leading-[1.02] tracking-tight text-ink-900 sm:text-6xl">{slide.title}</h1>
                  <p className="mt-5 max-w-md text-[15px] leading-6 text-ink-600 sm:text-lg sm:leading-7">{slide.description}</p>
                </motion.div>
              </AnimatePresence>
              <div className="mt-8 flex items-center gap-3">
                <button onClick={step === slides.length - 1 ? finish : () => setStep((current) => current + 1)} className="inline-flex items-center gap-2 rounded-xl bg-ink-900 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-ink-900/15 transition-transform hover:-translate-y-0.5 hover:bg-ink-800">
                  {step === slides.length - 1 ? "Enter StudyShare" : "Continue"}
                  {step === slides.length - 1 ? <Check className="size-4" /> : <ArrowRight className="size-4" />}
                </button>
                {step > 0 && <button onClick={() => setStep((current) => current - 1)} className="rounded-xl px-4 py-3.5 text-sm font-bold text-ink-600 hover:bg-muted hover:text-ink-900">Back</button>}
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="relative mx-auto aspect-[1.06] w-full max-w-[540px] overflow-hidden rounded-[2rem] border border-brand-200 bg-surface p-4 shadow-[12px_14px_0_rgba(228,108,75,.12)] sm:p-7">
                <div className="absolute -right-16 -top-20 size-56 rounded-full border-[18px] border-brand-100" />
                <div className="absolute -bottom-24 -left-20 size-64 rounded-full border-[22px] border-ink-100" />
                <div className="relative flex h-full flex-col overflow-hidden rounded-[1.35rem] border border-brand-100 bg-paper p-5 sm:p-7">
                  <div className="flex items-center justify-between border-b border-brand-200/70 pb-4 text-ink-600">
                    <span className="font-display text-[11px] font-extrabold uppercase tracking-[0.16em]">StudyShare / {String(step + 1).padStart(2, "0")}</span>
                    <Icon className="size-4 text-brand-500" />
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: .3 }} className="flex flex-1 flex-col justify-center">
                      <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-brand-500 shadow-lg shadow-brand-500/20"><Icon className="size-7 text-white" /></div>
                      <div className="max-w-[260px] font-serif text-3xl font-semibold leading-tight text-ink-900">{step === 0 ? "Learn with less searching." : step === 1 ? "Share the useful stuff." : "Keep each other moving."}</div>
                      <div className="mt-7 flex max-w-[320px] -rotate-1 items-center gap-3 rounded-xl border border-brand-200 bg-surface p-3 shadow-sm"><div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-100"><Icon className="size-4 text-brand-600" /></div><div className="min-w-0"><div className="truncate text-xs font-extrabold text-ink-900">{slide.label}</div><div className="mt-1 truncate text-[10px] font-medium text-ink-600">{slide.meta}</div></div></div>
                      <div className="mt-4 flex items-center gap-2"><div className="h-2 w-20 rounded-full bg-brand-300" /><div className="h-2 w-12 rounded-full bg-ink-100" /><div className="h-2 w-16 rounded-full bg-ink-100" /></div>
                    </motion.div>
                  </AnimatePresence>
                  <div className="flex items-center justify-between border-t border-brand-200/70 pt-4 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-600"><span>Built by students</span><span className="text-brand-600">For students</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <footer className="relative z-10 text-xs font-medium text-ink-600">Campus knowledge, shared.</footer>
      </div>
    </main>
  );
}

export { STORAGE_KEY };
