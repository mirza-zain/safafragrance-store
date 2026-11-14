'use client';

import { Order } from "@/app/lib/types";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import QuickRecordSaleButton from "../(component)/QuickRecordSaleButton";
import { getOrderChannel, getChannelMeta } from "@/app/lib/order-utils";

const statusClasses: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  processing: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200",
  shipped: "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200",
  delivered: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200"
};

export default function ManageOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (orderId: number) => {
    if (!window.confirm("Delete this order? Its product stock will be restored.")) return;

    setDeletingId(orderId);
    setActionError("");
    try {
      const response = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
      const data: { error?: string } = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to delete order");

      setOrders((currentOrders) => currentOrders.filter((order) => order.id !== orderId));
    } catch (error) {
      setActionError((error as Error).message);
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/orders", { cache: "no-store" });
        if (!response.ok) {
          const errJson = await response.json().catch(() => ({}));
          throw new Error(errJson.error || "Error Fetching Orders");
        }
        const data: Order[] = await response.json();
        setOrders(data);
        setLoading(false);
      } catch (error) {
        setError((error as Error).message);
        setLoading(false);
      }
    };

    fetchOrders();
    const refreshTimer = window.setInterval(fetchOrders, 5000);
    return () => window.clearInterval(refreshTimer);
  }, []);

  if (loading) return (
    <div className="min-h-screen px-4 py-6 sm:px-6 sm:py-10 bg-neutral-50">
      <div className="mx-auto max-w-6xl rounded-2xl border border-neutral-200 bg-white p-8 shadow-xs">
        <div className="animate-pulse space-y-4">
          <div className="h-7 w-48 rounded bg-neutral-200" />
          <div className="h-12 rounded bg-neutral-100" />
          <div className="h-64 rounded bg-neutral-100" />
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10 bg-neutral-50">
      <div className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-rose-50 p-6 text-center shadow-lg">
        <p className="text-lg font-semibold text-rose-700">Something went wrong</p>
        <p className="mt-2 text-sm text-rose-600">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-10 text-neutral-900">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-neutral-500">Orders</p>
            <h1 className="mt-2 text-3xl font-bold md:text-4xl font-serif">Manage Orders</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-fit rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-700 shadow-xs">
              {orders.length} total orders
            </div>
            <QuickRecordSaleButton />
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-amber-300/80 bg-amber-50/60 p-5 shadow-xs">
            <p className="text-sm font-medium text-amber-900">Needs Verification</p>
            <p className="mt-2 text-2xl font-bold text-amber-700">
              {orders.filter((order) => order.paymentMethod === "bank_transfer" && (order.paymentStatus === "pending_verification" || !!order.paymentReceipt)).length}
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
            <p className="text-sm text-neutral-600">Pending</p>
            <p className="mt-2 text-2xl font-bold text-amber-700">
              {orders.filter((order) => order.status === "pending").length}
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
            <p className="text-sm text-neutral-600">Processing</p>
            <p className="mt-2 text-2xl font-bold text-sky-700">
              {orders.filter((order) => order.status === "processing").length}
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
            <p className="text-sm text-neutral-600">Delivered</p>
            <p className="mt-2 text-2xl font-bold text-emerald-700">
              {orders.filter((order) => order.status === "delivered").length}
            </p>
          </div>
        </div>

        {actionError && <p className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{actionError}</p>}

        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-3xl divide-y divide-neutral-200 text-left">
              <thead className="bg-neutral-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600">Order & Channel</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600">Customer</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600">Payment & Total</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-200 text-sm">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-neutral-400">
                      No orders received yet.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const channel = getOrderChannel(order);
                    const meta = getChannelMeta(channel);

                    return (
                      <tr key={order.id} className="transition hover:bg-neutral-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-neutral-900">#{order.id}</span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${meta.bg}`}>
                              <span>{meta.iconEmoji}</span>
                              <span>{meta.label}</span>
                            </span>
                          </div>
                          <p className="text-[10px] font-mono text-neutral-400 mt-0.5">{order.trackingId}</p>
                        </td>
                        <td className="px-6 py-4 text-neutral-700">{order.firstName} {order.lastName}</td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-neutral-900">Rs. {order.totalAmount.toLocaleString()}</span>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
                              {order.paymentMethod === "bank_transfer" ? "Bank Transfer" : "COD"}
                            </span>
                            {order.paymentMethod === "bank_transfer" && (
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                order.paymentStatus === "paid"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : order.paymentReceipt
                                  ? "bg-amber-100 text-amber-800 ring-1 ring-amber-300"
                                  : "bg-neutral-100 text-neutral-700"
                              }`}>
                                {order.paymentReceipt && order.paymentStatus !== "paid"
                                  ? "Verify Proof"
                                  : order.paymentStatus === "paid"
                                  ? "Paid"
                                  : order.paymentStatus}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[order.status] ?? "bg-neutral-100 text-neutral-700"}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-neutral-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/admin/manageOrders/${order.id}`}
                              className="inline-flex items-center rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:border-black hover:bg-neutral-100"
                            >
                              View
                            </Link>
                            <button
                              type="button"
                              onClick={() => void handleDelete(order.id)}
                              disabled={deletingId === order.id}
                              aria-label={`Delete order ${order.id}`}
                              className="inline-flex items-center rounded-lg border border-rose-500/40 bg-rose-500/10 p-1.5 text-rose-700 transition hover:border-rose-500 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
