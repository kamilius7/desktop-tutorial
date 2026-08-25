import type { ReactNode } from "react";

// Auth pages remain reachable so visitors can switch identity by
// registering, but nothing redirects away from them.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
