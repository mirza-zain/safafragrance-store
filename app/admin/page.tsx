'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  ShoppingBag,
  Package,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  Plus,
  Clock,
  CheckCircle2,
  Phone,
  FileText
} from "lucide-react";
import { Order, Product } from "@/app/lib/types";

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [ordersRes, prodsRes] = await Promise.all([
          fetch("/api/orders"),
          fetch("/api/product?pageSize=50")
        ]);

        if (ordersRes.ok) {
          const ords = await ordersRes.json();
          setOrders(ords);
        }
        if (prodsRes.ok) {
          const p = await prodsRes.json();
          setProducts(p.products || []);
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "processing").length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;
  const aov = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const lowStockProducts = products.filter((p) => p.stock <= 25);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-[0.25em] text-[#b39b66]">
            Safa Haute Parfumerie
          </span>
          <h1 className="text-3xl font-black uppercase tracking-tight text-neutral-900 font-serif">
            Executive Overview
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/manageProducts"
            className="px-4 py-2.5 rounded-xl bg-[#1b4431] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#123023] transition flex items-center gap-1.5 shadow-xs"
          >
            <Plus size={15} />
            <span>Add Fragrance</span>
          </Link>
          <Link
            href="/admin/manageOrders"
            className="px-4 py-2.5 rounded-xl border border-[#d8cbb5] bg-white text-neutral-800 text-xs font-bold uppercase tracking-wider hover:border-[#1b4431] transition"
          >
            View All Orders
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-[#e5dbc7] shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs font-bold uppercase text-neutral-500">
            <span>Gross Revenue</span>
            <div className="size-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <p className="text-3xl font-black text-[#1b4431] font-serif">
            Rs. {totalRevenue.toLocaleString()}
          </p>
          <p className="text-[11px] text-neutral-400">Total processed volume</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#e5dbc7] shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs font-bold uppercase text-neutral-500">
            <span>Total Orders</span>
            <div className="size-8 rounded-xl bg-[#faf7f2] text-[#1b4431] flex items-center justify-center">
              <ShoppingBag size={16} />
            </div>
          </div>
          <p className="text-3xl font-black text-neutral-900 font-serif">{totalOrders}</p>
          <p className="text-[11px] text-neutral-400">
            {deliveredOrders} delivered • {pendingOrders} in queue
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#e5dbc7] shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs font-bold uppercase text-neutral-500">
            <span>Average Order Value</span>
            <div className="size-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <DollarSign size={16} />
            </div>
          </div>
          <p className="text-3xl font-black text-neutral-900 font-serif">
            Rs. {aov.toLocaleString()}
          </p>
          <p className="text-[11px] text-neutral-400">Basket yield per customer</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#e5dbc7] shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs font-bold uppercase text-neutral-500">
            <span>Active Editions</span>
            <div className="size-8 rounded-xl bg-[#faf7f2] text-[#b39b66] flex items-center justify-center">
              <Package size={16} />
            </div>
          </div>
          <p className="text-3xl font-black text-neutral-900 font-serif">{products.length}</p>
          <p className="text-[11px] text-neutral-400">
            {lowStockProducts.length > 0 ? `${lowStockProducts.length} low stock alerts` : "Healthy stock across catalog"}
          </p>
        </div>
      </div>

      {/* Low Stock Alerts (if any) */}
      {lowStockProducts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 font-medium">
            <AlertTriangle size={18} className="text-amber-600 shrink-0" />
            <span>
              <strong>Inventory Advisory:</strong> {lowStockProducts.length} editions have 25 or fewer units remaining in Karachi laboratory stock.
            </span>
          </div>
          <Link
            href="/admin/manageProducts"
            className="font-bold underline uppercase tracking-wider text-amber-800"
          >
            Review Stock Levels →
          </Link>
        </div>
      )}

      {/* Recent Orders Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e5dbc7] shadow-md space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold uppercase font-serif text-neutral-900">
              Recent Parfumerie Orders
            </h2>
            <p className="text-xs text-neutral-500">Latest customer acquisitions and status updates</p>
          </div>
          <Link
            href="/admin/manageOrders"
            className="text-xs font-bold uppercase tracking-wider text-[#1b4431] hover:underline"
          >
            Manage All ({totalOrders}) →
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-neutral-400">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="py-12 text-center text-xs text-neutral-400">No orders logged yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#eee6d7] text-neutral-400 uppercase font-bold tracking-wider">
                  <th className="pb-3">Tracking ID</th>
                  <th className="pb-3">Client</th>
                  <th className="pb-3">Destination</th>
                  <th className="pb-3">Editions</th>
                  <th className="pb-3">Payment</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium">
                {orders.slice(0, 6).map((order) => (
                  <tr key={order.id} className="hover:bg-[#faf7f2] transition">
                    <td className="py-3.5 font-mono font-bold text-[#1b4431]">
                      {order.trackingId}
                    </td>
                    <td className="py-3.5 text-neutral-900 font-bold">
                      {order.firstName} {order.lastName}
                    </td>
                    <td className="py-3.5 text-neutral-600">{order.city}</td>
                    <td className="py-3.5 text-neutral-600 max-w-44 truncate">
                      {order.items.map((i) => `${i.productName} (${i.quantity})`).join(", ")}
                    </td>
                    <td className="py-3.5">
                      <span className="capitalize">{order.paymentMethod === "cod" ? "COD" : "Bank Transfer"}</span>
                      {order.paymentStatus === "pending_verification" && (
                        <span className="ml-1.5 px-1.5 py-0.5 rounded-sm bg-amber-100 text-amber-800 text-[10px] font-bold">
                          Review Proof
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 font-bold text-neutral-900">
                      Rs. {Number(order.totalAmount).toLocaleString()}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          order.status === "delivered"
                            ? "bg-emerald-100 text-emerald-800"
                            : order.status === "shipped"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "processing"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-neutral-100 text-neutral-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <Link
                        href={`/admin/manageOrders/${order.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#e5dbc7] hover:border-[#1b4431] text-[11px] font-bold uppercase tracking-wider hover:bg-[#1b4431] hover:text-white transition"
                      >
                        <FileText size={12} />
                        <span>Inspect</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

