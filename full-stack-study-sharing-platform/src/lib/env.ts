/**
 * Fail-fast environment validation. Imported at the top of server-only
 * modules (src/db/index.ts, src/lib/message-crypto.ts) so the process
 * crashes at startup — before any route is served — if configuration is
 * missing. NEVER import this from a "use client" component.
 */
const required = ["DATABASE_URL", "MESSAGE_ENCRYPTION_KEY"];

for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required env var: ${key}`);
}

if (process.env.NODE_ENV === "production") {
  // MESSAGE_ENCRYPTION_KEY must be a base64-encoded 32-byte key.
  const key = Buffer.from(process.env.MESSAGE_ENCRYPTION_KEY as string, "base64");
  if (key.length !== 32) {
    throw new Error(
      "MESSAGE_ENCRYPTION_KEY must be a base64-encoded 32-byte key (generate with: node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\")",
    );
  }
}

export const DATABASE_URL: string = process.env.DATABASE_URL as string;
