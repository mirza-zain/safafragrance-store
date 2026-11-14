import { betterAuth } from "better-auth";
import { Pool } from "@neondatabase/serverless";

const dbUrl = process.env.DATABASE_URL;
const isConfiguredDb =
  Boolean(dbUrl) &&
  !dbUrl?.includes("npg_placeholder") &&
  Boolean(dbUrl?.startsWith("postgres"));

const trustedOrigins = [
  "https://safafragnance.com",
  "https://safafragrance.vercel.app",
  "https://safafragrance.vercel.com",
  ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
];

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  trustedOrigins,
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
        defaultValue: "client",
      },
    },
  },
});
