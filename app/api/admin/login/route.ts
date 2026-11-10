import { NextResponse } from "next/server";
import { ADMIN_EMAIL, ADMIN_PASSWORD, COOKIE_NAME, signAdminToken } from "@/app/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const trimmedEmail = String(email).trim().toLowerCase();
    const expectedEmail = ADMIN_EMAIL.trim().toLowerCase();

    if (trimmedEmail !== expectedEmail || String(password) !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Invalid admin email or password" }, { status: 401 });
    }

    const token = signAdminToken(trimmedEmail);

    const response = NextResponse.json({ success: true, message: "Authentication successful" });
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Server error during authentication" }, { status: 500 });
  }
}
