import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudyShare — Notes, Courses & Study Groups",
  description: "The campus knowledge network. Share scanned notes, join courses, and study together.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-paper text-slate-900 antialiased">
        {children}
        <Toaster position="bottom-right" richColors closeButton toastOptions={{ style: { fontFamily: "Inter, sans-serif" } }} />
      </body>
    </html>
  );
}
