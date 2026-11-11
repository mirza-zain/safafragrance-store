import { betterAuth } from "better-auth";
import { Pool } from "@neondatabase/serverless";

const dbUrl = process.env.DATABASE_URL;
const isConfiguredDb =
  Boolean(dbUrl) &&
  !dbUrl?.includes("npg_placeholder") &&
  Boolean(dbUrl?.startsWith("postgres"));

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || "safa-fragrance-better-auth-secret-key-2026-786",
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ...(isConfiguredDb
    ? {
        database: new Pool({
          connectionString: dbUrl,
        }),
      }
    : {}),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "admin",
      },
    },
  },
});
