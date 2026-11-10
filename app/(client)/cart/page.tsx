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
  ArrowRight,
  Sparkles,
  Tag
} from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { useEffect, useState } from "react";

export default function CartPage() {
  const { cart, addToCart, decreaseQuantity, removeFromCart, totalItems, subtotal } = useCart();
  const [delivery, setDelivery] = useState(250);
  const [discountCode, setDiscountCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  const freeShippingThreshold = 6000;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const diff = freeShippingThreshold - subtotal;

  useEffect(() => {
    if (subtotal >= freeShippingThreshold) {
      setDelivery(0);
    } else {
      setDelivery(250);
    }
  }, [subtotal]);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);
    setPromoMessage(null);

    if (!discountCode.trim()) return;

    try {
      const res = await fetch("/api/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          city: "Karachi",
          discountCode: discountCode.trim().toUpperCase()
        })
      });

      const data = await res.json();
      if (data.discountError) {
        setPromoError(data.discountError);
        setDiscountAmount(0);
      } else if (Number(data.discountAmount) > 0) {
        setDiscountAmount(Number(data.discountAmount));
        setPromoMessage(`Promo code ${data.discountCode} applied successfully!`);
      } else {
        setPromoError("This promo code does not apply to your cart.");
        setDiscountAmount(0);
      }
    } catch {
      setPromoError("Failed to validate promo code.");
    }
  };

  const grandTotal = Math.max(0, subtotal - discountAmount + delivery);

  if (cart.length === 0) {
    return (
      <main className="w-full min-h-[75vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center flex flex-col items-center">
          <div className="size-24 rounded-full bg-white border border-[#e5dbc7] flex items-center justify-center mb-6 shadow-sm">
            <ShoppingBag className="size-12 text-[#b39b66]" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 font-serif">
            Your Fragrance Bag is Empty
          </h1>
          <p className="mt-3 text-neutral-600 text-sm sm:text-base leading-relaxed font-light">
            You have not selected any luxury extrait formulations yet. Discover our private blends and find your signature note.
          </p>
          <Link
            href="/shop"
            className="mt-8 px-8 py-4 bg-[#1b4431] text-[#f2ece2] font-bold text-xs uppercase tracking-widest rounded-full hover:bg-[#123023] transition shadow-lg active:scale-[0.98]"
          >
            Explore Fragrances →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full min-h-[80vh] py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-[#eee6d7]">
        <div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-[#1b4431] transition mb-2"
          >
            <ArrowLeft size={14} /> Continue Shopping
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-900 font-serif">
            Shopping Bag{" "}
            <span className="text-base font-normal text-neutral-500 font-sans">
              ({totalItems} {totalItems === 1 ? "edition" : "editions"})
            </span>
          </h1>
        </div>
      </div>

      {/* Free Shipping Tier Banner */}
      <div className="mb-8 p-4 bg-white rounded-2xl border border-[#e5dbc7] shadow-xs">
        <div className="flex justify-between items-center text-xs mb-2 font-medium">
          <span className="flex items-center gap-1.5 text-[#1b4431] font-bold">
            <Sparkles size={14} className="text-[#b39b66]" />
            {diff <= 0
              ? "Complimentary Nationwide Express Delivery unlocked!"
              : `Add Rs. ${diff.toLocaleString()} more for Free Express Delivery`}
          </span>
          <span className="text-neutral-500">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 bg-[#f0e8d9] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#b39b66] to-[#1b4431] transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {cart.map((item) => (
            <div
              key={`${item.id}-${item.variantLabel}`}
              className="bg-white p-5 sm:p-6 rounded-3xl border border-[#e5dbc7] shadow-xs flex flex-col sm:flex-row items-center gap-5 sm:gap-6"
            >
              {/* Product Thumbnail */}
              <div className="relative size-28 sm:size-24 rounded-2xl overflow-hidden border border-[#eee6d7] bg-[#faf7f2] shrink-0">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>

              {/* Product Info */}
              <div className="flex-1 text-center sm:text-left min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-[#b39b66] font-bold">
                  Safa Haute Parfumerie
                </p>
                <h3 className="text-lg sm:text-xl font-bold text-neutral-900 truncate mt-0.5 font-serif">
                  {item.name}
                </h3>
                {item.variantLabel && (
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-[#faf7f2] border border-[#e5dbc7] text-xs font-semibold text-neutral-700">
                    {item.variantLabel}
                  </span>
                )}
                <p className="text-xs text-neutral-500 line-clamp-1 mt-1 font-light">
                  {item.description}
                </p>
                <p className="text-base font-bold text-[#1b4431] mt-2 sm:hidden">
                  Rs. {(item.price * item.quantity).toLocaleString()}
                </p>
              </div>

              {/* Stepper Controls & Total */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 pt-4 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                <p className="hidden sm:block text-lg font-bold text-[#1b4431]">
                  Rs. {(item.price * item.quantity).toLocaleString()}
                </p>

                <div className="flex items-center gap-3">
                  {/* Stepper */}
                  <div className="flex items-center border border-[#d8cbb5] rounded-xl overflow-hidden bg-[#faf7f2]">
                    <button
                      onClick={() => decreaseQuantity(item.id, item.variantLabel)}
                      className="p-2 hover:bg-[#e7decb] text-neutral-700 transition"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="px-3 py-1 text-xs font-bold text-neutral-900 min-w-8 text-center select-none">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => addToCart(item, item.variantLabel)}
                      className="p-2 hover:bg-[#e7decb] text-neutral-700 transition"
                      aria-label="Increase quantity"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.id, item.variantLabel)}
                    className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#e5dbc7] shadow-md sticky top-24 space-y-5">
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 pb-4 border-b border-[#eee6d7] font-serif">
            Order Summary
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-neutral-600">
              <span>Subtotal ({totalItems} items)</span>
              <span className="font-semibold text-neutral-900">Rs. {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Estimated Delivery</span>
              <span className="font-semibold text-neutral-900">
                {delivery === 0 ? "FREE" : `Rs. ${delivery.toLocaleString()}`}
              </span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Discount Applied</span>
                <span>- Rs. {discountAmount.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Promo code input */}
          <form onSubmit={handleApplyPromo} className="pt-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  placeholder="Promo Code (e.g. SAFA10)"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#e5dbc7] text-xs font-bold uppercase placeholder-neutral-400 focus:outline-hidden focus:border-[#1b4431]"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-[#1b4431] text-white text-xs font-bold uppercase tracking-wider transition"
              >
                Apply
              </button>
            </div>
            {promoMessage && <p className="text-xs text-emerald-700 font-semibold mt-2">{promoMessage}</p>}
            {promoError && <p className="text-xs text-red-600 mt-2">{promoError}</p>}
          </form>

          {/* Grand Total */}
          <div className="pt-4 border-t border-[#eee6d7] flex justify-between items-baseline">
            <span className="text-lg font-bold text-neutral-900 font-serif">Grand Total</span>
            <span className="text-2xl font-black text-[#1b4431]">
              Rs. {grandTotal.toLocaleString()}
            </span>
          </div>

          <Link
            href={`/payment?id=${cart[0]?.id}`}
            className="w-full py-4 bg-[#1b4431] hover:bg-[#123023] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition flex items-center justify-center gap-2 shadow-lg active:scale-[0.98]"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight size={16} />
          </Link>

          {/* Guarantees */}
          <div className="pt-4 border-t border-[#eee6d7] space-y-2 text-xs text-neutral-500 font-light">
            <p className="flex items-center gap-2">
              <Truck size={15} className="text-[#1b4431] shrink-0" />
              <span>Complimentary insured air shipping over Rs. 6,000</span>
            </p>
            <p className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-[#1b4431] shrink-0" />
              <span>Cash on Delivery (Karachi) & Instant Bank Transfer</span>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

