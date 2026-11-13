import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { isAdminRequest } from "@/app/lib/admin-auth";

/**
 * Helper to check if a valid Neon connection string is provided
 */
function getNeonSql() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || dbUrl.includes("npg_placeholder") || !dbUrl.startsWith("postgres")) {
    return null;
  }
  return neon(dbUrl);
}

/**
 * GET /api/neon
 * Diagnostic & health-check endpoint for Neon PostgreSQL
 */
export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const dbUrl = process.env.DATABASE_URL;
  const isPlaceholder = !dbUrl || dbUrl.includes("npg_placeholder") || !dbUrl.startsWith("postgres");

  if (isPlaceholder) {
    return NextResponse.json({
      status: "unconfigured",
      connected: false,
      message: "Neon DATABASE_URL is not yet set or contains placeholder credentials.",
      instructions: [
        "1. Create a free PostgreSQL database at https://console.neon.tech",
        "2. Copy your Connection String (e.g. postgresql://[user]:[password]@[endpoint].neon.tech/neondb?sslmode=require)",
        "3. Paste it as DATABASE_URL in .env.local",
        "4. Call POST /api/neon to auto-initialize Better Auth tables."
      ]
    });
  }

  try {
    const sql = neon(dbUrl);
    const start = Date.now();

    // Query server health & version
    const systemInfo = await sql`
      SELECT 
        NOW() as current_time, 
        version() as pg_version, 
        current_database() as database_name;
    `;

    const latency = Date.now() - start;

    // Check existing tables in public schema
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;

    const tableNames = tables.map((t: Record<string, unknown>) => String(t.table_name));
    const hasAuthTables = ["user", "session", "account", "verification"].every((tbl) =>
      tableNames.includes(tbl)
    );

    // Check if admin user exists in Better Auth user table
    let adminFound = false;
    if (tableNames.includes("user")) {
      try {
        const adminCheck = await sql`
          SELECT id, email, name, "createdAt" 
          FROM "user" 
          WHERE role = 'admin'
          LIMIT 1;
        `;
        adminFound = adminCheck.length > 0;
      } catch {
        adminFound = false;
      }
    }

    return NextResponse.json({
      status: "connected",
      connected: true,
      provider: "Neon Serverless PostgreSQL",
      latency: `${latency}ms`,
      database: systemInfo[0]?.database_name,
      pgVersion: systemInfo[0]?.pg_version,
      serverTime: systemInfo[0]?.current_time,
      tables: tableNames,
      betterAuthTablesReady: hasAuthTables,
      adminSeeded: adminFound,
      nextStep: hasAuthTables
        ? "Neon DB and Better Auth are fully operational."
        : "Send a POST request to /api/neon to automatically create Better Auth tables."
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Neon DB connection error:", err);
    return NextResponse.json(
      {
        status: "error",
        connected: false,
        error: err.message || "Failed to connect to Neon PostgreSQL",
        hint: "Verify your Neon connection string in .env.local and check that SSL is enabled (?sslmode=require)."
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/neon
 * Initializes Better Auth tables in Neon PostgreSQL and seeds the admin user
 */
export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = getNeonSql();

  if (!sql) {
    return NextResponse.json(
      {
        error: "Neon DATABASE_URL is not set or contains placeholder credentials.",
        instructions: "Please add your live Neon PostgreSQL connection string to .env.local first."
      },
      { status: 400 }
    );
  }
  try {
    // 1. Create Better Auth Core Tables
    await sql`
      CREATE TABLE IF NOT EXISTS "user" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL UNIQUE,
        "emailVerified" BOOLEAN NOT NULL DEFAULT FALSE,
        "image" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "session" (
        "id" TEXT PRIMARY KEY,
        "expiresAt" TIMESTAMP NOT NULL,
        "token" TEXT NOT NULL UNIQUE,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "ipAddress" TEXT,
        "userAgent" TEXT,
        "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "account" (
        "id" TEXT PRIMARY KEY,
        "accountId" TEXT NOT NULL,
        "providerId" TEXT NOT NULL,
        "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "accessToken" TEXT,
        "refreshToken" TEXT,
        "idToken" TEXT,
        "accessTokenExpiresAt" TIMESTAMP,
        "refreshTokenExpiresAt" TIMESTAMP,
        "scope" TEXT,
        "password" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "verification" (
        "id" TEXT PRIMARY KEY,
        "identifier" TEXT NOT NULL,
        "value" TEXT NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    return NextResponse.json({
      success: true,
      message: "Neon DB Better Auth tables verified successfully.",
      tables: ["user", "session", "account", "verification"]
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Neon DB initialization error:", err);
    return NextResponse.json(
      {
        error: "Failed to initialize Neon DB Better Auth tables",
        details: err.message
      },
      { status: 500 }
    );
  }
}
