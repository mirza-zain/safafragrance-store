import { getStore } from "@/app/lib/store";
import { NextResponse } from "next/server";
import { isAdminRequest } from "@/app/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const requiredFields = ["firstName", "lastName", "email", "phoneNum", "address", "city"];
    for (const f of requiredFields) {
      if (!body[f] || typeof body[f] !== "string" || !body[f].trim()) {
        return NextResponse.json({ error: `${f} is required` }, { status: 400 });
      }
    }

    const store = getStore();

    // Verify subtotal and stock
    let subTotal = 0;
    const validatedItems = [];

    for (const item of body.items) {
      const product = store.getProductById(Number(item.productId || item.id));
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
      const discount = store.getDiscountByCode(body.discountCode);
      if (discount && (!discount.minAmount || subTotal >= discount.minAmount)) {
        if (discount.type === "percentage") {
          discountAmount = (subTotal * discount.value) / 100;
        } else {
          discountAmount = Math.min(subTotal, discount.value);
        }
      }
    }

    const deliveryAmount = store.calculateDelivery(body.city, subTotal);
    const totalAmount = Math.max(0, subTotal - discountAmount + deliveryAmount);

    const isKarachi = body.city.trim().toLowerCase() === "karachi";
    let paymentMethod: "cod" | "bank_transfer" =
      body.paymentMethod === "bank_transfer" ? "bank_transfer" : "cod";
    if (paymentMethod === "cod" && !isKarachi) {
      paymentMethod = "bank_transfer";
    }

    const newOrder = store.createOrder({
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      email: body.email.trim(),
      phoneCountryCode: body.phoneCountryCode || "+92",
      phoneNum: body.phoneNum.trim(),
      address: body.address.trim(),
      city: body.city.trim(),
      country: body.country || "Pakistan",
      paymentMethod,
      paymentReceipt: body.paymentReceipt || undefined,
      items: validatedItems,
      subTotal,
      discountCode: discountAmount > 0 ? body.discountCode : undefined,
      discountAmount,
      deliveryAmount,
      totalAmount,
      carrier: body.city.toLowerCase() === "karachi" ? "Safa Direct Concierge" : "TCS Express"
    });

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
    const store = getStore();
    const orders = store.getOrders();
    return NextResponse.json(orders);
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
  }
}
