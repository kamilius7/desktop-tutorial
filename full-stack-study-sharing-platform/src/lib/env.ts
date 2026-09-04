/**
 * Validate only the connection required to initialize the database. Optional
 * feature secrets are validated at the point where that feature is used so a
 * missing messaging secret cannot crash public pages during module loading.
 * NEVER import this from a "use client" component.
 */
if (!process.env.DATABASE_URL) {
  throw new Error("Missing required env var: DATABASE_URL");
}

if (process.env.MESSAGE_ENCRYPTION_KEY) {
  // MESSAGE_ENCRYPTION_KEY must be a base64-encoded 32-byte key when set.
  const key = Buffer.from(process.env.MESSAGE_ENCRYPTION_KEY, "base64");
  if (key.length !== 32) {
    throw new Error(
      "MESSAGE_ENCRYPTION_KEY must be a base64-encoded 32-byte key (generate with: node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\")",
    );
  }
}

export const DATABASE_URL: string = process.env.DATABASE_URL as string;
