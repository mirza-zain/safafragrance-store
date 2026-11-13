import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { isAdminRequest } from "@/app/lib/admin-auth";
import { getNeonFeaturedProducts, setNeonFeaturedProducts } from "@/app/lib/neon-products";

export async function GET() {
  try {
    const featured = await getNeonFeaturedProducts();
    return NextResponse.json(
      { featuredProducts: featured },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/featured-products error:", error);
    return NextResponse.json({ error: "Failed to load featured products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!isAdminRequest(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const { featuredProductIds } = body;
    if (!Array.isArray(featuredProductIds)) {
      return NextResponse.json(
        { error: "Invalid featuredProductIds: expected array of IDs" },
        { status: 400 }
      );
    }
    const updated = await setNeonFeaturedProducts(featuredProductIds);
    revalidateTag("featured-products", "max");
    revalidatePath("/", "layout");
    revalidatePath("/admin/manageProducts");
    return NextResponse.json({ success: true, featuredProducts: updated });
  } catch (error) {
    console.error("POST /api/featured-products error:", error);
    return NextResponse.json({ error: "Failed to update featured products" }, { status: 500 });
  }
}
