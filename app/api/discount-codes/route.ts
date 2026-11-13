import { getStore } from "@/app/lib/store";
import { NextResponse } from "next/server";
import { isAdminRequest } from "@/app/lib/admin-auth";

export async function GET() {
  try {
    const store = getStore();
    return NextResponse.json(store.getDiscounts());
  } catch (error) {
    console.error("GET /api/discount-codes error:", error);
    return NextResponse.json({ error: "Failed to load discount codes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    if (!body.code || !body.value) {
      return NextResponse.json({ error: "Code and value are required" }, { status: 400 });
    }

    const store = getStore();
    const newDiscount = store.addDiscount({
      code: body.code.toUpperCase().trim(),
      type: body.type === "fixed" ? "fixed" : "percentage",
      value: Number(body.value),
      minAmount: Number(body.minAmount || 0),
      maxUses: body.maxUses ? Number(body.maxUses) : null,
      expiresAt: body.expiresAt || null,
      active: body.active !== false
    });

    return NextResponse.json(newDiscount, { status: 201 });
  } catch (error) {
    console.error("POST /api/discount-codes error:", error);
    return NextResponse.json({ error: "Failed to create discount code" }, { status: 500 });
  }
}
