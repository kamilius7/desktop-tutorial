// src/lib/email.ts
// Primary: Resend API (set RESEND_API_KEY in .env)
// Fallback: Ethereal test account (dev only — preview URL logged to console)

import nodemailer from "nodemailer";

async function sendViaEthereal(to: string, subject: string, html: string) {
  try {
    const testAccount = await nodemailer.createTestAccount();
    const transport = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    const info = await transport.sendMail({
      from: '"StudyShare" <no-reply@studyshare.app>',
      to,
      subject,
      html,
    });
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("[StudyShare] Email not configured — using Ethereal preview");
    console.log(`[StudyShare] To: ${to}`);
    console.log(`[StudyShare] Subject: ${subject}`);
    console.log(`[StudyShare] Preview URL: ${previewUrl}`);
    const match = html.match(/>(\d{6})</);
    if (match) {
      console.log(`[StudyShare] OTP Code: ${match[1]}`);
    }
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  } catch (err) {
    console.error("[StudyShare] Ethereal fallback failed:", err);
    const match = html.match(/>(\d{6})</);
    if (match) {
      console.log(`[StudyShare] Dev OTP Code: ${match[1]}`);
    }
  }
}

async function sendViaResend(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY!;
  const from = process.env.SMTP_FROM ?? "StudyShare <onboarding@resend.dev>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error("[StudyShare] Resend error:", err);
    throw new Error(`Email send failed: ${err}`);
  }
  const data = await res.json();
  console.log("[StudyShare] Email sent via Resend, id:", data.id);
}

async function sendViaNodemailerSMTP(to: string, subject: string, html: string) {
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  await transport.sendMail({
    from: process.env.SMTP_FROM ?? '"StudyShare" <no-reply@studyshare.app>',
    to,
    subject,
    html,
  });
  console.log(`[StudyShare] Email sent via SMTP to ${to}`);
}

export async function sendEmail(to: string, subject: string, html: string) {
  if (process.env.RESEND_API_KEY) {
    return sendViaResend(to, subject, html);
  }
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return sendViaNodemailerSMTP(to, subject, html);
  }
  // No provider configured — use Ethereal for local dev preview
  return sendViaEthereal(to, subject, html);
}
