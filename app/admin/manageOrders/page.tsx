'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Filter,
  FileText,
  Copy,
  Check,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  X,
  Printer
} from "lucide-react";
import { Order } from "@/app/lib/types";

export default function ManageOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewReceipt, setPreviewReceipt] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Failed to load orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: number, nextStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus as any } : o))
        );
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handlePaymentStatusChange = async (orderId: number, nextPaymentStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: nextPaymentStatus })
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: nextPaymentStatus as any } : o))
        );
      }
    } catch (err) {
      alert("Failed to update payment status");
    }
  };

  const filtered = orders.filter((o) => {
    const matchesStatus = filterStatus === "all" || o.status === filterStatus;
    const matchesSearch =
      o.trackingId.toLowerCase().includes(search.toLowerCase()) ||
      o.firstName.toLowerCase().includes(search.toLowerCase()) ||
      o.lastName.toLowerCase().includes(search.toLowerCase()) ||
      o.city.toLowerCase().includes(search.toLowerCase()) ||
      o.phoneNum.includes(search);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-[0.25em] text-[#b39b66]">
            Fulfillment & Logistics
          </span>
          <h1 className="text-3xl font-black uppercase tracking-tight text-neutral-900 font-serif">
            Manage Customer Orders
          </h1>
        </div>

        <button
          onClick={loadOrders}
          className="px-4 py-2 rounded-xl border border-[#d8cbb5] bg-white text-xs font-bold uppercase tracking-wider hover:border-[#1b4431] transition"
        >
          Refresh Feed
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-6 border border-[#e5dbc7] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Tracking ID, Name, Phone, City..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e5dbc7] bg-[#faf7f2] text-xs focus:outline-hidden focus:border-[#1b4431]"
            />
          </div>

          <span className="text-xs font-medium text-neutral-500">
            {filtered.length} of {orders.length} orders
          </span>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#f0e8d9]">
          {[
            { id: "all", label: "All Orders" },
            { id: "pending", label: "Pending" },
            { id: "processing", label: "Processing / Bottling" },
            { id: "shipped", label: "Shipped" },
            { id: "delivered", label: "Delivered" },
            { id: "cancelled", label: "Cancelled" }
          ].map((status) => (
            <button
              key={status.id}
              onClick={() => setFilterStatus(status.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${
                filterStatus === status.id
                  ? "bg-[#1b4431] text-white"
                  : "bg-[#faf7f2] border border-[#e5dbc7] text-neutral-600 hover:border-[#1b4431]"
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-[#e5dbc7] shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#faf7f2] border-b border-[#eee6d7] text-neutral-400 uppercase font-bold tracking-wider">
              <tr>
                <th className="py-4 px-6">Tracking / Date</th>
                <th className="py-4 px-4">Client</th>
                <th className="py-4 px-4">Editions Ordered</th>
                <th className="py-4 px-4">Payment</th>
                <th className="py-4 px-4">Proof</th>
                <th className="py-4 px-4">Total</th>
                <th className="py-4 px-4">Status Update</th>
                <th className="py-4 px-6 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-400">
                    Loading orders...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-400">
                    No orders match your filter.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-[#faf7f2] transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#1b4431] text-sm">
                          {order.trackingId}
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(order.trackingId);
                            setCopiedId(order.trackingId);
                            setTimeout(() => setCopiedId(null), 2000);
                          }}
                          className="p-1 rounded-md text-neutral-400 hover:text-black"
                          title="Copy Tracking ID"
                        >
                          {copiedId === order.trackingId ? <Check size={13} className="text-emerald-700" /> : <Copy size={13} />}
                        </button>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </td>

                    <td className="py-4 px-4">
                      <p className="font-bold text-neutral-900">
                        {order.firstName} {order.lastName}
                      </p>
                      <p className="text-neutral-500 text-[11px]">{order.phoneCountryCode} {order.phoneNum}</p>
                      <p className="text-neutral-400 text-[11px]">{order.city}</p>
                    </td>

                    <td className="py-4 px-4 max-w-48">
                      <div className="space-y-1">
                        {order.items.map((i, idx) => (
                          <div key={idx} className="text-[11px]">
                            <span className="font-bold text-neutral-800">{i.productName}</span>{" "}
                            {i.variantLabel && <span className="text-neutral-500">({i.variantLabel})</span>}{" "}
                            <span className="text-[#1b4431] font-bold">×{i.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="capitalize font-bold text-neutral-800 block">
                        {order.paymentMethod === "cod" ? "Cash on Delivery" : "Bank Transfer"}
                      </span>
                      <select
                        value={order.paymentStatus}
                        onChange={(e) => handlePaymentStatusChange(order.id, e.target.value)}
                        className={`text-[10px] font-bold uppercase rounded-md px-2 py-0.5 mt-1 border ${
                          order.paymentStatus === "paid"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : order.paymentStatus === "pending_verification"
                            ? "bg-amber-50 text-amber-800 border-amber-300"
                            : "bg-neutral-100 text-neutral-600 border-neutral-300"
                        }`}
                      >
                        <option value="unpaid">Unpaid</option>
                        <option value="pending_verification">Review Proof</option>
                        <option value="paid">Payment Verified</option>
                        <option value="rejected">Declined</option>
                      </select>
                    </td>

                    <td className="py-4 px-4">
                      {order.paymentReceipt ? (
                        <button
                          onClick={() => setPreviewReceipt(order.paymentReceipt!)}
                          className="px-2.5 py-1 rounded-lg bg-[#faf7f2] border border-[#e5dbc7] hover:border-[#1b4431] text-[11px] font-bold text-[#1b4431] flex items-center gap-1 transition"
                        >
                          <Eye size={12} />
                          <span>View Proof</span>
                        </button>
                      ) : (
                        <span className="text-neutral-400 text-[11px]">No file</span>
                      )}
                    </td>

                    <td className="py-4 px-4 font-bold text-neutral-900">
                      Rs. {Number(order.totalAmount).toLocaleString()}
                    </td>

                    <td className="py-4 px-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="px-2.5 py-1.5 rounded-xl border border-[#e5dbc7] bg-[#faf7f2] text-xs font-bold uppercase tracking-wider text-neutral-800 focus:outline-hidden"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/admin/manageOrders/${order.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1b4431] text-white text-[11px] font-bold uppercase tracking-wider hover:bg-[#123023] transition shadow-xs"
                      >
                        <Printer size={13} />
                        <span>Invoice</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Preview Lightbox Modal */}
      {previewReceipt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-[#e5dbc7] shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
              <h3 className="font-bold font-serif text-neutral-900">Payment Screenshot Proof</h3>
              <button
                onClick={() => setPreviewReceipt(null)}
                className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500"
              >
                <X size={20} />
              </button>
            </div>
            <div className="relative aspect-4/5 w-full rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200">
              <Image src={previewReceipt} alt="Bank Proof" fill className="object-contain" />
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPreviewReceipt(null)}
                className="px-5 py-2 rounded-xl bg-neutral-900 text-white font-bold text-xs uppercase"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

