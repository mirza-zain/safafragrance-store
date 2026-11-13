import { getNeonDiscountByCode, listNeonDeliveryCharges } from "@/app/lib/neon-commerce";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items = body.items || [];
    const city = body.city || "Karachi";
    const country = body.country || "Pakistan";
    const discountCodeInput = (body.discountCode || "").trim().toUpperCase();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({
        subtotal: "0.00",
        discountAmount: "0.00",
        deliveryAmount: "0.00",
        totalAmount: "0.00",
        discountCode: null
      });
    }

    const subtotal = items.reduce((sum: number, item: { price: number; quantity: number }) => {
      return sum + Number(item.price || 0) * Number(item.quantity || 1);
    }, 0);

    const deliveryCharges = await listNeonDeliveryCharges();
    let discountAmount = 0;
    let appliedCode: string | null = null;
    let discountError: string | null = null;

    if (discountCodeInput) {
      const discount = await getNeonDiscountByCode(discountCodeInput);
      if (!discount) {
        discountError = "Invalid discount code.";
      } else if (discount.maxUses && discount.usedCount >= discount.maxUses) {
        discountError = "This promo code has reached its maximum usage limit.";
      } else if (discount.expiresAt && new Date(discount.expiresAt).getTime() < Date.now()) {
        discountError = "This promo code has expired.";
      } else if (subtotal < discount.minAmount) {
        discountError = `Minimum order amount of Rs. ${discount.minAmount} required for this code.`;
      } else {
        appliedCode = discount.code;
        if (discount.type === "percentage") {
          discountAmount = (subtotal * discount.value) / 100;
        } else {
          discountAmount = Math.min(subtotal, discount.value);
        }
      }
    }

    const targetCity = city.trim().toLowerCase();
    const deliveryAmount = country.trim().toLowerCase() === "pakistan"
      ? (deliveryCharges.find((charge) => charge.active && charge.city.toLowerCase() === targetCity)?.amount
        ?? deliveryCharges.find((charge) => charge.active && /other|default|nationwide/i.test(charge.city))?.amount
        ?? 250)
      : (deliveryCharges.find((charge) => charge.active && /other|default|nationwide/i.test(charge.city))?.amount ?? 250);
    const totalAmount = Math.max(0, subtotal - discountAmount + deliveryAmount);

    return NextResponse.json({
      subtotal: subtotal.toFixed(2),
      discountAmount: discountAmount.toFixed(2),
      deliveryAmount: deliveryAmount.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      discountCode: appliedCode,
      discountError
    });
  } catch (error) {
    console.error("POST /api/pricing error:", error);
    return NextResponse.json({ error: "Failed to calculate pricing" }, { status: 500 });
  }
}
