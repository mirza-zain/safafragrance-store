import { getStore } from "@/app/lib/store";
import { NextResponse } from "next/server";
import { isAdminRequest } from "@/app/lib/admin-auth";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    const store = getStore();
    const product = store.getProductById(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("GET /api/productDetail/[id] error:", error);
    return NextResponse.json({ error: "Failed to load product" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteProps) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const body = await request.json();
    const store = getStore();
    const updated = store.updateProduct(Number(id), body);

    if (!updated) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/productDetail/[id] error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteProps) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const store = getStore();
    const deleted = store.deleteProduct(Number(id));

    if (!deleted) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/productDetail/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
