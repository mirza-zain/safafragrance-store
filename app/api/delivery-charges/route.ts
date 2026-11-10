import { getStore } from "@/app/lib/store";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const store = getStore();
    return NextResponse.json(store.getDeliveryCharges());
  } catch (error) {
    console.error("GET /api/delivery-charges error:", error);
    return NextResponse.json({ error: "Failed to load delivery charges" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.city || body.amount === undefined) {
      return NextResponse.json({ error: "City and amount are required" }, { status: 400 });
    }

    const store = getStore();
    const newCharge = store.addDeliveryCharge({
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
