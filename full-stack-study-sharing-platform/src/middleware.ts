import { NextRequest, NextResponse } from "next/server";
import { PENDING_COOKIE, SESSION_COOKIE } from "@/lib/cookie-name";

const protectedPages = ["/dashboard", "/courses", "/notes", "/upload", "/bookmarks", "/students", "/messages", "/profile"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (process.env.NODE_ENV === "production" && req.headers.get("x-forwarded-proto") !== "https") {
    const url = req.nextUrl.clone();
    url.protocol = "https:";
    return NextResponse.redirect(url);
  }

  if (["POST", "PATCH", "PUT", "DELETE"].includes(req.method)) {
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    if (origin && host) {
      try {
        if (new URL(origin).host !== host) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      } catch {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
  }

  const isAuthApi = pathname.startsWith("/api/auth/");
  const isHealthApi = pathname === "/api/health";
  const isOtherApi = pathname.startsWith("/api/") && !isAuthApi && !isHealthApi;
  const isProtectedPage = protectedPages.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  const hasSession = req.cookies.has(SESSION_COOKIE);
  const hasPending = req.cookies.has(PENDING_COOKIE);

  // If user only has pending OTP cookie and tries to access protected app pages
  if (!hasSession && hasPending && isProtectedPage) {
    const url = req.nextUrl.clone();
    url.pathname = "/verify-email";
    return NextResponse.redirect(url);
  }

  if (isOtherApi && !hasSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isProtectedPage && !hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/dashboard/:path*",
    "/courses/:path*",
    "/notes/:path*",
    "/upload/:path*",
    "/bookmarks/:path*",
    "/students/:path*",
    "/messages/:path*",
    "/profile/:path*",
    "/verify-email/:path*",
  ],
};
