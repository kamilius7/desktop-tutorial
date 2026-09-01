# Security Documentation

## Threat model & controls

| Control | Where |
|---|---|
| Session auth (`ss_session` httpOnly cookie, 30-day, `sameSite: lax`, `secure` in production) | `src/lib/session.ts` |
| Edge auth guard for `/api/*` and app pages, plus HTTPS redirect and origin check in production | `src/middleware.ts` |
| Origin (CSRF) check on state-changing handlers | `src/lib/csrf.ts` |
| In-memory sliding-window rate limiting (login/register 10/IP/min, uploads 20/user/hour, messages 60/user/min) | `src/lib/rate-limit.ts` |
| Upload hardening (25MB cap, extension allow-list, MIME/extension match, null-byte and path-traversal checks, storage outside `public/`, auth-gated serving) | `src/app/api/notes/route.ts`, `src/app/api/files/[name]/route.ts` |
| AES-256-GCM encryption of message contents at rest | `src/lib/message-crypto.ts` |
| Input length caps (title 200, description 2000, name 100, bio 500, message 2000, search 100, tags 6 × 30 chars) | API route handlers |
| XSS: React JSX auto-escaping only — no `dangerouslySetInnerHTML` anywhere; `originalName` stripped of `<`/`>` before storage | all components |
| SQLi: Drizzle parameterized queries only; raw `sql` templates interpolate session-derived UUIDs, never raw user input | all routes |
| Resource limits: `.limit()` on every list query; 10 uploads/user/day | all routes |

## Row-Level Security (RLS)

The application enforces authorization at the app layer (Drizzle queries are always scoped by the session user). As **defense in depth**, PostgreSQL RLS should be enabled so that even a compromised app process or a direct DB connection cannot read other users' private data. The canonical SQL lives in `drizzle/rls-policies.sql` — apply it to your production database:

```sh
psql "$DATABASE_URL" -f drizzle/rls-policies.sql
```

Because Next.js connects with a single application role (not per-user roles), the app sets `request.jwt.claims`-style session context via `SET LOCAL app.current_user_id` inside a transaction. The policies below use a helper `current_app_user()` that reads that setting.

### `messages`

A row is readable/writable only by a participant of its conversation (which subsumes `sender_id = current_user_id`):

```sql
create policy messages_participant_select on messages
  for select using (
    sender_id = current_app_user()
    or conversation_id in (
      select conversation_id from conversation_members
      where user_id = current_app_user()
    )
  );

create policy messages_participant_insert on messages
  for insert with check (
    sender_id = current_app_user()
    and conversation_id in (
      select conversation_id from conversation_members
      where user_id = current_app_user()
    )
  );
```

### `sessions`

A session row is readable/deleted only by its owner (used for "sign out everywhere"):

```sql
create policy sessions_owner_select on sessions
  for select using (user_id = current_app_user());

create policy sessions_owner_delete on sessions
  for delete using (user_id = current_app_user());
```

### `conversation_members`

Membership is only visible to members of the conversation:

```sql
create policy convo_members_select on conversation_members
  for select using (
    user_id = current_app_user()
    or conversation_id in (
      select conversation_id from conversation_members
      where user_id = current_app_user()
    )
  );
```

## Deployment requirements

- The app **must** be served over HTTPS (TLS-terminating reverse proxy: Nginx, Caddy, Vercel, Railway, etc.). `src/middleware.ts` redirects non-HTTPS requests in production.
- Keep `.env` out of version control (enforced by `.githooks/pre-commit`; enable with `git config core.hooksPath .githooks`).
- Rotate `MESSAGE_ENCRYPTION_KEY` via a versioned envelope (the `v1.` prefix on encrypted rows supports this).
- The in-memory rate limiter is per-process; use a shared store (e.g., Redis) when running multiple instances.

## Secret management

- `DATABASE_URL` and `MESSAGE_ENCRYPTION_KEY` are only ever read on the server (`src/db/index.ts`, `src/lib/message-crypto.ts`); neither module is imported from any client component.
- `.env` and `*.key` are gitignored; `.env.example` documents required variables with placeholders only.
