"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GraduationCap, Mail, Lock, Sparkles, Eye, EyeOff } from "lucide-react";
import { AuthBrand } from "@/components/auth-brand";
import { Button, Input, Field } from "@/components/ui";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Login failed");
      toast.success(`Welcome back, ${data.user.name.split(" ")[0]}!`);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-paper">
      <AuthBrand />
      <div className="flex flex-1 items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm rounded-[24px] border border-border bg-surface p-6 shadow-[10px_12px_0_rgba(22,35,44,.10)] sm:p-8"
        >
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 shadow-sm shadow-brand-500/20">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-lg font-bold">StudyShare</span>
          </div>

          <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-primary">Welcome back</p><h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-ink-950">Sign in to your study space</h2>
          <p className="mt-2 text-sm text-ink-600">Sign in to your campus network to keep studying.</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <Field label="University email">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@university.edu" className="pl-10" required autoComplete="email" />
              </div>
            </Field>
            <Field label="Password">
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pl-10 pr-10" required autoComplete="current-password" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>
            {error && <div className="rounded-xl bg-brand-50 px-3.5 py-2.5 text-[13px] font-semibold text-destructive animate-pop">{error}</div>}
            <Button type="submit" loading={busy} className="w-full" size="lg">Sign in</Button>
          </form>

          <button
            onClick={() => { setEmail("maya@university.edu"); setPassword("password123"); }}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-brand-200 bg-brand-50/60 px-4 py-3 text-[13px] font-semibold text-brand-600 transition-colors hover:bg-brand-50"
          >
            <Sparkles className="h-4 w-4" /> Try the demo account — one-click fill
          </button>

          <p className="mt-8 text-center text-sm text-ink-600">
            New to StudyShare?{" "}
            <Link href="/register" className="font-bold text-brand-600 hover:text-brand-700">Create an account</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
