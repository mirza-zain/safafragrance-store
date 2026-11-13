import { addNeonDeliveryCharge, listNeonDeliveryCharges } from "@/app/lib/neon-commerce";
import { NextResponse } from "next/server";
import { isAdminRequest } from "@/app/lib/admin-auth";

export async function GET() {
  try {
    const charges = await listNeonDeliveryCharges();
    return NextResponse.json(charges, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("GET /api/delivery-charges error:", error);
    return NextResponse.json({ error: "Failed to load delivery charges" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    if (!body.city || body.amount === undefined || !Number.isFinite(Number(body.amount)) || Number(body.amount) < 0) {
      return NextResponse.json({ error: "City and amount are required" }, { status: 400 });
    }

    const newCharge = await addNeonDeliveryCharge({
      city: body.city.trim(),
      amount: Number(body.amount),
      active: body.active !== false
    });

    return NextResponse.json(newCharge, { status: 201 });
  } catch (error) {
    console.error("POST /api/delivery-charges error:", error);
    return NextResponse.json({ error: "Failed to create delivery charge" }, { status: 500 });
  }
}
