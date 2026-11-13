import { getNeonOrderByTrackingId } from "@/app/lib/neon-commerce";
import { NextResponse } from "next/server";

type RouteProps = {
  params: Promise<{ trackingId: string }>;
};

export async function GET(request: Request, { params }: RouteProps) {
  try {
    const { trackingId } = await params;
    const cleanId = trackingId?.trim().toUpperCase();

    if (!cleanId) {
      return NextResponse.json({ error: "Tracking ID is required" }, { status: 400 });
    }

    const order = await getNeonOrderByTrackingId(cleanId);

    if (!order) {
      return NextResponse.json({ error: "No order found matching this tracking code. Please verify the ID on your receipt." }, { status: 404 });
    }

    return NextResponse.json({
      id: order.id,
      trackingId: order.trackingId,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
      subTotal: order.subTotal,
      deliveryAmount: order.deliveryAmount,
      discountAmount: order.discountAmount,
      city: order.city,
      country: order.country,
      carrier: order.carrier || "Safa Concierge Logistics",
      createdAt: order.createdAt,
      items: order.items.map((i) => ({
        productName: i.productName,
        variantLabel: i.variantLabel,
        quantity: i.quantity,
        price: i.price,
        image: i.image
      }))
    });
  } catch (error) {
    console.error("GET /api/track/[trackingId] error:", error);
    return NextResponse.json({ error: "Failed to track order" }, { status: 500 });
  }
}
