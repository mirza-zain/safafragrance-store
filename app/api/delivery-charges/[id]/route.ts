import { deleteNeonDeliveryCharge, toggleNeonDeliveryCharge } from "@/app/lib/neon-commerce";
import { NextResponse } from "next/server";
import { isAdminRequest } from "@/app/lib/admin-auth";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: RouteProps) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const body = await request.json();
    const updated = await toggleNeonDeliveryCharge(Number(id), body.active);

    if (!updated) {
      return NextResponse.json({ error: "Delivery charge not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/delivery-charges/[id] error:", error);
    return NextResponse.json({ error: "Failed to update delivery charge" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteProps) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const deleted = await deleteNeonDeliveryCharge(Number(id));

    if (!deleted) {
      return NextResponse.json({ error: "Delivery charge not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/delivery-charges/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete delivery charge" }, { status: 500 });
  }
}
