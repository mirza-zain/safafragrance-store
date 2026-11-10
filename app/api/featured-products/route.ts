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

