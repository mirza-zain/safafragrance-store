import { NextResponse } from "next/server";
import { COOKIE_NAME, signAdminToken } from "@/app/lib/admin-auth";
import { neon } from "@neondatabase/serverless";
import { verifyPassword } from "better-auth/crypto";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const trimmedEmail = String(email).trim().toLowerCase();
    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl || dbUrl.includes("npg_placeholder") || !dbUrl.startsWith("postgres")) {
      return NextResponse.json(
        { error: "Database not configured. Please check DATABASE_URL." },
        { status: 500 }
      );
    }

    const sql = neon(dbUrl);

    // Query Better Auth database user and credential account
    const accounts = await sql`
      SELECT u.id, u.email, u.role, u.name, a.password
      FROM "user" u
      JOIN "account" a ON a."userId" = u.id
      WHERE LOWER(u.email) = LOWER(${trimmedEmail}) AND a."providerId" = 'credential'
      LIMIT 1;
    `;

    if (!accounts || accounts.length === 0) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const userAccount = accounts[0];

    // Verify hashed password using Better Auth's cryptographic verification
    const isPasswordValid = await verifyPassword({
      hash: userAccount.password,
      password: String(password),
    });

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Role check: Only users with role === 'admin' can access admin console
    // Normal users created via client signup have role === 'client' and are strictly rejected
    if (userAccount.role !== "admin") {
      return NextResponse.json(
        { error: "Access denied. Your account does not have administrator privileges." },
        { status: 403 }
      );
    }

    // Sign secure admin token for verified admin user
    const token = signAdminToken(userAccount.email);

    const response = NextResponse.json({
      success: true,
      message: "Authentication successful",
      user: {
        id: userAccount.id,
        email: userAccount.email,
        name: userAccount.name,
        role: userAccount.role,
      },
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Server error during authentication" }, { status: 500 });
  }
}
