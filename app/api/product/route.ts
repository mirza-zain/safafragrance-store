import { getStore } from "@/app/lib/store";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "all";
    const family = searchParams.get("family") || "all";
    const search = searchParams.get("search") || "";
    const sort = searchParams.get("sort") || "featured";
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const pageSize = Math.max(1, Number(searchParams.get("pageSize") || 8));

    const store = getStore();
    const result = store.getProducts({ category, family, search, sort, page, pageSize });

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/product error:", error);
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.price || !body.description) {
      return NextResponse.json({ error: "Name, price, and description are required" }, { status: 400 });
    }

    const store = getStore();
    const newProduct = store.addProduct({
      name: body.name.trim(),
      tagline: body.tagline?.trim() || body.name,
      description: body.description.trim(),
      category: body.category || "unisex",
      olfactoryFamily: body.olfactoryFamily || undefined,
      price: Number(body.price),
      stock: Number(body.stock ?? 0),
      image: body.image || "/images/safaPerfume.png",
      concentration: body.concentration || "Extrait de Parfum • 35%",
      sillage: body.sillage || "Commanding",
      longevity: body.longevity || "14+ Hours",
      season: body.season || "All Seasons",
      notes: body.notes || { top: [], heart: [], base: [] },
      variants: Array.isArray(body.variants) ? body.variants : [],
      isFeatured: Boolean(body.isFeatured),
      rating: 5.0,
      reviewCount: 1
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("POST /api/product error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

