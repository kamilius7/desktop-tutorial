import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/session";
import { Shell } from "@/components/shell";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getUser();
  if (!user) redirect("/login");
<<<<<<< HEAD
  if (!user.emailVerified) redirect("/verify-email");
=======
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
  return <Shell user={user}>{children}</Shell>;
}
