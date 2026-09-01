# StudyShare

## Required environment variables

`MESSAGE_ENCRYPTION_KEY` protects message content at rest with AES-256-GCM. Generate it once, store it in your hosting platform's secret manager and `.env.local`, and never commit it:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Messages are encrypted at rest. This is not end-to-end encryption: the application server decrypts messages for authorized participants.

## Environment & production settings

- **`NODE_ENV=production` must be set in the deployment environment** (PaaS platforms set it automatically; on a VPS, export it in the service unit / process manager). It enables the HTTPS redirect, `secure` cookies, the `__Host-` session cookie prefix, and drops `'unsafe-eval'` from the CSP.
- `src/lib/env.ts` validates `DATABASE_URL` and `MESSAGE_ENCRYPTION_KEY` at module load and throws before any route is served. `/api/health` returns only an opaque `ok` flag — no version or stack details.
- `next.config.ts` uses `output: "standalone"` for production builds (run `node .next/standalone/server.js`) and keeps production browser source maps disabled.
- `drizzle.config.ts` reads `DATABASE_URL` from the environment — never hardcode DB credentials in config files.

## Two-Factor Authentication (OTP)

StudyShare enforces two-factor email verification for added campus security:
- **Login & Registration**: A 6-digit OTP code is generated and sent to the user's email on every sign-in attempt and new user registration before granting session access.
- **Password Reset**: Secure email verification is required before setting a new password.
- **Development Mode**: If no external email provider is configured, check your terminal console where outbound OTP codes and delivery previews are automatically printed.
- **Production Email Provider**: Set `RESEND_API_KEY` (or `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`) in your production environment to deliver emails via a real provider (e.g. Resend, SendGrid, Amazon SES, or Gmail SMTP).

## Session cookie

The session cookie is `httpOnly`, `sameSite: "strict"`, `secure` in production, and named `__Host-ss_session` in production (the `__Host-` prefix forces `Secure`, `Path=/`, and forbids a `Domain` attribute). The path cannot be narrowed to `/api` because page layouts read the cookie server-side for authentication; the `__Host-` prefix provides equivalent scoping guarantees. Sign-out clears both the current and the legacy `ss_session` cookie name.

## Deployment (HTTPS)

The app must be deployed behind a TLS-terminating reverse proxy — Nginx, Caddy, or a PaaS such as Vercel or Railway. In production the middleware (`src/middleware.ts`) redirects any request whose `x-forwarded-proto` is not `https`, and the session cookie is set with `secure: true`, so plain-HTTP deployments will break by design. Make sure your proxy forwards `X-Forwarded-Proto`.

See `docs/security.md` for the full security architecture, including recommended PostgreSQL Row-Level Security policies (`drizzle/rls-policies.sql`).

## Preventing accidental secret commits

`.env`, key files, `uploads/`, and `postgres-data/` are gitignored. To also get a hard block at commit time, enable the bundled pre-commit hook once per clone:

```sh
git config core.hooksPath .githooks
```

The hook rejects staged `.env`/`*.key` files and any database connection string with embedded credentials. The dev credential in `.env` (`postgresql://postgres:postgres@...`) is for the local container only and must NEVER be committed or reused in production.

