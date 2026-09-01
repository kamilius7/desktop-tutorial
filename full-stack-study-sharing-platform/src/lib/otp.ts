import { randomInt } from "crypto";
import { hashPassword, verifyPassword } from "./password";
import { db } from "@/db";
import { otpCodes } from "@/db/schema";
import { and, desc, eq, isNull } from "drizzle-orm";
import { sendEmail } from "./email";

const OTP_EXPIRY_MINUTES = 10;

export async function generateAndSendOtp(
  userId: string,
  email: string,
  purpose: "login" | "register" | "reset",
) {
  // Invalidate any existing unused OTP for this user+purpose
  await db
    .delete(otpCodes)
    .where(and(eq(otpCodes.userId, userId), eq(otpCodes.purpose, purpose), isNull(otpCodes.usedAt)));

  const code = String(randomInt(100000, 999999)); // 6-digit
  const hashed = hashPassword(code);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await db.insert(otpCodes).values({ userId, code: hashed, purpose, expiresAt });

  const purposeLabel = purpose === "reset" ? "password reset" : "verification";
  await sendEmail(
    email,
    `Your StudyShare ${purposeLabel} code`,
    `
    <div style="font-family: Inter, sans-serif; background: #0f0f11; color: #e2e8f0; padding: 40px; border-radius: 16px; max-width: 480px; margin: auto;">
      <h1 style="font-family: Sora, sans-serif; color: #818cf8; margin-bottom: 8px;">StudyShare</h1>
      <p style="color: #94a3b8; margin-bottom: 24px;">Your one-time ${purposeLabel} code:</p>
      <div style="letter-spacing: 12px; font-size: 36px; font-weight: 700; color: #fff; background: #1e1e2e; border: 1px solid #6366f1; border-radius: 12px; padding: 20px 32px; display: inline-block; margin-bottom: 24px;">${code}</div>
      <p style="color: #64748b; font-size: 14px;">This code expires in ${OTP_EXPIRY_MINUTES} minutes. Don't share it with anyone.</p>
    </div>
    `,
  );
}

export async function verifyOtp(
  userId: string,
  purpose: "login" | "register" | "reset",
  submittedCode: string,
  opts?: { markUsed?: boolean },
): Promise<"ok" | "invalid" | "expired"> {
  if (!userId || userId === "anonymous") return "invalid";
  const markUsed = opts?.markUsed ?? true;

  const rows = await db
    .select()
    .from(otpCodes)
    .where(
      and(
        eq(otpCodes.userId, userId),
        eq(otpCodes.purpose, purpose),
        isNull(otpCodes.usedAt),
      ),
    )
    .orderBy(desc(otpCodes.createdAt))
    .limit(1);

  if (!rows[0]) return "expired";

  const otp = rows[0];
  if (Date.now() > new Date(otp.expiresAt).getTime()) {
    return "expired";
  }

  const valid = verifyPassword(submittedCode, otp.code);
  if (!valid) return "invalid";

  if (markUsed) {
    await db.update(otpCodes).set({ usedAt: new Date() }).where(eq(otpCodes.id, otp.id));
  }
  return "ok";
}
