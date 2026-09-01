import { NextRequest, NextResponse } from "next/server";

/** Reject cross-site state changes; sameSite cookies remain the primary CSRF control. */
export function checkOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    } catch {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }
  return null;
}
