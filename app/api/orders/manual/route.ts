import { getStore } from "@/app/lib/store";
import { NextResponse } from "next/server";
import crypto from "node:crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      channel = "instagram",
      customerName = "Customer",
      phoneNum = "",
      city = "Karachi",
      address = "Direct / Social Sale",
      email = "orders@safaperfumes.pk",
      items = [],
      paymentMethod = "Cash",
      paymentStatus = "paid",
      orderStatus = "delivered",
      deliveryAmount = 0,
      discountAmount = 0,
      notes = ""
    } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "At least one item is required" }, { status: 400 });
    }

    const store = getStore();
    const parts = customerName.trim().split(" ");
    const firstName = parts[0] || "Customer";
    const lastName = parts.slice(1).join(" ") || "";

    const calculatedSubtotal = items.reduce((sum: number, it: { price: number; quantity: number }) => {
      return sum + Number(it.price) * Number(it.quantity);
    }, 0);

    const totalAmount = Math.max(0, calculatedSubtotal + Number(deliveryAmount) - Number(discountAmount));

    const prefix = channel === "instagram" ? "IG" : channel === "reference" ? "REF" : channel === "whatsapp" ? "WA" : "DIR";
    const trackingId = `${prefix}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    const order = store.createOrder({
      firstName,
      lastName,
      email: email || "direct@safaperfumes.pk",
      phoneCountryCode: "+92",
      phoneNum: phoneNum || "03001234567",
      address: address || "Direct Sale",
      city: city || "Karachi",
      country: "Pakistan",
      notes: notes ? `[${channel.toUpperCase()}] ${notes}` : `[${channel.toUpperCase()}] Manual Sale`,
      items: items.map((it: { productId: number; variantLabel?: string; quantity: number; price: number }) => {
        const prod = store.getProductById(Number(it.productId));
        return {
          productId: Number(it.productId),
          productName: prod ? prod.name : `Fragrance #${it.productId}`,
          variantLabel: it.variantLabel || "Standard",
          quantity: Number(it.quantity),
          price: Number(it.price),
          image: prod ? prod.image : "/images/featurev1.png"
        };
      }),
      subTotal: calculatedSubtotal,
      deliveryAmount: Number(deliveryAmount),
      discountAmount: Number(discountAmount),
      discountCode: channel,
      totalAmount: totalAmount,
      paymentMethod: paymentMethod === "Cash" ? "cod" : "bank_transfer",
      paymentStatus: paymentStatus === "paid" ? "paid" : "unpaid"
    });

    if (orderStatus !== "pending") {
      store.updateOrderStatus(order.id, { status: orderStatus, trackingId });
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("POST /api/orders/manual error:", error);
    return NextResponse.json({ error: "Failed to record manual sale" }, { status: 500 });
  }
}
