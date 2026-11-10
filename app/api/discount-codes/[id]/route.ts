import { getStore } from "@/app/lib/store";
import { NextResponse } from "next/server";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    const body = await request.json();
    const store = getStore();
    const updated = store.toggleDiscount(Number(id), body.active);

    if (!updated) {
      return NextResponse.json({ error: "Discount not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/discount-codes/[id] error:", error);
    return NextResponse.json({ error: "Failed to update discount" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    const store = getStore();
    const deleted = store.deleteDiscount(Number(id));

    if (!deleted) {
      return NextResponse.json({ error: "Discount not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/discount-codes/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete discount" }, { status: 500 });
  }
}
