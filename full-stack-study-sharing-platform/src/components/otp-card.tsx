"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowLeft } from "lucide-react";

export type OtpCardProps = {
  title: string;
  subtitle: string;
  digits?: 4 | 6;
  onVerify: (code: string) => Promise<"ok" | "invalid" | "expired">;
  onResend: () => Promise<void>;
  onBack?: () => void;
};

export function OtpCard({
  title,
  subtitle,
  digits = 6,
  onVerify,
  onResend,
  onBack,
}: OtpCardProps) {
  const [values, setValues] = useState<string[]>(Array(digits).fill(""));
  const [isSpreading, setIsSpreading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const spreadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Focus the first empty input on mount
  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  // Countdown timer for Resend button
  useEffect(() => {
    if (countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  const triggerSpreadAnimation = useCallback(() => {
    setIsSpreading(true);
    if (spreadTimeoutRef.current) clearTimeout(spreadTimeoutRef.current);
    spreadTimeoutRef.current = setTimeout(() => {
      setIsSpreading(false);
    }, 450);
  }, []);

  const handleVerify = useCallback(
    async (codeToVerify: string) => {
      setError(null);
      setIsChecking(true);
      try {
        const res = await onVerify(codeToVerify);
        if (res === "invalid") {
          setError("Incorrect code. Please double-check and try again.");
          // Clear inputs and refocus first box
          setValues(Array(digits).fill(""));
          setTimeout(() => inputsRef.current[0]?.focus(), 50);
        } else if (res === "expired") {
          setError("Code expired — please request a new code below.");
          setValues(Array(digits).fill(""));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Verification failed. Try again.");
      } finally {
        setIsChecking(false);
      }
    },
    [onVerify, digits],
  );

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const digit = rawVal.replace(/\D/g, "").slice(-1);

    setError(null);
    triggerSpreadAnimation();

    const newValues = [...values];
    newValues[index] = digit;
    setValues(newValues);

    if (digit) {
      if (index < digits - 1) {
        inputsRef.current[index + 1]?.focus();
      }
    }

    const fullCode = newValues.join("");
    if (fullCode.length === digits && !newValues.includes("")) {
      handleVerify(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!values[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
      } else {
        const newValues = [...values];
        newValues[index] = "";
        setValues(newValues);
        setError(null);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < digits - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, digits);
    if (!pasted) return;

    setError(null);
    triggerSpreadAnimation();

    const newValues = Array(digits).fill("");
    for (let i = 0; i < pasted.length; i++) {
      newValues[i] = pasted[i];
    }
    setValues(newValues);

    const nextIndex = Math.min(pasted.length, digits - 1);
    inputsRef.current[nextIndex]?.focus();

    if (pasted.length === digits) {
      handleVerify(pasted);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;
    setError(null);
    setIsResending(true);
    try {
      await onResend();
      setCountdown(60);
      setValues(Array(digits).fill(""));
      inputsRef.current[0]?.focus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend code.");
    } finally {
      setIsResending(false);
    }
  };

  const formatCountdown = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remaining = sec % 60;
    return `${mins}:${remaining < 10 ? "0" : ""}${remaining}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -12 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-[440px] rounded-[24px] border border-indigo-500/30 p-7 sm:p-8 shadow-2xl backdrop-blur-xl transition-all"
      style={{
        background: "rgba(15, 15, 17, 0.95)",
      }}
    >
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
      )}

      {/* Header */}
      <div className="text-center">
        <h2
          className="text-2xl font-bold tracking-tight text-white sm:text-3xl"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-400 font-sans">{subtitle}</p>
      </div>

      {/* Main Content Area */}
      <div className="my-8 min-h-[110px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {isChecking ? (
            <motion.div
              key="checking"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center gap-3 text-center py-4"
            >
              <div className="relative flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                <div className="absolute h-10 w-10 rounded-full bg-indigo-500/20 animate-pulse" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-white">Checking your code…</p>
                <p className="text-xs text-slate-400">One moment — we&apos;re confirming it.</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="inputs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2 sm:gap-2.5"
            >
              {Array.from({ length: digits }).map((_, idx) => {
                const center = (digits - 1) / 2;
                const offset = idx - center;
                const rotation = isSpreading ? offset * 3.5 : 0;
                const translateY = isSpreading ? Math.abs(offset) * 2.5 : 0;
                const translateX = isSpreading ? offset * 2 : 0;

                return (
                  <div
                    key={idx}
                    className="relative transition-transform duration-300 ease-out"
                    style={{
                      transform: `translate(${translateX}px, ${translateY}px) rotate(${rotation}deg)`,
                      transformOrigin: "bottom center",
                    }}
                  >
                    <input
                      ref={(el) => {
                        inputsRef.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={values[idx]}
                      onChange={(e) => handleChange(idx, e)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      onPaste={handlePaste}
                      className={`
                        w-11 sm:w-14 h-14 sm:h-[72px] text-center text-2xl sm:text-3xl font-bold text-white
                        rounded-2xl border-2 transition-all outline-none select-none
                        ${
                          values[idx]
                            ? "border-indigo-500/80 bg-[#1e1e2e] shadow-[0_0_12px_rgba(99,102,241,0.25)]"
                            : "border-[#2d2d3f] bg-[#1e1e2e] hover:border-slate-600"
                        }
                        focus:border-[#6366f1] focus:ring-4 focus:ring-indigo-500/20 focus:bg-[#252538]
                      `}
                    />
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error Message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-xs font-semibold text-rose-400 -mt-3 mb-4"
        >
          {error}
        </motion.p>
      )}

      {/* Resend Section */}
      <div className="pt-2 text-center border-t border-white/5">
        <p className="text-xs text-slate-400">
          Didn&apos;t get a code?{" "}
          {countdown > 0 ? (
            <span className="font-semibold text-slate-500 cursor-not-allowed">
              Resend in {formatCountdown(countdown)}
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors focus:outline-none hover:underline disabled:opacity-50"
            >
              {isResending ? "Sending…" : "Resend"}
            </button>
          )}
        </p>
      </div>
    </motion.div>
  );
}

