/**
 * Edge-safe cookie name shared by middleware and server code (no DB imports).
 *
 * `__Host-` prefix (production) forces the browser to require:
 *   - the Secure attribute,
 *   - Path=/ exactly,
 *   - no Domain attribute.
 * In dev (plain http) the plain name is used, since `__Host-` requires HTTPS.
 */
export const SESSION_COOKIE =
  process.env.NODE_ENV === "production" ? "__Host-ss_session" : "ss_session";

/** Legacy cookie name — cleared on sign-out so old sessions cannot linger. */
export const LEGACY_SESSION_COOKIE = "ss_session";

/** Pending verification cookie used during OTP step (maxAge: 600s). */
export const PENDING_COOKIE = "ss_pending";

