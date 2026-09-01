"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Mail, Lock, Sparkles, Eye, EyeOff, CheckCircle2, ArrowLeft } from "lucide-react";
import { AuthBrand } from "@/components/auth-brand";
import { Button, Input, Field } from "@/components/ui";
import { OtpCard } from "@/components/otp-card";
import { toast } from "sonner";

function maskEmail(rawEmail: string): string {
  const [user, domain] = rawEmail.split("@");
  if (!user || !domain) return rawEmail;
  if (user.length <= 2) return `${user[0]}*@${domain}`;
  return `${user[0]}${"*".repeat(Math.min(user.length - 2, 4))}${user[user.length - 1]}@${domain}`;
}

type Mode = "login" | "login_otp" | "forgot_email" | "forgot_otp" | "forgot_new_password" | "forgot_success";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Forgot password form state
  const [forgotEmail, setForgotEmail] = useState("");
  const [verifiedResetCode, setVerifiedResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);

  // 1. Submit Login Form
  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? `Login failed (${res.status})`);

      if (data.step === "otp") {
        setMode("login_otp");
        toast.info("Verification code sent to your email.");
        return;
      }

      // Fallback if session created immediately
      if (data.user) {
        toast.success(`Welcome back, ${data.user.name.split(" ")[0]}!`);
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  };

  // 2. Verify Login OTP
  const handleVerifyLoginOtp = async (code: string): Promise<"ok" | "invalid" | "expired"> => {
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, purpose: "login" }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.ok) {
      toast.success(`Welcome back, ${data.user?.name?.split(" ")[0] ?? "there"}!`);
      router.push("/dashboard");
      router.refresh();
      return "ok";
    }
    if (data.error?.toLowerCase().includes("expired")) return "expired";
    return "invalid";
  };

  // 3. Resend OTP
  const handleResendOtp = async () => {
    const res = await fetch("/api/auth/resend-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "Failed to resend code");
    toast.success("A new 6-digit code has been sent!");
  };

  // 4. Submit Forgot Password Email
  const submitForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to process request");

      setMode("forgot_otp");
      toast.info("Password reset code sent.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  };

  // 5. Verify Forgot Password OTP
  const handleVerifyResetOtp = async (code: string): Promise<"ok" | "invalid" | "expired"> => {
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, purpose: "reset" }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.ok) {
      setVerifiedResetCode(code);
      setMode("forgot_new_password");
      return "ok";
    }
    if (data.error?.toLowerCase().includes("expired")) return "expired";
    return "invalid";
  };

  // 6. Submit New Password
  const submitResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword, code: verifiedResetCode }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to reset password");

      setMode("forgot_success");
      toast.success("Password reset successfully!");
      setTimeout(() => {
        setMode("login");
        setEmail(forgotEmail);
        setPassword("");
        setError("");
      }, 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-paper">
      <AuthBrand />
      <div className="flex flex-1 items-center justify-center p-6 sm:p-12">
        <AnimatePresence mode="wait">
          {/* A. LOGIN OTP CARD */}
          {mode === "login_otp" && (
            <OtpCard
              key="login_otp"
              title="Verify it's you"
              subtitle={`We sent a 6-digit code to ${maskEmail(email)}`}
              digits={6}
              onVerify={handleVerifyLoginOtp}
              onResend={handleResendOtp}
              onBack={() => setMode("login")}
            />
          )}

          {/* B. FORGOT PASSWORD OTP CARD */}
          {mode === "forgot_otp" && (
            <OtpCard
              key="forgot_otp"
              title="Reset your password"
              subtitle={`We sent a 6-digit reset code to ${forgotEmail}`}
              digits={6}
              onVerify={handleVerifyResetOtp}
              onResend={handleResendOtp}
              onBack={() => setMode("forgot_email")}
            />
          )}

          {/* C. FORGOT PASSWORD: SET NEW PASSWORD */}
          {mode === "forgot_new_password" && (
            <motion.div
              key="forgot_new_password"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-sm rounded-[24px] border border-border bg-surface p-6 shadow-[10px_12px_0_rgba(22,35,44,.10)] sm:p-8"
            >
              <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-primary">Security</p>
              <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-ink-950">Set new password</h2>
              <p className="mt-2 text-sm text-ink-600">Choose a secure password with at least 8 characters.</p>

              <form onSubmit={submitResetPassword} className="mt-8 space-y-4">
                <Field label="New password">
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type={showNewPw ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </Field>

                <Field label="Confirm new password">
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type={showNewPw ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10"
                      required
                      minLength={8}
                    />
                  </div>
                </Field>

                {error && <div className="rounded-xl bg-brand-50 px-3.5 py-2.5 text-[13px] font-semibold text-destructive">{error}</div>}
                <Button type="submit" loading={busy} className="w-full" size="lg">Update password</Button>
              </form>
            </motion.div>
          )}

          {/* D. FORGOT PASSWORD: SUCCESS CONFIRMATION */}
          {mode === "forgot_success" && (
            <motion.div
              key="forgot_success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-sm rounded-[24px] border border-border bg-surface p-8 text-center shadow-[10px_12px_0_rgba(22,35,44,.10)]"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 mb-4">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-ink-950">Password updated!</h3>
              <p className="mt-2 text-sm text-ink-600">Your password has been changed successfully. Redirecting you to sign in…</p>
            </motion.div>
          )}

          {/* E. FORGOT PASSWORD: REQUEST EMAIL */}
          {mode === "forgot_email" && (
            <motion.div
              key="forgot_email"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-sm rounded-[24px] border border-border bg-surface p-6 shadow-[10px_12px_0_rgba(22,35,44,.10)] sm:p-8"
            >
              <button
                type="button"
                onClick={() => { setMode("login"); setError(""); }}
                className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-600 hover:text-ink-950 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
              </button>

              <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-primary">Account recovery</p>
              <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-ink-950">Reset password</h2>
              <p className="mt-2 text-sm text-ink-600">Enter your university email and we&apos;ll send you a 6-digit verification code to reset your password.</p>

              <form onSubmit={submitForgotPassword} className="mt-8 space-y-4">
                <Field label="University email">
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="you@university.edu"
                      className="pl-10"
                      required
                      autoComplete="email"
                    />
                  </div>
                </Field>

                {error && <div className="rounded-xl bg-brand-50 px-3.5 py-2.5 text-[13px] font-semibold text-destructive">{error}</div>}
                <Button type="submit" loading={busy} className="w-full" size="lg">Send reset code</Button>
              </form>
            </motion.div>
          )}

          {/* F. STANDARD LOGIN FORM */}
          {mode === "login" && (
            <motion.div
              key="login_form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-sm rounded-[24px] border border-border bg-surface p-6 shadow-[10px_12px_0_rgba(22,35,44,.10)] sm:p-8"
            >
              <div className="mb-8 flex items-center gap-2.5 lg:hidden">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 shadow-sm shadow-brand-500/20">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <span className="font-display text-lg font-bold">StudyShare</span>
              </div>

              <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-primary">Welcome back</p>
              <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-ink-950">Sign in to your study space</h2>
              <p className="mt-2 text-sm text-ink-600">Sign in to your campus network to keep studying.</p>

              <form onSubmit={submitLogin} className="mt-8 space-y-4">
                <Field label="University email">
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@university.edu"
                      className="pl-10"
                      required
                      autoComplete="email"
                    />
                  </div>
                </Field>

                <Field label="Password">
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </Field>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email || "");
                      setError("");
                      setMode("forgot_email");
                    }}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                {error && <div className="rounded-xl bg-brand-50 px-3.5 py-2.5 text-[13px] font-semibold text-destructive">{error}</div>}
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
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
