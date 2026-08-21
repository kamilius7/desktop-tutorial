"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, BookOpen, Files, ScanLine, MessagesSquare,
  GraduationCap, Bookmark, Users, UserRound, ArrowLeftRight, Search, Menu, X, Plus,
} from "lucide-react";
import { cn, initials } from "@/lib/utils";
import type { UserDTO, ConversationDTO } from "@/lib/types";
import { Avatar } from "@/components/ui";

const UserCtx = createContext<UserDTO | null>(null);
export const useCurrentUser = () => useContext(UserCtx);

const fetcher = <T,>(url: string): Promise<T> => fetch(url).then((r) => r.json());

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard; accent?: boolean; badge?: boolean };

const NAV: { label: string; items: NavItem[] }[] = [
  {
    label: "Learn",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/courses", label: "Courses", icon: BookOpen },
      { href: "/notes", label: "Notes Library", icon: Files },
      { href: "/upload", label: "Scan & Upload", icon: ScanLine, accent: true },
    ],
  },
  {
    label: "Community",
    items: [
      { href: "/messages", label: "Messages", icon: MessagesSquare, badge: true },
      { href: "/students", label: "Students", icon: Users },
      { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
      { href: "/profile", label: "Profile", icon: UserRound },
    ],
  },
];

function SidebarContent({ user, unread, onNavigate }: { user: UserDTO; unread: number; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 pb-6 pt-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 shadow-lg shadow-brand-500/30">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="font-display text-[17px] font-bold leading-none text-white">StudyShare</div>
          <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-100/40">Campus Network</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 dark-scroll">
        {NAV.map((section) => (
          <div key={section.label}>
            <div className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-100/35">{section.label}</div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold transition-all",
                      active ? "bg-white/[0.08] text-white" : "text-ink-100/55 hover:bg-white/[0.04] hover:text-white",
                    )}
                  >
                    {active && <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-brand-500 to-violet-400" />}
                    <item.icon className={cn("h-[18px] w-[18px]", active ? "text-brand-300" : "text-ink-100/45 group-hover:text-ink-100/80", item.accent && !active && "text-emerald-400/80")} />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && unread > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-extrabold text-white animate-pop">
                        {unread}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Profile card */}
      <div className="p-3">
        <div className="rounded-2xl bg-white/[0.05] p-3 ring-1 ring-white/[0.06]">
          <div className="flex items-center gap-3">
            <Avatar name={user.name} color={user.avatarColor} size={38} className="ring-ink-800" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 truncate text-[13px] font-bold text-white">
                {user.name}
                <span className="rounded-md bg-emerald-400/15 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-emerald-300">demo</span>
              </div>
              <div className="truncate text-[11px] font-medium text-ink-100/50">{user.department}</div>
            </div>
            <Link
              href="/login"
              onClick={onNavigate}
              className="rounded-lg p-2 text-ink-100/50 transition-colors hover:bg-white/10 hover:text-brand-300"
              title="Sign in as someone else"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Shell({ user, children }: { user: UserDTO; children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [q, setQ] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const { data } = useSWR<{ conversations: ConversationDTO[] }>("/api/conversations", fetcher, { refreshInterval: 8000 });
  const unread = (data?.conversations ?? []).reduce((sum, c) => sum + c.unreadCount, 0);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.title = unread > 0 ? `(${unread}) StudyShare` : "StudyShare";
  }, [unread]);

  return (
    <UserCtx.Provider value={user}>
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] bg-ink-900 lg:block">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_60%_at_0%_0%,rgba(99,102,241,0.15),transparent_55%)]" />
          <div className="relative h-full">
            <SidebarContent user={user} unread={unread} />
          </div>
        </aside>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
              <motion.aside
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="absolute inset-y-0 left-0 w-[280px] bg-ink-900"
              >
                <button onClick={() => setMobileOpen(false)} className="absolute right-3 top-4 rounded-lg p-2 text-ink-100/60 hover:bg-white/10">
                  <X className="h-5 w-5" />
                </button>
                <SidebarContent user={user} unread={unread} onNavigate={() => setMobileOpen(false)} />
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main */}
        <div className="flex min-h-screen flex-1 flex-col lg:pl-[264px]">
          {/* Topbar */}
          <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-paper/80 backdrop-blur-xl">
            <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
              <button onClick={() => setMobileOpen(true)} className="rounded-xl p-2 text-slate-600 hover:bg-slate-200/60 lg:hidden">
                <Menu className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2.5 lg:hidden">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-violet-500">
                  <GraduationCap className="h-4 w-4 text-white" />
                </div>
                <span className="font-display text-[15px] font-bold">StudyShare</span>
              </div>

              <form
                className="relative ml-auto hidden w-full max-w-xs sm:block"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (q.trim()) router.push(`/notes?q=${encodeURIComponent(q.trim())}`);
                }}
              >
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search notes, courses…"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition-shadow focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                />
              </form>

              <div className="ml-auto flex items-center gap-2 sm:ml-2">
                <Link href="/upload" className="hidden sm:inline-flex">
                  <span className="inline-flex h-10 items-center gap-2 rounded-xl bg-ink-900 px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-ink-700 active:scale-[0.97]">
                    <Plus className="h-4 w-4" /> Share notes
                  </span>
                </Link>
                <Link href="/messages" className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-200/60" title="Messages">
                  <MessagesSquare className="h-5 w-5" />
                  {unread > 0 && <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-paper animate-pulse-dot" />}
                </Link>
                <Link href="/profile" className="rounded-full transition-transform hover:scale-105" title={user.name}>
                  <Avatar name={user.name} color={user.avatarColor} size={38} />
                </Link>
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
            <motion.div key={pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
              {children}
            </motion.div>
          </main>

          <footer className="border-t border-slate-200/60 py-5 text-center text-xs text-slate-400">
            StudyShare · Built by students, for students · Logged in as <span className="font-semibold">{initials(user.name)}</span>
          </footer>
        </div>
      </div>
    </UserCtx.Provider>
  );
}
