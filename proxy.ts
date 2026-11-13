import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminToken, COOKIE_NAME } from "@/app/lib/admin-auth";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes, excluding /admin/login
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const adminToken = request.cookies.get(COOKIE_NAME)?.value;

    if (!adminToken || !verifyAdminToken(adminToken)) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
