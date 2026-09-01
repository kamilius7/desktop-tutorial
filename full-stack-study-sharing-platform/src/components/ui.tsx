"use client";

import { forwardRef, useEffect, useState, type ReactNode, type ButtonHTMLAttributes, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { cn, initials } from "@/lib/utils";

<<<<<<< HEAD
/* Button */
=======
/* ------------------------------- Button ------------------------------ */
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "dark";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
};

export function Button({ variant = "primary", size = "md", loading, className, children, disabled, ...rest }: ButtonProps) {
  const styles = {
<<<<<<< HEAD
    primary: "bg-primary text-white hover:bg-ink-800 shadow-sm shadow-ink-900/20",
    secondary: "border border-border bg-secondary text-ink-900 hover:border-ink-900/20 hover:bg-ink-100",
    ghost: "text-ink-700 hover:bg-muted/65 hover:text-ink-950",
    danger: "bg-destructive text-white hover:bg-[#963a27] shadow-sm shadow-destructive/20",
    dark: "bg-ink-900 text-white hover:bg-ink-800 shadow-sm shadow-ink-900/20",
=======
    primary: "bg-brand-500 text-white hover:bg-brand-600 shadow-sm shadow-brand-500/25",
    secondary: "bg-white text-slate-800 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm",
    ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-600/25",
    dark: "bg-ink-900 text-white hover:bg-ink-700",
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
  }[variant];
  const sizes = { sm: "h-8 px-3 text-xs gap-1.5", md: "h-10 px-4 text-sm gap-2", lg: "h-12 px-6 text-[15px] gap-2" }[size];
  return (
    <button
<<<<<<< HEAD
      className={cn("inline-flex select-none items-center justify-center rounded-lg font-semibold transition-all active:scale-[0.98] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-ring", styles, sizes, className)}
=======
      className={cn("inline-flex select-none items-center justify-center font-semibold rounded-xl transition-all active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none focus-ring", styles, sizes, className)}
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

<<<<<<< HEAD
/* Inputs */
=======
/* -------------------------------- Inputs ----------------------------- */
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...rest }, ref) {
  return (
    <input
      ref={ref}
<<<<<<< HEAD
      className={cn(
        "h-11 w-full rounded-xl border border-border bg-input px-3.5 text-sm text-ink-950 placeholder:text-ink-600/65 shadow-sm shadow-ink-950/5 outline-none transition-all",
        "focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15",
        className,
      )}
=======
      className={cn("h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-shadow focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10", className)}
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
      {...rest}
    />
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
<<<<<<< HEAD
      className={cn(
        "min-h-[96px] w-full rounded-xl border border-border bg-input px-3.5 py-3 text-sm text-ink-950 placeholder:text-ink-600/65 shadow-sm shadow-ink-950/5 outline-none transition-all",
        "focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15",
        className,
      )}
=======
      className={cn("min-h-[96px] w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-shadow focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10", className)}
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
      {...rest}
    />
  );
});

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
<<<<<<< HEAD
      className={cn(
        "h-11 w-full appearance-none rounded-xl border border-border bg-input px-3.5 text-sm text-ink-950 shadow-sm shadow-ink-950/5 outline-none transition-all",
        "focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15",
        className,
      )}
=======
      className={cn("h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition-shadow focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10", className)}
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
      {...rest}
    >
      {children}
    </select>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
<<<<<<< HEAD
      <span className="mb-1.5 block text-[13px] font-semibold text-ink-800">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-ink-600">{hint}</span>}
=======
      <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-slate-400">{hint}</span>}
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
    </label>
  );
}

<<<<<<< HEAD
/* Avatar */
=======
/* -------------------------------- Avatar ----------------------------- */
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
export function Avatar({ name, color, size = 36, className }: { name: string; color: string; size?: number; className?: string }) {
  return (
    <div
      className={cn("flex shrink-0 items-center justify-center rounded-full font-bold text-white select-none ring-2 ring-white", className)}
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${color}, ${color}cc)`, fontSize: size * 0.38 }}
      aria-label={name}
    >
      {initials(name)}
    </div>
  );
}

<<<<<<< HEAD
/* Badge */
=======
/* -------------------------------- Badge ------------------------------ */
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
export function Badge({ children, className, color }: { children: ReactNode; className?: string; color?: string }) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold", className)}
      style={color ? { background: `${color}18`, color } : undefined}
    >
      {children}
    </span>
  );
}

const FILE_STYLES: Record<string, string> = {
  pdf: "bg-rose-50 text-rose-600",
  doc: "bg-sky-50 text-sky-600",
  docx: "bg-sky-50 text-sky-600",
<<<<<<< HEAD
  ppt: "bg-amber-50 text-amber-700",
  pptx: "bg-amber-50 text-amber-700",
  md: "bg-muted text-ink-700",
  txt: "bg-muted text-ink-700",
  scan: "bg-brand-50 text-brand-700",
  png: "bg-violet-50 text-violet-600",
  jpg: "bg-violet-50 text-violet-600",
  jpeg: "bg-violet-50 text-violet-600",
  zip: "bg-brand-50 text-brand-700",
=======
  ppt: "bg-orange-50 text-orange-600",
  pptx: "bg-orange-50 text-orange-600",
  md: "bg-slate-100 text-slate-600",
  txt: "bg-slate-100 text-slate-600",
  scan: "bg-emerald-50 text-emerald-600",
  png: "bg-violet-50 text-violet-600",
  jpg: "bg-violet-50 text-violet-600",
  jpeg: "bg-violet-50 text-violet-600",
  zip: "bg-amber-50 text-amber-700",
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
};

export function FileChip({ type }: { type: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider", FILE_STYLES[type] ?? "bg-slate-100 text-slate-600")}>
      {type === "scan" ? "scan" : type}
    </span>
  );
}

<<<<<<< HEAD
/* Modal */
=======
/* -------------------------------- Modal ------------------------------ */
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
<<<<<<< HEAD
          <div className="absolute inset-0 bg-ink-950/45 backdrop-blur-sm" onClick={onClose} />
=======
          <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm" onClick={onClose} />
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", damping: 28, stiffness: 380 }}
<<<<<<< HEAD
            className={cn("relative flex max-h-[92vh] w-full flex-col rounded-t-3xl border border-border bg-surface shadow-2xl shadow-ink-950/15 sm:rounded-2xl", wide ? "sm:max-w-2xl" : "sm:max-w-lg")}
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h3 className="font-display text-lg font-bold text-ink-950">{title}</h3>
              <button onClick={onClose} className="rounded-full p-1.5 text-ink-600 hover:bg-muted hover:text-ink-950 transition-colors">
=======
            className={cn("relative w-full rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl max-h-[92vh] flex flex-col", wide ? "sm:max-w-2xl" : "sm:max-w-lg")}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="font-display text-lg font-bold text-slate-900">{title}</h3>
              <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = "Delete", loading }: { open: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string; confirmLabel?: string; loading?: boolean }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
<<<<<<< HEAD
      <p className="text-sm text-ink-700">{message}</p>
=======
      <p className="text-sm text-slate-600">{message}</p>
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}

<<<<<<< HEAD
/* Empty state */
export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/75 px-8 py-16 text-center animate-fade-up">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 [&>svg]:h-7 [&>svg]:w-7">{icon}</div>
      <h3 className="font-display text-lg font-bold text-ink-950 text-balance">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-ink-600">{description}</p>
=======
/* ------------------------------ EmptyState --------------------------- */
export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/60 px-8 py-16 text-center animate-fade-up">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-500 [&>svg]:h-7 [&>svg]:w-7">{icon}</div>
      <h3 className="font-display text-lg font-bold text-slate-900 text-balance">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-slate-500">{description}</p>
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

<<<<<<< HEAD
/* Skeletons */
=======
/* ------------------------------ Skeletons ---------------------------- */
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-xl", className)} />;
}

export function NoteCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5">
      <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-11 rounded-lg" />
        <div className="flex-1 space-y-2.5">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-5 w-5 animate-spin text-brand-500", className)} />;
}

<<<<<<< HEAD
/* Tabs */
export function Tabs({ options, value, onChange }: { options: { value: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-border bg-muted/65 p-1">
=======
/* -------------------------------- Tabs ------------------------------- */
export function Tabs({ options, value, onChange }: { options: { value: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl bg-slate-100 p-1">
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
<<<<<<< HEAD
          className={cn("relative rounded-lg px-3.5 py-1.5 text-[13px] font-semibold transition-colors whitespace-nowrap", value === o.value ? "text-ink-950" : "text-ink-600 hover:text-ink-900")}
        >
          {value === o.value && <motion.span className="absolute inset-0 rounded-lg bg-surface shadow-sm shadow-ink-950/10" transition={{ type: "spring", damping: 30, stiffness: 400 }} />}
=======
          className={cn("relative rounded-lg px-3.5 py-1.5 text-[13px] font-semibold transition-colors whitespace-nowrap", value === o.value ? "text-slate-900" : "text-slate-500 hover:text-slate-700")}
        >
          {value === o.value && <motion.span layoutId={undefined} className="absolute inset-0 rounded-lg bg-white shadow-sm" transition={{ type: "spring", damping: 30, stiffness: 400 }} />}
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
          <span className="relative">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

<<<<<<< HEAD
/* Tag input */
=======
/* ------------------------------ TagInput ----------------------------- */
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
export function TagInput({ tags, onChange, placeholder = "Add tags…" }: { tags: string[]; onChange: (tags: string[]) => void; placeholder?: string }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const t = draft.trim().toLowerCase().replace(/\s+/g, "-");
    if (t && !tags.includes(t) && tags.length < 6) onChange([...tags, t]);
    setDraft("");
  };
  return (
<<<<<<< HEAD
    <div className="flex min-h-11 w-full flex-wrap items-center gap-1.5 rounded-xl border border-border bg-input px-2.5 py-2 shadow-sm shadow-ink-950/5 transition-all focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/15">
=======
    <div className="flex min-h-11 w-full flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-2 transition-shadow focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10">
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
      {tags.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700">
          #{t}
          <button type="button" onClick={() => onChange(tags.filter((x) => x !== t))} className="text-brand-400 hover:text-brand-700"><X className="h-3 w-3" /></button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); }
          if (e.key === "Backspace" && !draft && tags.length) onChange(tags.slice(0, -1));
        }}
        onBlur={add}
        placeholder={tags.length ? "" : placeholder}
<<<<<<< HEAD
        className="min-w-24 flex-1 bg-transparent px-1 text-sm text-ink-950 outline-none placeholder:text-ink-600/65"
=======
        className="min-w-24 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-slate-400"
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
      />
    </div>
  );
}

<<<<<<< HEAD
/* Stat card */
export function StatCard({ icon, label, value, accent }: { icon: ReactNode; label: string; value: string | number; accent: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 card-lift shadow-sm shadow-ink-950/5">
=======
/* ------------------------------ StatCard ----------------------------- */
export function StatCard({ icon, label, value, accent }: { icon: ReactNode; label: string; value: string | number; accent: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 card-lift">
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl [&>svg]:h-5 [&>svg]:w-5" style={{ background: `${accent}14`, color: accent }}>
          {icon}
        </div>
        <div>
<<<<<<< HEAD
          <div className="font-display text-2xl font-bold tracking-tight text-ink-950">{value}</div>
          <div className="text-xs font-medium text-ink-600">{label}</div>
=======
          <div className="font-display text-2xl font-bold tracking-tight text-slate-900">{value}</div>
          <div className="text-xs font-medium text-slate-500">{label}</div>
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
        </div>
      </div>
    </div>
  );
}
