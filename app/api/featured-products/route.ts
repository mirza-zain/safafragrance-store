import { getStore } from "@/app/lib/store";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const store = getStore();
    const featured = store.getFeaturedProducts();
    return NextResponse.json({ featuredProducts: featured });
  } catch (error) {
    console.error("GET /api/featured-products error:", error);
    return NextResponse.json({ error: "Failed to load featured products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { featuredProductIds } = body;
    if (!Array.isArray(featuredProductIds)) {
      return NextResponse.json({ error: "Invalid featuredProductIds: expected array of IDs" }, { status: 400 });
    }
    const store = getStore();
    const updated = store.setFeaturedProducts(featuredProductIds);
    return NextResponse.json({ success: true, featuredProducts: updated });
  } catch (error) {
    console.error("POST /api/featured-products error:", error);
    return NextResponse.json({ error: "Failed to update featured products" }, { status: 500 });
  }
}


