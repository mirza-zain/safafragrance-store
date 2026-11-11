'use client';

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  AlertCircle,
  Phone,
  Sparkles,
  ShieldCheck
} from "lucide-react";

type TrackedOrder = {
  id: number;
  trackingId: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentMethod: string;
  paymentStatus: string;
  totalAmount: number;
  subTotal: number;
  deliveryAmount: number;
  discountAmount: number;
  city: string;
  country: string;
  carrier: string;
  createdAt: string;
  items: Array<{
    productName: string;
    variantLabel?: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
};

function TrackContent() {
  const searchParams = useSearchParams();
  const urlId = searchParams.get("id");

  const [trackingId, setTrackingId] = useState(urlId || "");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (urlId) {
      lookupOrder(urlId);
    }
  }, [urlId]);

  const lookupOrder = async (idToSearch: string) => {
    const clean = idToSearch.trim().toUpperCase();
    if (!clean) return;

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const res = await fetch(`/api/track/${clean}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order not found");
      setOrder(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    lookupOrder(trackingId);
  };

  const getStepIndex = (status: TrackedOrder["status"]) => {
    switch (status) {
      case "pending":
        return 1;
      case "processing":
        return 2;
      case "shipped":
        return 3;
      case "delivered":
        return 4;
      default:
        return 0;
    }
  };

  const activeStep = order ? getStepIndex(order.status) : 0;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-10">
      {/* Search Bar Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e5dbc7] shadow-xs text-center space-y-5">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
              placeholder="e.g. SAFA-9A4B8C1D"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#e5dbc7] bg-[#faf7f2] text-sm font-mono uppercase tracking-wider text-neutral-800 placeholder-neutral-400 focus:outline-hidden focus:border-[#1b4431]"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-xl bg-[#1b4431] hover:bg-[#0e281d] text-white font-bold text-xs uppercase tracking-widest transition shadow-md border border-[#255840] disabled:opacity-50"
          >
            {loading ? "Searching..." : "Track Parcel"}
          </button>
        </form>

        <p className="text-xs text-neutral-500">
          Tip: You can find your tracking code on your order confirmation screen or confirmation receipt.
        </p>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
          <AlertCircle size={20} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Order Details Found */}
      {order && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#e5dbc7] shadow-xl space-y-10 animate-in fade-in duration-300">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#eee6d7]">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#b39b66]">
                Artisanal Parcel Logged
              </span>
              <div className="flex items-center gap-3 mt-1">
                <h2 className="text-2xl font-black font-mono tracking-wider text-neutral-900">
                  {order.trackingId}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(order.trackingId);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="p-1.5 rounded-lg border border-neutral-300 hover:border-black transition text-neutral-600"
                  title="Copy Tracking ID"
                >
                  {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-neutral-500 block">Status:</span>
              <span className="inline-block px-3 py-1 mt-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                {order.status}
              </span>
            </div>
          </div>

          {/* Visual Progress Timeline */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">
              Courier Milestones
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
              {[
                { step: 1, label: "Order Received", desc: "Logged in Safa studio", icon: Package },
                { step: 2, label: "Bottling & Sealing", desc: "Hand-poured & sealed", icon: Sparkles },
                { step: 3, label: "In Transit", desc: order.carrier || "Courier dispatched", icon: Truck },
                { step: 4, label: "Delivered", desc: "Safely received", icon: CheckCircle2 }
              ].map((s) => {
                const Icon = s.icon;
                const isDone = activeStep >= s.step;
                const isCurrent = activeStep === s.step;

                return (
                  <div
                    key={s.step}
                    className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                      isDone
                        ? "bg-[#faf7f2] border-[#1b4431] shadow-xs"
                        : "bg-white border-[#f0e8d9] opacity-50"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div
                        className={`size-8 rounded-xl flex items-center justify-center ${
                          isDone ? "bg-[#1b4431] text-[#d8c38c]" : "bg-neutral-100 text-neutral-400"
                        }`}
                      >
                        <Icon size={16} />
                      </div>
                      <span className="text-[10px] font-bold text-neutral-400">0{s.step}</span>
                    </div>

                    <div>
                      <p className={`text-xs font-bold ${isDone ? "text-neutral-900" : "text-neutral-500"}`}>
                        {s.label}
                      </p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-[#eee6d7]">
            {/* Items */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                Fragrance Editions ({order.items.length})
              </h4>
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-[#faf7f2] border border-[#eee6d7]">
                    <div>
                      <p className="text-xs font-bold text-neutral-900">{item.productName}</p>
                      {item.variantLabel && (
                        <p className="text-[10px] text-neutral-500 font-medium">{item.variantLabel}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-[#1b4431]">
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-neutral-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Logistics & Payment */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                Logistics & Verification
              </h4>
              <div className="p-4 rounded-2xl bg-[#faf7f2] border border-[#eee6d7] space-y-2.5 text-xs text-neutral-600">
                <div className="flex justify-between">
                  <span>Destination:</span>
                  <span className="font-semibold text-neutral-900">{order.city}, {order.country}</span>
                </div>
                <div className="flex justify-between">
                  <span>Carrier:</span>
                  <span className="font-semibold text-neutral-900">{order.carrier}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="font-semibold text-neutral-900 capitalize">
                    {order.paymentMethod === "cod" ? "Cash on Delivery" : "Bank Transfer"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Verification:</span>
                  <span className={`font-semibold capitalize ${order.paymentStatus === "paid" ? "text-emerald-700" : "text-amber-700"}`}>
                    {order.paymentStatus.replace("_", " ")}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#e5dbc7] flex justify-between items-baseline">
                  <span className="font-bold text-neutral-900">Total Amount:</span>
                  <span className="font-black text-sm text-[#1b4431]">
                    Rs. {Number(order.totalAmount).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Concierge Contact Support Bar */}
          <div className="pt-6 border-t border-[#eee6d7] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-neutral-500">
              Have questions regarding delivery timing or address changes?
            </p>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923001234567"}?text=Hello%20Safa%20Fragrance,%20query%20for%20order%20${order.trackingId}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1b4431] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#0e281d] transition shadow-md border border-[#255840]"
            >
              <Phone size={14} />
              <span>WhatsApp Direct Support</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <main className="w-full min-h-[80vh] py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
        <span className="text-xs uppercase font-bold tracking-[0.25em] text-[#b39b66]">
          Real-Time Scent Logistics
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold uppercase text-[#0e281d] font-[Galsod] tracking-wider">
          Track Your Parcel
        </h1>
        <p className="text-sm text-neutral-700 font-normal">
          Enter your unique tracking ID to inspect your parcel&apos;s bottling, packing, and courier progress.
        </p>
      </div>

      <Suspense fallback={<div className="text-center py-10">Loading tracking portal...</div>}>
        <TrackContent />
      </Suspense>
    </main>
  );
}

