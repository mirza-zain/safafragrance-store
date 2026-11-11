'use client';

import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  Trash2,
  ArrowLeft,
  Plus,
  Minus,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { useEffect, useState } from "react";

export default function CartPage() {
  const { cart, addToCart, decreaseQuantity, removeFromCart, hasHydrated } = useCart();
  const [delivery, setDelivery] = useState(0);

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const total = subtotal + delivery;

  useEffect(() => {
    if (cart.length === 0) return;
    fetch("/api/pricing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cart }),
    })
      .then((res) => res.json())
      .then((data) => setDelivery(Number(data.deliveryAmount ?? 0)))
      .catch(() => setDelivery(0));
  }, [cart]);

  if (!hasHydrated) {
    return (
      <main className="w-full min-h-[75vh] flex items-center justify-center px-4 py-16">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="size-16 rounded-full bg-neutral-200" />
          <div className="h-5 w-40 rounded bg-neutral-200" />
        </div>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="w-full min-h-[75vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center flex flex-col items-center">
          <div className="size-20 rounded-full bg-[#faf7f2] border border-[#e7decb] flex items-center justify-center mb-6">
            <ShoppingBag className="size-10 text-[#b39b66]" />
          </div>
          <h1 className="text-3xl font-bold uppercase tracking-wider text-[#0e281d] font-[Galsod]">
            Your Cart is Empty
          </h1>
          <p className="mt-3 text-neutral-700 text-sm sm:text-base leading-relaxed font-normal">
            Looks like you haven&apos;t added any luxury fragrances to your collection yet.
          </p>
          <Link
            href="/product"
            className="mt-8 px-8 py-4 bg-[#1b4431] text-white text-xs sm:text-sm font-semibold uppercase tracking-wider rounded-xl hover:bg-[#0e281d] transition active:scale-[0.98] shadow-md border border-[#255840]"
          >
            Explore Fragrances
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full min-h-[80vh] py-10 sm:py-16 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-6 border-b border-neutral-200">
        <div>
          <Link
            href="/product"
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-neutral-600 hover:text-[#1b4431] uppercase tracking-wider font-semibold transition mb-2"
          >
            <ArrowLeft className="size-4" /> Continue Shopping
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold uppercase tracking-wider text-[#0e281d] font-[Galsod]">
            Shopping Cart{" "}
            <span className="text-base sm:text-lg font-normal text-neutral-500 font-sans">
              ({totalItems} {totalItems === 1 ? "item" : "items"})
            </span>
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {cart.map((item) => (
            <div
              key={`${item.id}-${item.variantLabel || "default"}`}
              className="bg-white p-4 sm:p-6 rounded-2xl border border-[#e7decb] shadow-xs flex flex-col sm:flex-row items-center gap-5 sm:gap-6"
            >
              {/* Product Thumbnail */}
              <div className="relative w-28 h-28 sm:w-24 sm:h-24 aspect-square rounded-xl overflow-hidden border border-[#eee6d7] shrink-0 bg-[#faf7f2]">
                <Image
                  src={item.image || "/images/safaPerfume.png"}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Product Info */}
              <div className="flex-1 text-center sm:text-left min-w-0">
                <p className="text-[11px] uppercase tracking-wider text-[#b39b66] font-semibold">
                  Safa Fragrance ©
                </p>
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 truncate mt-0.5 font-sans tracking-wide">
                  {item.name}
                </h3>
                {item.variantLabel && (
                  <p className="text-xs font-semibold text-[#1b4431] mt-0.5">
                    Edition: {item.variantLabel}
                  </p>
                )}
                <p className="text-xs sm:text-sm text-neutral-600 line-clamp-1 mt-1 font-normal">
                  {item.description}
                </p>
                <p className="text-base sm:text-lg font-bold text-[#1b4431] mt-2 sm:hidden">
                  Rs. {(item.price * item.quantity).toLocaleString()}
                </p>
              </div>

              {/* Stepper Quantity Controls & Total */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#eee6d7]">
                <p className="hidden sm:block text-lg font-bold text-[#1b4431]">
                  Rs. {(item.price * item.quantity).toLocaleString()}
                </p>

                <div className="flex items-center gap-3">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-[#e7decb] rounded-lg overflow-hidden bg-[#faf7f2]">
                    <button
                      type="button"
                      onClick={() => decreaseQuantity(item.id, item.variantLabel)}
                      className="p-2 hover:bg-[#e7decb] text-[#1b4431] transition active:bg-[#d8c38c]"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="px-3 py-1 text-sm font-semibold text-neutral-900 select-none min-w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => addToCart(item)}
                      className="p-2 hover:bg-[#e7decb] text-[#1b4431] transition active:bg-[#d8c38c]"
                      aria-label="Increase quantity"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id, item.variantLabel)}
                    className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Remove item"
                    aria-label="Remove item"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-2xl border border-[#e7decb] shadow-xs sticky top-24">
          <h2 className="text-xl font-bold uppercase tracking-wider text-[#0e281d] pb-4 border-b border-[#eee6d7] font-[Galsod]">
            Order Summary
          </h2>

          <div className="space-y-4 py-5 text-sm border-b border-[#eee6d7]">
            <div className="flex justify-between text-neutral-600">
              <span>
                Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"})
              </span>
              <span className="font-semibold text-neutral-900">Rs. {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Estimated Delivery</span>
              <span className="font-semibold text-[#1b4431]">
                {delivery === 0 ? "Complimentary" : `Rs. ${delivery.toLocaleString()}`}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center py-5 text-lg font-bold text-neutral-900">
            <span>Total</span>
            <span className="text-[#1b4431] text-xl">Rs. {total.toLocaleString()}</span>
          </div>

          <Link
            href="/payment"
            className="w-full mt-2 py-4 bg-[#1b4431] text-white text-sm sm:text-base font-semibold uppercase tracking-wider rounded-xl hover:bg-[#0e281d] transition flex items-center justify-center text-center active:scale-[0.98] shadow-md border border-[#255840]"
          >
            Proceed to Checkout
          </Link>

          {/* Trust Guarantees */}
          <div className="mt-8 pt-6 border-t border-[#eee6d7] space-y-3">
            <div className="flex items-center gap-3 text-xs text-neutral-600 font-medium">
              <Truck className="size-4 text-[#1b4431] shrink-0" />
              <span>Fast, secure delivery across Pakistan</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-neutral-600 font-medium">
              <ShieldCheck className="size-4 text-[#1b4431] shrink-0" />
              <span>100% authentic artisanal concentrated oils</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
