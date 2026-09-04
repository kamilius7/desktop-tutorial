"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BookOpen, Check, Files, GraduationCap, Users } from "lucide-react";

const STORAGE_KEY = "studyshare-intro-v1";

const slides = [
  {
    eyebrow: "Find your focus",
    title: "Everything you need to learn, together.",
    description: "Keep your courses, notes, and next steps in one calm, focused study space.",
    icon: BookOpen,
    accent: "bg-brand-500",
  },
  {
    eyebrow: "Share what works",
    title: "Turn good notes into shared momentum.",
    description: "Upload scans, save the essentials, and make your best study materials useful to everyone.",
    icon: Files,
    accent: "bg-ink-800",
  },
  {
    eyebrow: "Learn with your people",
    title: "A campus network that feels human.",
    description: "Find classmates, ask questions, and keep moving forward with a little help from your community.",
    icon: Users,
    accent: "bg-primary",
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
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-5 sm:px-8 sm:py-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-brand-500 shadow-lg shadow-brand-500/20">
              <GraduationCap className="size-5 text-white" />
            </div>
            <div>
              <div className="font-display text-[17px] font-bold leading-none">StudyShare</div>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-600">Campus Network</div>
            </div>
          </div>
          <button onClick={finish} className="rounded-lg px-3 py-2 text-xs font-bold text-ink-600 transition-colors hover:bg-muted hover:text-ink-950">
            Skip intro
          </button>
        </header>

        <div className="flex flex-1 items-center py-12 lg:py-8">
          <div className="grid w-full items-center gap-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-20">
            <div className="order-2 max-w-xl lg:order-1">
              <div className="mb-7 flex items-center gap-2" aria-label={`Step ${step + 1} of ${slides.length}`}>
                {slides.map((item, index) => (
                  <button key={item.eyebrow} onClick={() => setStep(index)} aria-label={`Go to step ${index + 1}`} className={`h-1.5 rounded-full transition-all ${index === step ? "w-10 bg-brand-500" : "w-5 bg-ink-600/20 hover:bg-ink-600/40"}`} />
                ))}
                <span className="ml-2 text-xs font-bold text-ink-600">{step + 1} / {slides.length}</span>
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary">{slide.eyebrow}</p>
                  <h1 className="mt-4 max-w-lg font-serif text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl">{slide.title}</h1>
                  <p className="mt-5 max-w-md text-base leading-7 text-ink-600 sm:text-lg">{slide.description}</p>
                </motion.div>
              </AnimatePresence>
              <div className="mt-9 flex items-center gap-3">
                <button onClick={step === slides.length - 1 ? finish : () => setStep((current) => current + 1)} className="inline-flex items-center gap-2 rounded-xl bg-ink-900 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-ink-900/15 transition-transform hover:-translate-y-0.5 hover:bg-ink-800">
                  {step === slides.length - 1 ? "Enter StudyShare" : "Continue"}
                  {step === slides.length - 1 ? <Check className="size-4" /> : <ArrowRight className="size-4" />}
                </button>
                {step > 0 && <button onClick={() => setStep((current) => current - 1)} className="rounded-xl px-4 py-3.5 text-sm font-bold text-ink-600 hover:bg-muted hover:text-ink-950">Back</button>}
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="relative mx-auto aspect-[1.05] w-full max-w-[520px] overflow-hidden rounded-[2rem] bg-ink-900 p-5 shadow-[16px_18px_0_rgba(22,60,74,.12)] sm:p-8">
                <div className="absolute -right-14 -top-16 size-48 rounded-full border-[22px] border-brand-500/20" />
                <div className="absolute -bottom-20 -left-16 size-52 rounded-full border-[26px] border-paper/10" />
                <AnimatePresence mode="wait">
                  <motion.div key={step} initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.04 }} transition={{ duration: .35 }} className="relative flex h-full flex-col justify-between rounded-[1.35rem] border border-white/10 bg-white/[.06] p-6 sm:p-8">
                    <div className="flex items-center justify-between text-white/55"><span className="text-xs font-bold uppercase tracking-[.16em]">StudyShare</span><span className="font-mono text-xs">{String(step + 1).padStart(2, "0")}</span></div>
                    <div>
                      <div className={`mb-6 flex size-16 items-center justify-center rounded-2xl ${slide.accent} shadow-xl`}><Icon className="size-8 text-white" /></div>
                      <div className="h-2 w-24 rounded-full bg-white/25" /><div className="mt-3 h-2 w-40 rounded-full bg-white/10" />
                      <div className="mt-10 grid grid-cols-3 gap-2"><div className="h-20 rounded-xl bg-white/10" /><div className="h-20 rounded-xl bg-brand-500/70" /><div className="h-20 rounded-xl bg-white/10" /></div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
        <footer className="text-xs font-medium text-ink-600">Built by students, for students.</footer>
      </div>
    </main>
  );
}

export { STORAGE_KEY };

