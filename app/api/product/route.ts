import { NextResponse } from "next/server";
import { isAdminRequest } from "@/app/lib/admin-auth";
import { createNeonProduct, listNeonProducts } from "@/app/lib/neon-products";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "all";
    const family = searchParams.get("family") || "all";
    const search = searchParams.get("search") || "";
    const sort = searchParams.get("sort") || "featured";
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const pageSize = Math.max(1, Number(searchParams.get("pageSize") || 8));

    const allProducts = await listNeonProducts();
    const filtered = allProducts
      .filter((product) => category === "all" || product.category === category)
      .filter((product) => family === "all" || product.olfactoryFamily === family)
      .filter((product) => {
        const query = search.trim().toLowerCase();
        return !query || `${product.name} ${product.description} ${product.tagline}`.toLowerCase().includes(query);
      })
      .sort((a, b) => {
        if (sort === "price-low") return a.price - b.price;
        if (sort === "price-high") return b.price - a.price;
        if (sort === "rating") return b.rating - a.rating;
        if (sort === "name") return a.name.localeCompare(b.name);
        return 0;
      });
    const total = filtered.length;
    const result = {
      products: filtered.slice((page - 1) * pageSize, page * pageSize),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/product error:", error);
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    if (!body.name || !body.price || !body.description) {
      return NextResponse.json({ error: "Name, price, and description are required" }, { status: 400 });
    }

    const newProduct = await createNeonProduct({
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
      rating: 5,
      reviewCount: 1,
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("POST /api/product error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
