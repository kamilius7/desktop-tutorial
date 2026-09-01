import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/session";

// Signed-in users never see credential forms: send them straight to the app.
// getUser() validates the session against the DB, so an expired/invalid
// cookie returns null and the auth pages render normally (no redirect loop).
export default async function AuthLayout({ children }: { children: ReactNode }) {
  const user = await getUser();
  if (user) redirect(user.emailVerified ? "/dashboard" : "/verify-email");
  return <>{children}</>;
}
