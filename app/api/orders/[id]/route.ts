import { getStore } from "@/app/lib/store";
import { NextResponse } from "next/server";
import { isAdminRequest } from "@/app/lib/admin-auth";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteProps) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const store = getStore();
    const order = store.getOrderById(Number(id));

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("GET /api/orders/[id] error:", error);
    return NextResponse.json({ error: "Failed to load order" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteProps) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const body = await request.json();
    const store = getStore();
    const updated = store.updateOrderStatus(Number(id), body);

    if (!updated) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/orders/[id] error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteProps) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const store = getStore();
    const deleted = store.deleteOrder(Number(id));

    if (!deleted) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/orders/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}

