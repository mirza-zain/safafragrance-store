'use client';

import { use, useEffect, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  CheckCircle2,
  Truck,
  ShieldCheck,
  Clock,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Copy,
  Check
} from "lucide-react";
import { Order } from "@/app/lib/types";

type PageProps = {
  params: Promise<{ id: string }>;
};

function OrderInvoiceContent({ params }: PageProps) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        }
      } catch (err) {
        console.error("Failed to load order invoice", err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [id]);

  const updateStatus = async (status: string) => {
    if (!order) return;
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const updated = await res.json();
        setOrder(updated);
      }
    } catch {
      alert("Failed to update status");
    }
  };

  const updatePaymentStatus = async (paymentStatus: string) => {
    if (!order) return;
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus })
      });
      if (res.ok) {
        const updated = await res.json();
        setOrder(updated);
      }
    } catch {
      alert("Failed to update payment status");
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-neutral-400">Loading invoice document...</div>;
  }

  if (!order) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-bold font-serif">Order Not Found</h2>
        <Link href="/admin/manageOrders" className="mt-4 text-xs font-bold text-[#1b4431] underline">
          Return to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top action bar (hidden during print) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <Link
          href="/admin/manageOrders"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-[#1b4431] transition"
        >
          <ArrowLeft size={14} /> Back to Orders
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          {/* Quick status actions */}
          {order.paymentStatus !== "paid" && (
            <button
              onClick={() => updatePaymentStatus("paid")}
              className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider transition shadow-xs"
            >
              Verify Payment
            </button>
          )}

          {order.status === "pending" && (
            <button
              onClick={() => updateStatus("processing")}
              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold uppercase tracking-wider transition shadow-xs"
            >
              Begin Bottling
            </button>
          )}

          {order.status === "processing" && (
            <button
              onClick={() => updateStatus("shipped")}
              className="px-3.5 py-2 rounded-xl bg-[#1b4431] hover:bg-[#123023] text-white text-xs font-bold uppercase tracking-wider transition shadow-xs"
            >
              Dispatch Parcel
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="px-5 py-2 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-md transition"
          >
            <Printer size={15} />
            <span>Print Invoice & Packing Slip</span>
          </button>
        </div>
      </div>

      {/* Printable Invoice Container */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#e5dbc7] shadow-xl max-w-4xl mx-auto print:border-none print:shadow-none print:p-0">
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-8 border-b-2 border-neutral-900">
          <div>
            <div className="relative h-12 w-44 mb-2">
              <Image src="/logo.png" alt="Safa Fragrance" fill priority className="object-contain object-left" />
            </div>
            <p className="text-xs uppercase font-bold tracking-[0.25em] text-[#b39b66]">
              Haute Parfumerie • Pakistan
            </p>
            <p className="text-xs text-neutral-500 mt-1">DHA Phase 6, Karachi • +92 300 1234567</p>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <span className="text-xs uppercase font-bold tracking-widest text-neutral-400 block">
              Official Tax Invoice & Dispatch Slip
            </span>
            <p className="text-2xl font-black font-mono tracking-wider text-neutral-900">
              {order.trackingId}
            </p>
            <p className="text-xs text-neutral-500">
              Date: {new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Client & Shipping Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 border-b border-[#eee6d7] text-xs">
          <div className="space-y-1.5">
            <h3 className="font-bold uppercase tracking-wider text-neutral-400 text-[10px]">
              Customer & Recipient
            </h3>
            <p className="text-base font-bold text-neutral-900 font-serif">
              {order.firstName} {order.lastName}
            </p>
            <p className="text-neutral-600">Phone: {order.phoneCountryCode} {order.phoneNum}</p>
            <p className="text-neutral-600">Email: {order.email}</p>
          </div>

          <div className="space-y-1.5 sm:text-right">
            <h3 className="font-bold uppercase tracking-wider text-neutral-400 text-[10px]">
              Destination & Carrier
            </h3>
            <p className="font-semibold text-neutral-900">{order.address}</p>
            <p className="font-semibold text-neutral-900">{order.city}, {order.country}</p>
            <p className="text-neutral-500">Carrier: {order.carrier || "Safa Concierge Express"}</p>
            <div className="pt-1 flex items-center justify-start sm:justify-end gap-2">
              <span className="font-bold uppercase text-[10px] px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700">
                Payment: {order.paymentMethod === "cod" ? "Cash on Delivery" : "Bank Transfer"}
              </span>
              <span
                className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded-md ${
                  order.paymentStatus === "paid"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {order.paymentStatus === "paid" ? "Paid & Verified" : "Verification Pending"}
              </span>
            </div>
          </div>
        </div>

        {/* Itemized Fragrance Table */}
        <div className="py-8">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b-2 border-neutral-200 text-neutral-500 uppercase font-bold tracking-wider">
                <th className="pb-3">Fragrance Edition</th>
                <th className="pb-3">Size / Formulation</th>
                <th className="pb-3 text-center">Qty</th>
                <th className="pb-3 text-right">Unit Price</th>
                <th className="pb-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium">
              {order.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-4">
                    <p className="font-bold text-neutral-900 text-sm font-serif">{item.productName}</p>
                    <p className="text-[10px] text-[#b39b66] uppercase font-bold tracking-wider">
                      Extrait de Parfum
                    </p>
                  </td>
                  <td className="py-4 text-neutral-600 font-semibold">
                    {item.variantLabel || "Standard Bottle"}
                  </td>
                  <td className="py-4 text-center font-bold text-neutral-900">{item.quantity}</td>
                  <td className="py-4 text-right text-neutral-600">
                    Rs. {Number(item.price).toLocaleString()}
                  </td>
                  <td className="py-4 text-right font-bold text-neutral-900">
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Summary */}
        <div className="border-t-2 border-neutral-200 pt-6 flex justify-end text-xs">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-neutral-600">
              <span>Subtotal:</span>
              <span className="font-bold text-neutral-900">Rs. {Number(order.subTotal).toLocaleString()}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Discount ({order.discountCode || "Promo"}):</span>
                <span>- Rs. {Number(order.discountAmount).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-neutral-600">
              <span>Delivery Charges:</span>
              <span className="font-bold text-neutral-900">
                {Number(order.deliveryAmount) === 0 ? "FREE" : `Rs. ${Number(order.deliveryAmount).toLocaleString()}`}
              </span>
            </div>
            <div className="pt-3 border-t-2 border-neutral-900 flex justify-between items-baseline">
              <span className="text-base font-bold text-neutral-900 font-serif">Grand Total:</span>
              <span className="text-xl font-black text-[#1b4431]">
                Rs. {Number(order.totalAmount).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Official Footer Note & Seal */}
        <div className="mt-12 pt-8 border-t border-[#eee6d7] flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left text-xs text-neutral-400">
          <div>
            <p className="font-bold text-neutral-800 uppercase tracking-widest font-serif text-[11px]">
              Safa Fragrance Haute Parfumerie
            </p>
            <p className="text-[11px] mt-0.5">
              Hand-poured, matured, and sealed in Karachi, Pakistan. All formulations cruelty-free.
            </p>
          </div>
          <div className="p-3 rounded-xl border border-[#e5dbc7] bg-[#faf7f2] text-[#1b4431] font-bold text-[10px] uppercase tracking-widest">
            ✦ Sealed Authentic Batch ✦
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderInvoicePage({ params }: PageProps) {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-neutral-400">Loading invoice document...</div>}>
      <OrderInvoiceContent params={params} />
    </Suspense>
  );
}
