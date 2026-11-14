import { getNeonProduct, updateNeonProduct } from "@/app/lib/neon-products";
import { createNeonOrder, getNeonDiscountByCode, incrementNeonDiscountUsage, listNeonDeliveryCharges, listNeonOrders } from "@/app/lib/neon-commerce";
import { NextResponse } from "next/server";
import { isAdminRequest } from "@/app/lib/admin-auth";
import { broadcastNotification } from "@/app/lib/web-push";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const requiredFields = ["firstName", "lastName", "email", "phoneNum", "address", "city", "country", "phoneCountryCode"];
    for (const f of requiredFields) {
      if (!body[f] || typeof body[f] !== "string" || !body[f].trim()) {
        return NextResponse.json({ error: `${f} is required` }, { status: 400 });
      }
    }
    const email = body.email.trim();
    const phone = body.phoneNum.trim();
    const phoneCode = body.phoneCountryCode.trim();
    const address = body.address.trim();
    const country = body.country.trim();
    const city = body.city.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
    }
    if (!/^\+\d{1,4}$/.test(phoneCode) || !/^\d{6,15}$/.test(phone)) {
      return NextResponse.json({ error: "A valid phone country code and number are required" }, { status: 400 });
    }
    if (country.length < 2 || city.length < 2 || address.length < 10 || address.length > 500) {
      return NextResponse.json({ error: "Please provide a valid country, city, and complete address" }, { status: 400 });
    }
    if (
      !/^[\p{L}][\p{L}\s'-]{1,49}$/u.test(body.firstName.trim()) ||
      !/^[\p{L}][\p{L}\s'-]{1,49}$/u.test(body.lastName.trim())
    ) {
      return NextResponse.json({ error: "Please provide valid first and last names" }, { status: 400 });
    }
    // Verify subtotal and stock
    let subTotal = 0;
    const validatedItems = [];

    for (const item of body.items) {
      if (!Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1 || Number(item.quantity) > 99) {
        return NextResponse.json({ error: "Each item must have a valid quantity" }, { status: 400 });
      }
      const product = await getNeonProduct(Number(item.productId || item.id));
      if (!product) {
        return NextResponse.json({ error: `Product ID ${item.productId || item.id} not found` }, { status: 400 });
      }

      let price = product.price;
      let stock = product.stock;

      if (item.variantLabel && product.variants?.length) {
        const variant = product.variants.find((v) => v.label === item.variantLabel);
        if (variant) {
          price = variant.price;
          stock = variant.stock;
        }
      }

      if (stock < item.quantity) {
        return NextResponse.json({ error: `Not enough stock for ${product.name} (${item.variantLabel || "Standard"})` }, { status: 400 });
      }

      const itemTotal = price * item.quantity;
      subTotal += itemTotal;

      validatedItems.push({
        productId: product.id,
        productName: product.name,
        variantLabel: item.variantLabel,
        quantity: item.quantity,
        price,
        image: product.image
      });
    }

    // Pricing calculation
    let discountAmount = 0;
    if (body.discountCode) {
      const discount = await getNeonDiscountByCode(body.discountCode);
      const isExpired = discount?.expiresAt && new Date(discount.expiresAt).getTime() < Date.now();
      const isExhausted = discount?.maxUses !== null && discount?.maxUses !== undefined && discount.usedCount >= discount.maxUses;
      if (
        discount &&
        !isExpired &&
        !isExhausted &&
        (!discount.minAmount || subTotal >= discount.minAmount)
      ) {
        if (discount.type === "percentage") {
          discountAmount = (subTotal * discount.value) / 100;
        } else {
          discountAmount = Math.min(subTotal, discount.value);
        }
      }
    }

    const deliveryCharges = await listNeonDeliveryCharges();
    const deliveryTarget = body.city.trim().toLowerCase();
    const deliveryAmount = body.country.trim().toLowerCase() === "pakistan"
      ? (deliveryCharges.find((charge) => charge.active && charge.city.toLowerCase() === deliveryTarget)?.amount
        ?? deliveryCharges.find((charge) => charge.active && /other|default|nationwide/i.test(charge.city))?.amount
        ?? 250)
      : (deliveryCharges.find((charge) => charge.active && /other|default|nationwide/i.test(charge.city))?.amount ?? 250);
    const totalAmount = Math.max(0, subTotal - discountAmount + deliveryAmount);

    const isKarachi =
      String(body.country || "Pakistan").trim().toLowerCase() === "pakistan" &&
      body.city.trim().toLowerCase() === "karachi";
    let paymentMethod: "cod" | "bank_transfer" =
      body.paymentMethod === "bank_transfer" ? "bank_transfer" : "cod";
    if (paymentMethod === "cod" && !isKarachi) {
      paymentMethod = "bank_transfer";
    }
    if (
      paymentMethod === "bank_transfer" &&
      (typeof body.paymentReceipt !== "string" || !/^https?:\/\//.test(body.paymentReceipt))
    ) {
      return NextResponse.json({ error: "A valid uploaded payment receipt is required for online payment" }, { status: 400 });
    }

    const newOrder = await createNeonOrder({
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      email: body.email.trim(),
      phoneCountryCode: phoneCode,
      phoneNum: phone,
      address,
      city,
      country,
      paymentMethod,
      paymentReceipt: body.paymentReceipt || undefined,
      items: validatedItems,
      subTotal,
      discountCode: discountAmount > 0 ? body.discountCode : undefined,
      discountAmount,
      deliveryAmount,
      totalAmount,
      carrier: country.toLowerCase() === "pakistan" && city.toLowerCase() === "karachi"
        ? "Safa Direct Concierge"
        : "TCS Express"
    });

    if (discountAmount > 0 && body.discountCode) {
      await incrementNeonDiscountUsage(body.discountCode);
    }

    for (const item of validatedItems) {
      const product = await getNeonProduct(item.productId);
      if (!product) continue;

      const updatedVariants = product.variants?.map((variant) =>
        variant.label === item.variantLabel
          ? { ...variant, stock: Math.max(0, variant.stock - item.quantity) }
          : variant
      ) || [];
      const nextStock = updatedVariants.length > 0
        ? updatedVariants.reduce((total, variant) => total + variant.stock, 0)
        : Math.max(0, product.stock - item.quantity);

      await updateNeonProduct(product.id, {
        stock: nextStock,
        variants: updatedVariants
      });
    }

    try {
      await broadcastNotification({
        title: "New order received",
        body: `Order #${newOrder.id} from ${newOrder.firstName} ${newOrder.lastName} · Rs. ${newOrder.totalAmount.toLocaleString()}`,
        url: `/admin/manageOrders/${newOrder.id}`,
        tag: `order-${newOrder.id}`,
      });
    } catch (error) {
      console.error("Order push notification failed:", error);
    }

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const orders = await listNeonOrders();
    return NextResponse.json(orders);
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
  }
}
