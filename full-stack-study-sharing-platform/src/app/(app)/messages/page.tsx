"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, MessagesSquare, Plus, Search, Send, Trash2 } from "lucide-react";
import { format, formatDistanceToNow, isSameDay } from "date-fns";
import type { ConversationDTO, MessageDTO, StudentDTO } from "@/lib/types";
import { Avatar, Button, EmptyState, Input, Modal, Skeleton } from "@/components/ui";
import { useCurrentUser } from "@/components/shell";
import { cn, safeJson } from "@/lib/utils";
import { toast } from "sonner";

const convosFetcher = (url: string) => fetch(url).then((r) => safeJson<{ conversations: ConversationDTO[] }>(r));
const threadFetcher = (url: string) => fetch(url).then((r) => safeJson<{ other: { id: string; name: string; avatarColor: string; department: string; bio: string }; messages: MessageDTO[] }>(r));
const studentsFetcher = (url: string) => fetch(url).then((r) => safeJson<{ students: StudentDTO[] }>(r));

function timeLabel(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  if (isSameDay(d, now)) return format(d, "HH:mm");
  const diff = (now.getTime() - d.getTime()) / 86400000;
  if (diff < 7) return formatDistanceToNow(d, { addSuffix: true });
  return format(d, "MMM d");
}

function ConversationList({ selected, onSelect, onNew }: { selected: string | null; onSelect: (id: string) => void; onNew: () => void }) {
  const { data, isLoading } = useSWR("/api/conversations", convosFetcher, { refreshInterval: 4000 });
  const convos = data?.conversations ?? [];
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h2 className="font-display text-lg font-bold text-slate-900">Messages</h2>
        <button onClick={onNew} className="rounded-xl bg-brand-500 p-2 text-white shadow-sm transition-all hover:bg-brand-600 active:scale-95" title="New conversation">
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2 p-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
        ) : convos.length === 0 ? (
          <div className="p-6 text-center">
            <MessagesSquare className="mx-auto mb-2 h-8 w-8 text-slate-200" />
            <p className="text-sm font-semibold text-slate-500">No conversations yet</p>
            <p className="mt-1 text-xs text-slate-400">Start a chat with any student from your campus.</p>
            <Button size="sm" className="mt-4" onClick={onNew}><Plus className="h-3.5 w-3.5" /> New chat</Button>
          </div>
        ) : (
          convos.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={cn("flex w-full items-center gap-3 border-b border-slate-50 px-5 py-3.5 text-left transition-colors", selected === c.id ? "bg-brand-50/60" : "hover:bg-slate-50")}
            >
              <div className="relative">
                <Avatar name={c.otherName} color={c.otherColor} size={44} />
                {c.unreadCount > 0 && <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-rose-500 ring-2 ring-white" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className={cn("truncate text-[13.5px] font-bold", c.unreadCount > 0 ? "text-slate-900" : "text-slate-700")}>{c.otherName}</span>
                  {c.lastMessageAt && <span className={cn("shrink-0 text-[10.5px] font-semibold", c.unreadCount > 0 ? "text-brand-600" : "text-slate-400")}>{timeLabel(c.lastMessageAt)}</span>}
                </div>
                <p className={cn("mt-0.5 truncate text-xs", c.unreadCount > 0 ? "font-bold text-slate-700" : "text-slate-400")}>{c.lastMessage ?? "Say hi and start the conversation"}</p>
              </div>
              {c.unreadCount > 0 && (
                <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-extrabold text-white">{c.unreadCount}</span>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function Thread({ convoId, onBack }: { convoId: string; onBack: () => void }) {
  const user = useCurrentUser();
  const { data, mutate, isLoading } = useSWR(`/api/conversations/${convoId}`, threadFetcher, { refreshInterval: 3000 });
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const messages = useMemo(() => data?.messages ?? [], [data]);
  const other = data?.other;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  const send = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const content = draft.trim();
    if (!content || sending || !data || !user) return;
    setSending(true);
    setDraft("");
    const optimistic: MessageDTO = {
      id: `tmp-${Date.now()}`, conversationId: convoId, senderId: user.id, senderName: user.name, senderColor: user.avatarColor, content, createdAt: new Date().toISOString(), pending: true,
    };
    mutate({ ...data, messages: [...messages, optimistic] }, { revalidate: false });
    try {
      const res = await fetch(`/api/conversations/${convoId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content }) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      mutate({ ...data, messages: [...messages, d.message] }, { revalidate: false });
    } catch {
      mutate({ ...data, messages }, { revalidate: false });
      setDraft(content);
      toast.error("Message couldn't be sent");
    } finally {
      setSending(false);
    }
  };

  const deleteConvo = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/conversations/${convoId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Conversation deleted");
      router.push("/messages");
    } catch {
      toast.error("Couldn't delete conversation");
      setDeleting(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 sm:px-6">
        <button onClick={onBack} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 lg:hidden"><ArrowLeft className="h-5 w-5" /></button>
        {other ? (
          <>
            <Avatar name={other.name} color={other.avatarColor} size={40} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold text-slate-900">{other.name}</div>
              <div className="truncate text-xs font-medium text-slate-400">{other.department}</div>
            </div>
            <button onClick={deleteConvo} disabled={deleting} className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500" title="Delete conversation">
              <Trash2 className="h-4 w-4" />
            </button>
          </>
        ) : (
          <Skeleton className="h-10 w-40" />
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-slate-50/50 px-4 py-5">
        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className={cn("h-11", i % 2 ? "ml-auto w-2/3" : "w-3/5")} />)}</div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <EmptyState icon={<MessagesSquare />} title={`Say hi to ${other?.name.split(" ")[0] ?? "them"}!`} description="Share notes, ask about lectures, or plan a study session." />
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-1.5">
            {messages.map((m, i) => {
              const mine = m.senderId === user?.id;
              const prevSame = i > 0 && messages[i - 1].senderId === m.senderId;
              const showTail = i === messages.length - 1 || messages[i + 1].senderId !== m.senderId;
              const dayBreak = i === 0 || !isSameDay(new Date(messages[i - 1].createdAt), new Date(m.createdAt));
              return (
                <div key={m.id}>
                  {dayBreak && (
                    <div className="my-4 flex items-center justify-center">
                      <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 shadow-sm">
                        {format(new Date(m.createdAt), "EEEE, MMM d")}
                      </span>
                    </div>
                  )}
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={cn("flex items-end gap-2", mine ? "justify-end" : "justify-start")}>
                    {!mine && <div className="w-7">{showTail && <Avatar name={m.senderName} color={m.senderColor} size={28} />}</div>}
                    <div
                      className={cn(
                        "max-w-[75%] px-3.5 py-2 text-[13.5px] leading-relaxed shadow-sm",
                        mine ? "bubble-out bg-ink-900 text-white" : "bubble-in bg-white text-slate-800 ring-1 ring-slate-100",
                        prevSame ? (mine ? "rounded-2xl" : "rounded-2xl") : "",
                      )}
                    >
                      <p className="whitespace-pre-wrap">{m.content}</p>
                      {showTail && (
                        <div className={cn("mt-1 text-right text-[9.5px] font-semibold", mine ? "text-white/50" : "text-slate-300")}>
                          {m.pending ? "sending…" : format(new Date(m.createdAt), "HH:mm")}
                        </div>
                      )}
                    </div>
                    {mine && <div className="w-7" />}
                  </motion.div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Composer */}
      <form onSubmit={send} className="flex items-center gap-2 border-t border-slate-100 bg-white p-3 sm:px-5">
        <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={`Message ${other?.name.split(" ")[0] ?? ""}…`} className="flex-1 !rounded-full !border-slate-200 !bg-slate-50" onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} />
        <button type="submit" disabled={!draft.trim() || sending} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white shadow-md shadow-brand-500/25 transition-all hover:bg-brand-600 active:scale-95 disabled:opacity-40 disabled:shadow-none">
          <Send className="h-4.5 w-4.5 -translate-x-px" />
        </button>
      </form>
    </div>
  );
}

function NewChatModal({ open, onClose, onStarted }: { open: boolean; onClose: () => void; onStarted: (id: string) => void }) {
  const [q, setQ] = useState("");
  const { data, isLoading } = useSWR(open ? `/api/students?q=${encodeURIComponent(q)}` : null, studentsFetcher);
  const [busy, setBusy] = useState<string | null>(null);

  const start = async (userId: string) => {
    setBusy(userId);
    try {
      const res = await fetch("/api/conversations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId }) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      onStarted(d.conversation.id);
      onClose();
    } catch {
      toast.error("Couldn't start conversation");
    } finally {
      setBusy(null);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="New conversation">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search students by name…" className="pl-9" autoFocus />
      </div>
      <div className="mt-3 max-h-80 space-y-1 overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14" />)
        ) : (data?.students ?? []).length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">No students match “{q}”.</p>
        ) : (
          (data?.students ?? []).map((s) => (
            <button key={s.id} onClick={() => start(s.id)} disabled={busy !== null} className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-slate-50 disabled:opacity-50">
              <Avatar name={s.name} color={s.avatarColor} size={38} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-bold text-slate-800">{s.name}</div>
                <div className="truncate text-xs text-slate-400">{s.department} · {s.noteCount} notes</div>
              </div>
              {busy === s.id ? <span className="text-xs font-bold text-brand-500">Opening…</span> : <MessagesSquare className="h-4 w-4 text-slate-300" />}
            </button>
          ))
        )}
      </div>
    </Modal>
  );
}

function MessagesInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const selected = sp.get("c");
  const [showListMobile, setShowListMobile] = useState(!selected);
  const [newOpen, setNewOpen] = useState(false);

  useEffect(() => {
    setShowListMobile(!selected);
  }, [selected]);

  const select = (id: string) => router.push(`/messages?c=${id}`);

  return (
    <div className="h-[calc(100vh-13.5rem)] min-h-[480px] overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
      <div className="grid h-full lg:grid-cols-[340px_1fr]">
        <div className={cn("h-full border-r border-slate-100", showListMobile ? "block" : "hidden lg:block")}>
          <ConversationList selected={selected} onSelect={select} onNew={() => setNewOpen(true)} />
        </div>
        <div className={cn("h-full", !showListMobile ? "block" : "hidden lg:block")}>
          {selected ? (
            <Thread convoId={selected} onBack={() => router.push("/messages")} />
          ) : (
            <div className="hidden h-full items-center justify-center lg:flex">
              <EmptyState
                icon={<MessagesSquare />}
                title="Pick a conversation"
                description="Choose a chat from the list or start a new one with any student on campus."
              />
            </div>
          )}
        </div>
      </div>
      <NewChatModal open={newOpen} onClose={() => setNewOpen(false)} onStarted={select} />
      <AnimatePresence />
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<Skeleton className="h-[70vh]" />}>
      <MessagesInner />
    </Suspense>
  );
}
