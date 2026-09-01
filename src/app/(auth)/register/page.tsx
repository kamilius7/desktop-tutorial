"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GraduationCap, Mail, Lock, User, Building2, Eye, EyeOff } from "lucide-react";
import { AuthBrand } from "@/components/auth-brand";
import { Button, Input, Field, Select } from "@/components/ui";
import { DEPARTMENTS, YEARS } from "@/lib/constants";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", department: "", year: "1st Year" });
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Registration failed");
      toast.success(`Welcome to StudyShare, ${data.user.name.split(" ")[0]}!`);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
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

          <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-primary">Your study circle</p><h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-ink-950">Make room to <em className="text-primary">learn</em> together.</h2>
          <p className="mt-2 text-sm text-ink-600">Create your account — your department&apos;s feed awaits.</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <Field label="Full name">
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input value={form.name} onChange={set("name")} placeholder="Alex Rivera" className="pl-10" required />
              </div>
            </Field>
            <Field label="University email">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input type="email" value={form.email} onChange={set("email")} placeholder="you@university.edu" className="pl-10" required />
              </div>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Department">
                <Select value={form.department} onChange={set("department")} required>
                  <option value="" disabled>Select…</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </Select>
              </Field>
              <Field label="Year">
                <Select value={form.year} onChange={set("year")}>
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </Select>
              </Field>
            </div>
            <Field label="Password" hint="At least 6 characters">
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input type={showPw ? "text" : "password"} value={form.password} onChange={set("password")} placeholder="Choose a password" className="pl-10 pr-10" required minLength={6} autoComplete="new-password" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>
            {error && <div className="rounded-xl bg-brand-50 px-3.5 py-2.5 text-[13px] font-semibold text-destructive animate-pop">{error}</div>}
            <Button type="submit" loading={busy} className="w-full" size="lg">
              <Building2 className="h-4 w-4" /> Create account
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-ink-600">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-brand-600 hover:text-brand-700">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
