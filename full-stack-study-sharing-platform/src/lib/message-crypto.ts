import "@/lib/env";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const VERSION = "v1";

function key() {
  const encoded = process.env.MESSAGE_ENCRYPTION_KEY;
  if (!encoded) throw new Error("MESSAGE_ENCRYPTION_KEY is required to process messages");
  const value = Buffer.from(encoded, "base64");
  if (value.length !== 32) throw new Error("MESSAGE_ENCRYPTION_KEY must be a base64-encoded 32-byte key");
  return value;
}

/** AES-256-GCM envelope: version.iv.authTag.ciphertext (all base64). */
export function encryptMessage(plaintext: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return [VERSION, iv.toString("base64"), cipher.getAuthTag().toString("base64"), ciphertext.toString("base64")].join(".");
}

export function decryptMessage(envelope: string) {
  const [version, iv, authTag, ciphertext] = envelope.split(".");
  if (version !== VERSION || !iv || !authTag || !ciphertext) throw new Error("Invalid encrypted message payload");
  const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(authTag, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(ciphertext, "base64")), decipher.final()]).toString("utf8");
}
