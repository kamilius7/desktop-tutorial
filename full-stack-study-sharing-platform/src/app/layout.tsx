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
<<<<<<< HEAD
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,SOFT,WONK@9..144,0..100,0..1&family=Inter:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&family=Sora:wght@600;700;800&display=swap"
=======
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@500;600;700;800&display=swap"
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
          rel="stylesheet"
        />
      </head>
      <body className="bg-paper text-slate-900 antialiased">
        {children}
<<<<<<< HEAD
        <Toaster position="bottom-right" richColors closeButton toastOptions={{ style: { fontFamily: "Manrope, sans-serif" } }} />
=======
        <Toaster position="bottom-right" richColors closeButton toastOptions={{ style: { fontFamily: "Inter, sans-serif" } }} />
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
      </body>
    </html>
  );
}
