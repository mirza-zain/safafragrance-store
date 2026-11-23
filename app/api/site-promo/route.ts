import { NextResponse } from "next/server";
import { isAdminRequest } from "@/app/lib/admin-auth";
import { getSitePromo, upsertSitePromo } from "@/app/lib/neon-promo";

export async function GET(request: Request) {
  try {
    const promo = await getSitePromo();
    const isAdmin = isAdminRequest(request);

    if (!promo || (!promo.isActive && !isAdmin)) {
      return NextResponse.json(
        { promo: null },
        {
          headers: {
            "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
          },
        }
      );
    }

    return NextResponse.json(
      {
        promo: {
          id: promo.id,
          imageUrl: promo.imageUrl,
          linkUrl: promo.linkUrl,
          isActive: promo.isActive,
          updatedAt: promo.updatedAt,
        },
      },
      {
        headers: {
          "Cache-Control": isAdmin
            ? "no-store, no-cache, must-revalidate"
            : "public, s-maxage=30, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/site-promo error:", error);
    return NextResponse.json({ error: "Failed to load promo" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
    const linkUrlRaw = typeof body.linkUrl === "string" ? body.linkUrl.trim() : "";
    const isActive = typeof body.isActive === "boolean" ? body.isActive : true;

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
    }

    const promo = await upsertSitePromo({
      imageUrl,
      linkUrl: linkUrlRaw || null,
      isActive,
    });

    return NextResponse.json({ success: true, promo });
  } catch (error) {
    console.error("PUT /api/site-promo error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save promo" },
      { status: 500 }
    );
  }
}
