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

