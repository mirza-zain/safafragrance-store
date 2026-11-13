'use client';

import { use, useEffect, useState, Suspense } from "react";
import StatusControl from "./StatusControl";
import PaymentVerificationCard from "./PaymentVerificationCard";
import InvoicePrintButton from "./InvoicePrintButton";
import { Order } from "@/app/lib/types";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

const statusClasses: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  processing: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200",
  shipped: "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200",
  delivered: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200"
};

function OrderDetailsContent({ params }: Props) {
  const unwrappedParams = use(params);
  const routeParams = useParams();
  const id = unwrappedParams?.id || (routeParams?.id as string) || "";

  const [data, setData] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    async function loadOrder(showLoading = false) {
      try {
        if (showLoading) setLoading(true);
        const res = await fetch(`/api/orders/${encodeURIComponent(id)}`, { cache: "no-store" });
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.error || "Order not found");
        }
        const json = await res.json();
        if (isMounted) {
          setData(json);
        }
      } catch (err) {
        if (isMounted) {
          setError((err as Error).message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadOrder(true);
    const refreshTimer = window.setInterval(() => loadOrder(), 10000);

    return () => {
      isMounted = false;
      window.clearInterval(refreshTimer);
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 p-6 sm:p-10 flex items-center justify-center">
        <div className="size-8 border-2 border-neutral-300 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-neutral-50 p-6 sm:p-10 flex items-center justify-center">
        <div className="rounded-2xl bg-white border border-neutral-200 p-8 text-center max-w-md shadow-xs">
          <p className="text-base font-bold text-neutral-800">Order not found</p>
          <Link href="/admin/manageOrders" className="mt-4 inline-block text-xs font-semibold text-blue-600 hover:underline">
            Return to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-6 text-neutral-900 sm:py-10 print:min-h-0 print:bg-white print:p-0">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Back Link */}
        <div className="print:hidden">
          <Link
            href="/admin/manageOrders"
            className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-black transition"
          >
            <ArrowLeft className="size-4" />
            <span>Back to Orders</span>
          </Link>
        </div>

        {/* Top Summary Card */}
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-xs md:p-8 print:hidden">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-neutral-500">Order</p>
              <h1 className="mt-2 text-3xl font-bold text-neutral-900 font-serif">#{data.id}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className={`inline-flex rounded-full px-3 py-1.5 text-sm font-semibold ${statusClasses[data.status] ?? "bg-neutral-100 text-neutral-700"}`}>
                {data.status}
              </span>
              <StatusControl orderId={data.id} initialStatus={data.status} />
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-sm text-neutral-500">Customer</p>
              <p className="mt-2 text-lg font-semibold text-neutral-900">{data.firstName} {data.lastName}</p>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-sm text-neutral-500">Total</p>
              <p className="mt-2 text-lg font-semibold text-emerald-700">Rs. {data.totalAmount.toLocaleString()}</p>
              <div className="mt-3 space-y-1 text-xs text-neutral-500">
                <p>Subtotal: Rs. {data.subTotal.toLocaleString()}</p>
                <p>Delivery: Rs. {data.deliveryAmount.toLocaleString()}</p>
                {data.discountAmount > 0 && <p>Discount: Rs. {data.discountAmount.toLocaleString()}{data.discountCode ? ` (${data.discountCode})` : ""}</p>}
              </div>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-sm text-neutral-500">Date</p>
              <p className="mt-2 text-lg font-semibold text-neutral-900">{new Date(data.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Payment Verification Card */}
        <div className="print:hidden">
          <PaymentVerificationCard
            orderId={data.id}
            totalAmount={data.totalAmount}
            paymentMethod={data.paymentMethod}
            initialPaymentStatus={data.paymentStatus}
            paymentReceipt={data.paymentReceipt}
          />
        </div>

        {/* Items & Customer Information Grid */}
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] print:hidden">
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-xs">
            <h2 className="text-xl font-semibold text-neutral-900 font-serif">Items</h2>
            <div className="mt-5 space-y-4">
              {data.items.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <div>
                    <p className="font-medium text-neutral-900">{it.productName || `Fragrance #${it.productId}`}</p>
                    {it.variantLabel && <p className="mt-1 text-sm text-neutral-500">Size: {it.variantLabel}</p>}
                    <p className="mt-1 text-sm text-neutral-500">Quantity: {it.quantity}</p>
                  </div>
                  <p className="text-base font-semibold text-neutral-900">Rs. {it.price.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-xs">
            <h2 className="text-xl font-semibold text-neutral-900 font-serif">Customer Information</h2>
            <div className="mt-5 space-y-4 text-sm text-neutral-700">
              <div>
                <p className="text-neutral-500">Email</p>
                <p className="mt-1 text-neutral-900 font-medium">{data.email}</p>
              </div>
              <div>
                <p className="text-neutral-500">Phone</p>
                <p className="mt-1 text-neutral-900 font-medium">{data.phoneNum}</p>
              </div>
              <div>
                <p className="text-neutral-500">Destination Address</p>
                <p className="mt-1 text-neutral-900 font-medium">{data.address}</p>
                <p className="mt-0.5 text-xs font-semibold text-neutral-700">
                  {data.city}, Pakistan
                </p>
              </div>
              {data.notes && (
                <div>
                  <p className="text-neutral-500">Order Notes</p>
                  <p className="mt-1 text-neutral-900 italic text-xs">{data.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Invoice Print View */}
        <InvoicePrintButton order={data} />
      </div>
    </div>
  );
}

export default function OrderDetailsPage(props: Props) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-50 p-10 flex items-center justify-center">
        <div className="size-8 border-2 border-neutral-300 border-t-black rounded-full animate-spin" />
      </div>
    }>
      <OrderDetailsContent {...props} />
    </Suspense>
  );
}
