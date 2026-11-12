'use client';

import Image from "next/image";
import Link from "next/link";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { useEffect } from "react";

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, addToCart, decreaseQuantity, removeFromCart, totalItems, subtotal } = useCart();

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#faf7f2] border-l border-[#e7decb] shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-[#e7decb] bg-white/70 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-full bg-[#1b4431] text-[#d8c38c] flex items-center justify-center">
                  <ShoppingBag size={16} />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-neutral-900 font-serif">Your Fragrance Bag</h2>
                  <p className="text-xs text-neutral-500 font-medium">
                    {totalItems} {totalItems === 1 ? "edition" : "editions"} selected
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-full hover:bg-neutral-200/70 text-neutral-600 transition"
                aria-label="Close cart"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="size-20 rounded-full bg-white border border-[#e7decb] flex items-center justify-center shadow-xs mb-4">
                  <ShoppingBag size={32} className="text-[#b39b66]" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 font-serif">Your Bag is Empty</h3>
                <p className="text-sm text-neutral-500 max-w-xs mt-2 leading-relaxed">
                  Discover our concentrated Extrait de Parfum creations and find your signature scent.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-6 px-6 py-3 rounded-full bg-[#1b4431] text-[#f2ece2] text-xs font-bold uppercase tracking-widest hover:bg-[#123023] transition shadow-md"
                >
                  Explore Editions
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={`${item.id}-${item.variantLabel}`}
                  className="bg-white rounded-2xl p-4 border border-[#e8dfcf] shadow-xs flex gap-3.5 items-center"
                >
                  <div className="relative size-20 rounded-xl overflow-hidden bg-[#faf7f2] border border-[#eee6d7] shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#b39b66]">Safa Fragrance</span>
                    <h4 className="text-sm font-bold text-neutral-900 truncate">{item.name}</h4>
                    {item.variantLabel && (
                      <span className="inline-block px-2 py-0.5 mt-0.5 rounded-md bg-[#faf7f2] border border-[#e8dfcf] text-[11px] font-medium text-neutral-600">
                        {item.variantLabel}
                      </span>
                    )}
                    <p className="text-sm font-semibold text-[#1b4431] mt-1">
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-col items-end justify-between gap-2">
                    <button
                      onClick={() => removeFromCart(item.id, item.variantLabel)}
                      className="text-neutral-400 hover:text-red-600 transition p-1"
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="flex items-center border border-[#d8cbb5] rounded-lg bg-[#faf7f2] overflow-hidden">
                      <button
                        onClick={() => decreaseQuantity(item.id, item.variantLabel)}
                        className="px-2 py-1 text-neutral-600 hover:bg-[#e7decb] transition"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="px-2 text-xs font-bold text-neutral-900 min-w-5 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => addToCart(item, item.variantLabel)}
                        className="px-2 py-1 text-neutral-600 hover:bg-[#e7decb] transition"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cart.length > 0 && (
            <div className="p-5 sm:p-6 border-t border-[#e7decb] bg-white/90 backdrop-blur-md space-y-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-neutral-900">Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-neutral-600 text-xs">
                  <span>Estimated Delivery</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-100 flex justify-between items-baseline">
                <span className="font-bold text-neutral-900 font-sans uppercase tracking-wider text-sm">Total</span>
                <span className="text-xl font-black text-neutral-900">Rs. {subtotal.toLocaleString()}</span>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <Link
                  href="/payment"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-4 rounded-xl bg-[#1b4431] hover:bg-[#0e281d] text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.98] border border-[#255840]"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={16} />
                </Link>

                <Link
                  href="/cart"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-2.5 rounded-xl border border-[#d8cbb5] bg-[#faf7f2] hover:bg-white text-neutral-800 text-xs font-semibold uppercase tracking-wider text-center transition"
                >
                  View Full Cart & Apply Coupons
                </Link>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-500 pt-1">
                <ShieldCheck size={14} className="text-[#1b4431]" />
                <span>100% Authentic Extrait de Parfum • Sealed Packaging</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

