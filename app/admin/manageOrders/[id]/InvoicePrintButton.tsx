'use client';

import Image from "next/image";
import { Order } from "@/app/lib/types";
import { Printer } from "lucide-react";

export default function InvoicePrintButton({ order }: { order: Order }) {
  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  const formattedTime = new Date(order.createdAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end print:hidden">
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800 transition active:scale-[0.98]"
        >
          <Printer className="size-4" />
          <span>Print Dispatch Invoice</span>
        </button>
      </div>

      {/* Printable Invoice Container */}
      <div id="printable-shipping-invoice" className="hidden print:block bg-white text-black p-8 max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-start border-b-2 border-black pb-6">
          <div>
            <div className="relative h-16 w-44 mb-2">
              <Image src="/logo.png" alt="Safa Fragrance" fill priority sizes="240px" className="object-contain object-left" />
            </div>
            <p className="text-xs uppercase font-bold tracking-widest text-neutral-600">Haute Parfumerie • Pakistan</p>
            <p className="text-xs text-neutral-500">DHA Phase 6, Karachi • +92 345 3124310</p>
          </div>
          <div className="text-right">
            <span className="text-xs uppercase font-bold tracking-widest text-neutral-500 block">Dispatch Slip</span>
            <p className="text-2xl font-black mt-1">#{order.id}</p>
            <p className="text-xs font-mono text-neutral-500 mt-1">AWB: {order.trackingId}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 text-xs border-b border-neutral-200 pb-6">
          <div>
            <p className="font-bold uppercase tracking-wider text-neutral-500 mb-1">Ship To:</p>
            <p className="text-sm font-bold text-neutral-900">{order.firstName} {order.lastName}</p>
            <p className="text-neutral-700 mt-1">{order.address}</p>
            <p className="text-neutral-700 font-semibold">{order.city}, Pakistan</p>
            <p className="text-neutral-600 mt-1">Phone: {order.phoneNum}</p>
          </div>
          <div className="text-right">
            <p className="font-bold uppercase tracking-wider text-neutral-500 mb-1">Order Details:</p>
            <p><span className="text-neutral-500">Date:</span> {formattedDate} at {formattedTime}</p>
            <p><span className="text-neutral-500">Payment:</span> {order.paymentMethod === "bank_transfer" ? "Bank Transfer" : "Cash on Delivery"}</p>
            <p><span className="text-neutral-500">Payment Status:</span> {order.paymentStatus.toUpperCase()}</p>
          </div>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-black text-neutral-600 uppercase font-bold tracking-wider">
              <th className="py-2">Item Description</th>
              <th className="py-2">Variant</th>
              <th className="py-2 text-center">Qty</th>
              <th className="py-2 text-right">Price</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {order.items.map((it, idx) => (
              <tr key={idx} className="py-2">
                <td className="py-2.5 font-bold">{it.productName || `Fragrance #${it.productId}`}</td>
                <td className="py-2.5 text-neutral-600">{it.variantLabel || "Standard"}</td>
                <td className="py-2.5 text-center">{it.quantity}</td>
                <td className="py-2.5 text-right">Rs. {it.price.toLocaleString()}</td>
                <td className="py-2.5 text-right font-bold">Rs. {(it.price * it.quantity).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t-2 border-black pt-4 flex justify-end">
          <div className="w-64 space-y-1.5 text-xs text-right">
            <div className="flex justify-between text-neutral-600">
              <span>Subtotal:</span>
              <span>Rs. {order.subTotal.toLocaleString()}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount ({order.discountCode}):</span>
                <span>-Rs. {order.discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-neutral-600">
              <span>Delivery Fee:</span>
              <span>Rs. {order.deliveryAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-black pt-2 text-sm font-black text-neutral-900">
              <span>Amount Due:</span>
              <span>Rs. {order.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
