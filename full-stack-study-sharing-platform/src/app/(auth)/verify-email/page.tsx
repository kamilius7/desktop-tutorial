"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthBrand } from "@/components/auth-brand";
import { OtpCard } from "@/components/otp-card";
import { Button, Field, Input } from "@/components/ui";
import { toast } from "sonner";
import { Loader2, Lock } from "lucide-react";

type Purpose = "login" | "register" | "reset";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [purpose, setPurpose] = useState<Purpose>("register");
  const [loading, setLoading] = useState(true);

  // New-password step (reset purpose only, after the code is verified)
  const [resetCode, setResetCode] = useState<string>("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInfo() {
      try {
        const res = await fetch("/api/auth/pending");
        const data = await res.json().catch(() => ({}));
        if (data?.pending?.email) {
          setEmail(data.pending.email);
          setPurpose(data.pending.purpose);
        } else {
          // If no pending, check current session
          const meRes = await fetch("/api/auth/me");
          const meData = await meRes.json().catch(() => ({}));
          if (meData?.user?.email) {
            setEmail(meData.user.email);
            if (meData.user.emailVerified) {
              router.push("/dashboard");
              return;
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadInfo();
  }, [router]);

  const handleVerify = async (code: string): Promise<"ok" | "invalid" | "expired"> => {
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, purpose }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.ok) {
      if (data.step === "new_password") {
        // Password reset: code verified, continue to the new-password step
        setResetCode(code);
        toast.success("Code verified — choose a new password.");
        return "ok";
      }
      toast.success("Email verified successfully!");
      router.push("/dashboard");
      router.refresh();
      return "ok";
    }
    if (data.error?.toLowerCase().includes("expired")) return "expired";
    return "invalid";
  };

  const handleResend = async () => {
    const res = await fetch("/api/auth/resend-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "Failed to resend code");
    toast.success("A new code has been sent!");
  };

  const handleBack = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const submitNewPassword = async (e: React.FormEvent) => {
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
        body: JSON.stringify({ newPassword, code: resetCode }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to reset password");
      toast.success("Password reset successfully! Please sign in.");
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  const subtitle =
    purpose === "reset"
      ? email
        ? `We sent a 6-digit password reset code to ${email}`
        : "Enter the 6-digit reset code sent to your email to continue."
      : email
        ? `We sent a 6-digit verification code to ${email}`
        : "Enter the 6-digit verification code sent to your email to continue.";

  return (
    <div className="flex min-h-screen bg-paper">
      <AuthBrand />
      <div className="flex flex-1 items-center justify-center p-6 sm:p-12">
        {resetCode ? (
          <div className="w-full max-w-sm rounded-[24px] border border-border bg-surface p-6 shadow-[10px_12px_0_rgba(22,35,44,.10)] sm:p-8">
            <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-primary">Security</p>
            <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-ink-950">Set new password</h2>
            <p className="mt-2 text-sm text-ink-600">Choose a secure password with at least 8 characters.</p>

            <form onSubmit={submitNewPassword} className="mt-8 space-y-4">
              <Field label="New password">
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10"
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                </div>
              </Field>

              <Field label="Confirm new password">
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10"
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                </div>
              </Field>

              {error && <div className="rounded-xl bg-brand-50 px-3.5 py-2.5 text-[13px] font-semibold text-destructive">{error}</div>}
              <Button type="submit" loading={busy} className="w-full" size="lg">Update password</Button>
            </form>
          </div>
        ) : (
          <OtpCard
            title={purpose === "reset" ? "Reset your password" : "Verify your email"}
            subtitle={subtitle}
            digits={6}
            onVerify={handleVerify}
            onResend={handleResend}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  );
}
