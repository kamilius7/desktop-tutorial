import { defineConfig } from "drizzle-kit";

// Credentials come from the environment only — never hardcode a DB URL here.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
