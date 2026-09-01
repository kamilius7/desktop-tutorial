"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, FileUp, ScanLine, Trash2, RefreshCw, Check, X, Sparkles,
  FileText, CloudUpload, PartyPopper, CameraOff, FilePlus2,
} from "lucide-react";
import { Button, Field, Input, Select, TagInput, Textarea } from "@/components/ui";
import type { CourseDTO } from "@/lib/types";
import { formatBytes, safeJson } from "@/lib/utils";
import { toast } from "sonner";

type QueueItem = {
  id: string;
  file: File;
  title: string;
  preview: string | null;
  isScan: boolean;
  progress: number;
  status: "queued" | "uploading" | "done" | "error";
  error?: string;
};

const fetcher = (url: string) => fetch(url).then((r) => safeJson<{ courses: CourseDTO[] }>(r));

export function uploadWithProgress(item: QueueItem, meta: { title: string; description: string; courseId: string; tags: string }, onProgress: (p: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.set("file", item.file);
    form.set("title", meta.title);
    form.set("description", meta.description);
    form.set("courseId", meta.courseId);
    form.set("tags", meta.tags);
    form.set("isScan", item.isScan ? "1" : "");
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/notes");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 90));
    };
    xhr.onload = () => {
      onProgress(100);
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else {
        try { reject(new Error(JSON.parse(xhr.responseText).error ?? "Upload failed")); }
        catch { reject(new Error("Upload failed")); }
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(form);
  });
}

/* ------------------------------ Camera ------------------------------- */
function CameraScanner({ onCapture }: { onCapture: (file: File, preview: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState("");
  const [enhance, setEnhance] = useState(true);
  const [flash, setFlash] = useState(false);

  const start = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      setActive(true);
      requestAnimationFrame(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      });
    } catch {
      setError("Camera unavailable. Check permissions, or use the photo picker below.");
    }
  };

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setActive(false);
  }, []);

  useEffect(() => () => stop(), [stop]);

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (enhance) ctx.filter = "grayscale(1) contrast(1.35) brightness(1.12)";
    ctx.drawImage(video, 0, 0);
    setFlash(true);
    setTimeout(() => setFlash(false), 350);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `scan-${Date.now()}.jpg`, { type: "image/jpeg" });
      onCapture(file, canvas.toDataURL("image/jpeg", 0.85));
      toast.success("Page captured — added to the queue");
    }, "image/jpeg", 0.92);
  };

  return (
<<<<<<< HEAD
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm shadow-ink-950/5">
=======
    <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white">
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
      <div className="relative aspect-[4/3] bg-ink-950 sm:aspect-[16/10]">
        <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 h-full w-full object-cover" />
        <canvas ref={canvasRef} className="hidden" />
        {flash && <div className="absolute inset-0 animate-pop bg-white" />}
        {!active && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white">
              {error ? <CameraOff className="h-8 w-8" /> : <Camera className="h-8 w-8" />}
            </div>
            <p className="max-w-xs px-4 text-sm font-medium text-white/70">
              {error || "Point your camera at a page of notes and capture a crisp, auto-enhanced scan."}
            </p>
            <Button onClick={start} variant="dark" className="!bg-white !text-ink-900 hover:!bg-white/90"><Camera className="h-4 w-4" /> Start camera</Button>
          </div>
        )}
        {active && (
          <>
            {/* document frame */}
            <div className="pointer-events-none absolute inset-8 hidden sm:block">
              {["left-0 top-0 border-l-4 border-t-4 rounded-tl-xl", "right-0 top-0 border-r-4 border-t-4 rounded-tr-xl", "left-0 bottom-0 border-l-4 border-b-4 rounded-bl-xl", "right-0 bottom-0 border-r-4 border-b-4 rounded-br-xl"].map((pos) => (
                <div key={pos} className={`absolute h-10 w-10 border-emerald-400 ${pos}`} />
              ))}
              <motion.div
                className="absolute left-0 h-0.5 w-full bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent"
                animate={{ top: ["4%", "94%", "4%"] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-4 bg-gradient-to-t from-black/70 to-transparent p-4">
              <label className="flex cursor-pointer items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-bold text-white backdrop-blur-sm">
                <input type="checkbox" checked={enhance} onChange={(e) => setEnhance(e.target.checked)} className="h-3.5 w-3.5 accent-emerald-400" />
                <Sparkles className="h-3.5 w-3.5" /> Enhance
              </label>
              <button onClick={capture} className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-white/20 backdrop-blur-sm transition-transform hover:scale-105 active:scale-95" title="Capture page">
                <div className="h-10 w-10 rounded-full bg-white" />
              </button>
              <button onClick={stop} className="rounded-full bg-white/10 p-2.5 text-white backdrop-blur-sm transition-colors hover:bg-white/20" title="Stop camera">
                <X className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </div>
      <div className="flex items-center justify-between px-5 py-3 text-xs font-medium text-slate-400">
        <span className="inline-flex items-center gap-1.5"><ScanLine className="h-3.5 w-3.5 text-emerald-500" /> Pages become tidy grayscale documents</span>
        <label className="cursor-pointer font-bold text-brand-600 hover:text-brand-700">
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onCapture(f, URL.createObjectURL(f));
            e.target.value = "";
          }} />
          or take a photo
        </label>
      </div>
    </div>
  );
}

/* ------------------------------- Page -------------------------------- */
function UploadInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const preCourse = sp.get("course") ?? "";
  const { data: courseData } = useSWR("/api/courses?sort=code", fetcher);
  const courses = courseData?.courses ?? [];

  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [meta, setMeta] = useState({ description: "", courseId: preCourse, tags: [] as string[] });
  const [dragOver, setDragOver] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (preCourse) setMeta((m) => ({ ...m, courseId: preCourse }));
  }, [preCourse]);

  const addFiles = (files: FileList | File[] | null, isScan = false, preview: string | null = null) => {
    if (!files) return;
    const list = Array.from(files);
    const items = list.map((f) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file: f,
      title: f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      preview: preview ?? (f.type.startsWith("image/") ? URL.createObjectURL(f) : null),
      isScan: isScan || f.type.startsWith("image/"),
      progress: 0,
      status: "queued" as const,
    }));
    setQueue((q) => [...q, ...items]);
  };

  const removeItem = (id: string) => setQueue((q) => q.filter((i) => i.id !== id));
  const setItemTitle = (id: string, title: string) => setQueue((q) => q.map((i) => (i.id === id ? { ...i, title } : i)));

  const publish = async () => {
    if (!meta.courseId) { toast.error("Pick a course for these notes"); return; }
    if (queue.length === 0) { toast.error("Add at least one file or scan"); return; }
    setPublishing(true);
    let ok = 0;
    for (const item of queue.filter((i) => i.status !== "done")) {
      setQueue((q) => q.map((i) => (i.id === item.id ? { ...i, status: "uploading", progress: 0 } : i)));
      try {
        await uploadWithProgress(
          item,
          { title: item.title || item.file.name, description: meta.description, courseId: meta.courseId, tags: meta.tags.join(",") },
          (p) => setQueue((q) => q.map((i) => (i.id === item.id ? { ...i, progress: p } : i))),
        );
        setQueue((q) => q.map((i) => (i.id === item.id ? { ...i, status: "done", progress: 100 } : i)));
        ok++;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setQueue((q) => q.map((i) => (i.id === item.id ? { ...i, status: "error", error: err.message } : i)));
      }
    }
    setPublishing(false);
    if (ok > 0) toast.success(`${ok} note${ok === 1 ? "" : "s"} published to your classmates!`);
  };

  const allDone = queue.length > 0 && queue.every((i) => i.status === "done");

  return (
    <div className="space-y-6">
      <div>
<<<<<<< HEAD
        <h1 className="flex items-center gap-2.5 font-display text-2xl font-bold tracking-tight text-ink-950">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-ink-900"><ScanLine className="h-5 w-5" /></span>
          Scan & Upload
        </h1>
        <p className="mt-1.5 text-sm text-ink-600">Capture pages with your camera or drop in PDFs, slides and docs — then share them with your course.</p>
=======
        <h1 className="flex items-center gap-2.5 font-display text-2xl font-bold tracking-tight text-slate-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600"><ScanLine className="h-5 w-5" /></span>
          Scan & Upload
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">Capture pages with your camera or drop in PDFs, slides and docs — then share them with your course.</p>
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <CameraScanner onCapture={(file, preview) => addFiles([file], true, preview)} />

          {/* Dropzone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
            className={`rounded-3xl border-2 border-dashed p-8 text-center transition-all ${dragOver ? "border-brand-500 bg-brand-50/60 scale-[1.01]" : "border-slate-200 bg-white"}`}
          >
            <input ref={inputRef} type="file" multiple className="hidden" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md,.png,.jpg,.jpeg,.zip" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
              <FileUp className="h-7 w-7" />
            </div>
            <p className="font-display text-[15px] font-bold text-slate-800">Drop files here, or <button onClick={() => inputRef.current?.click()} className="text-brand-600 underline underline-offset-2">browse</button></p>
            <p className="mt-1 text-xs text-slate-400">PDF, Word, PowerPoint, Markdown, images or ZIP — up to 25MB each</p>
          </div>

          {/* Queue */}
          <AnimatePresence initial={false}>
            {queue.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-slate-100 bg-white p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-display text-[15px] font-bold text-slate-900">Upload queue <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">{queue.length}</span></h3>
                  {!publishing && <button onClick={() => setQueue([])} className="text-xs font-bold text-slate-400 hover:text-rose-500">Clear all</button>}
                </div>
                <div className="space-y-3">
                  <AnimatePresence initial={false}>
                    {queue.map((item) => (
                      <motion.div key={item.id} layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 24 }} className="rounded-2xl border border-slate-100 p-3">
                        <div className="flex items-center gap-3">
                          {item.preview ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.preview} alt="" className="h-12 w-10 rounded-lg object-cover ring-1 ring-slate-200" />
                          ) : (
                            <div className="flex h-12 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-400"><FileText className="h-5 w-5" /></div>
                          )}
                          <div className="min-w-0 flex-1">
                            <Input value={item.title} onChange={(e) => setItemTitle(item.id, e.target.value)} className="!h-8 !border-transparent !bg-slate-50 !px-2.5 !text-[13px] font-bold hover:!border-slate-200" disabled={publishing} />
                            <div className="mt-1 flex items-center gap-2 px-1 text-[11px] font-medium text-slate-400">
                              <span>{formatBytes(item.file.size)}</span>
                              {item.isScan && <span className="inline-flex items-center gap-1 text-emerald-500"><ScanLine className="h-3 w-3" /> scan</span>}
                              {item.status === "error" && <span className="font-bold text-rose-500">{item.error}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {item.status === "done" ? (
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><Check className="h-4 w-4" /></span>
                            ) : item.status === "uploading" ? (
                              <span className="flex h-8 w-8 items-center justify-center text-xs font-extrabold text-brand-600">{item.progress}%</span>
                            ) : !publishing ? (
                              <button onClick={() => removeItem(item.id)} className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-rose-50 hover:text-rose-500"><Trash2 className="h-4 w-4" /></button>
                            ) : null}
                          </div>
                        </div>
                        {(item.status === "uploading" || item.status === "done") && (
                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <motion.div className={`h-full rounded-full ${item.status === "done" ? "bg-emerald-500" : "bg-brand-500"}`} animate={{ width: `${item.progress}%` }} transition={{ ease: "easeOut", duration: 0.25 }} />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Metadata side panel */}
        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="rounded-3xl border border-slate-100 bg-white p-6">
            <h3 className="font-display text-[15px] font-bold text-slate-900">Share details</h3>
            <p className="mt-1 text-xs text-slate-400">Applied to every file in the queue.</p>
            <div className="mt-4 space-y-4">
              <Field label="Course">
                <Select value={meta.courseId} onChange={(e) => setMeta((m) => ({ ...m, courseId: e.target.value }))}>
                  <option value="" disabled>Choose a course…</option>
                  {courses.map((c) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
                </Select>
              </Field>
              <Field label="Description (optional)">
                <Textarea value={meta.description} onChange={(e) => setMeta((m) => ({ ...m, description: e.target.value }))} placeholder="What do these notes cover? Which week/chapter?" className="!min-h-[88px]" />
              </Field>
              <Field label="Tags" hint="Press Enter after each tag">
                <TagInput tags={meta.tags} onChange={(tags) => setMeta((m) => ({ ...m, tags }))} placeholder="midterm, lecture-notes…" />
              </Field>
            </div>
            <Button className="mt-5 w-full" size="lg" onClick={publish} loading={publishing} disabled={queue.length === 0 || allDone}>
              {publishing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CloudUpload className="h-4 w-4" />}
              {publishing ? "Publishing…" : `Publish ${queue.length === 0 ? "" : queue.filter((i) => i.status !== "done").length + " "}note${queue.filter((i) => i.status !== "done").length === 1 ? "" : "s"}`}
            </Button>
          </div>

          {allDone && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6 text-center">
              <PartyPopper className="mx-auto h-8 w-8 text-emerald-500" />
              <h4 className="mt-2 font-display font-bold text-emerald-900">All notes are live!</h4>
              <p className="mt-1 text-xs text-emerald-700/80">Your classmates just got smarter.</p>
              <div className="mt-4 flex gap-2">
                <Link href={meta.courseId ? `/courses/${meta.courseId}` : "/notes"} className="flex-1"><Button variant="dark" size="sm" className="w-full">View course</Button></Link>
                <Button variant="secondary" size="sm" onClick={() => setQueue([])}>New batch</Button>
              </div>
            </motion.div>
          )}

          {queue.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white/60 p-5 text-center text-xs font-medium text-slate-400">
              <FilePlus2 className="mx-auto mb-2 h-5 w-5 text-slate-300" />
              Captured pages and dropped files appear here for review before publishing.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={<div />}>
      <UploadInner />
    </Suspense>
  );
}
