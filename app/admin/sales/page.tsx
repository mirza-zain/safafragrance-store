'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Order } from "@/app/lib/types";
import { 
  getOrderChannel, 
  getChannelMeta, 
  formatRs, 
  toMonthKey, 
  formatMonthName, 
  SalesChannel 
} from "@/app/lib/order-utils";
import ManualSaleModal from "../(component)/ManualSaleModal";
import { 
  Plus, 
  Calendar, 
  BarChart3, 
  ShoppingBag, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  Search,
  Receipt
} from "lucide-react";

const statusClasses: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  processing: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200",
  shipped: "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200",
  delivered: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200"
};

export default function MonthlySalesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedMonth, setSelectedMonth] = useState<string>("2026-11");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableMonths, setAvailableMonths] = useState<string[]>(["2026-11"]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("Failed to load orders");
      const data: Order[] = await res.json();
      setOrders(data);

      const monthSet = new Set<string>();
      monthSet.add("2026-11");
      data.forEach((o) => {
        if (o.createdAt) {
          const key = toMonthKey(o.createdAt);
          if (key) monthSet.add(key);
        }
      });
      setAvailableMonths(Array.from(monthSet).sort().reverse());
      setSelectedMonth("2026-11");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (order.status === "cancelled") return false;

      if (selectedMonth !== "all") {
        const orderMonth = toMonthKey(order.createdAt);
        if (orderMonth !== selectedMonth) return false;
      }

      const channel = getOrderChannel(order);
      if (channelFilter !== "all" && channel !== channelFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const fullName = `${order.firstName} ${order.lastName}`.toLowerCase();
        const matchName = fullName.includes(q);
        const matchId = String(order.id).includes(q) || (order.trackingId || "").toLowerCase().includes(q);
        const matchPhone = (order.phoneNum || "").toLowerCase().includes(q);
        const matchCity = (order.city || "").toLowerCase().includes(q);
        if (!matchName && !matchId && !matchPhone && !matchCity) return false;
      }

      return true;
    });
  }, [orders, selectedMonth, channelFilter, searchQuery]);

  const monthStats = useMemo(() => {
    const totalSalesCount = filteredOrders.length;
    const totalRevenue = filteredOrders.reduce((acc, o) => acc + (Number(o.totalAmount) || 0), 0);
    const averageOrderValue = totalSalesCount > 0 ? Math.round(totalRevenue / totalSalesCount) : 0;
    const deliveredCount = filteredOrders.filter(o => o.status === "delivered").length;
    const pendingCount = filteredOrders.filter(o => o.status === "pending" || o.status === "processing").length;

    const channelCounts: Record<SalesChannel, { count: number; revenue: number }> = {
      instagram: { count: 0, revenue: 0 },
      reference: { count: 0, revenue: 0 },
      website: { count: 0, revenue: 0 },
      whatsapp: { count: 0, revenue: 0 },
      direct: { count: 0, revenue: 0 },
    };

    filteredOrders.forEach((o) => {
      const ch = getOrderChannel(o);
      const rev = Number(o.totalAmount) || 0;
      channelCounts[ch].count += 1;
      channelCounts[ch].revenue += rev;
    });

    return {
      totalSalesCount,
      totalRevenue,
      averageOrderValue,
      deliveredCount,
      pendingCount,
      channelCounts
    };
  }, [filteredOrders]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 p-6 sm:p-10">
        <div className="mx-auto max-w-7xl animate-pulse space-y-6">
          <div className="h-10 w-64 rounded-xl bg-neutral-200" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="h-28 rounded-2xl bg-neutral-200" />
            <div className="h-28 rounded-2xl bg-neutral-200" />
            <div className="h-28 rounded-2xl bg-neutral-200" />
            <div className="h-28 rounded-2xl bg-neutral-200" />
          </div>
          <div className="h-80 rounded-2xl bg-neutral-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-8 text-neutral-900 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">
                Performance & Analytics
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                Live Data
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-serif text-neutral-900 mt-1">
              Monthly Sales History
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
              Review monthly sales volume, track Instagram & referral revenue, and inspect every dispatch.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition active:scale-[0.98]"
            >
              <Plus className="size-4" />
              <span>Record Offline / Insta Sale</span>
            </button>
          </div>
        </div>

        {/* Month Selector Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700 shrink-0">
              <Calendar className="size-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Selected Month</p>
              <p className="text-sm font-bold text-neutral-900">
                {selectedMonth === "all" ? "All Time History" : formatMonthName(selectedMonth)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedMonth("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedMonth === "all"
                  ? "bg-black text-white"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              All Time
            </button>
            {availableMonths.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setSelectedMonth(m)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                  selectedMonth === m
                    ? "bg-black text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                {formatMonthName(m)}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between text-neutral-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Gross Revenue</span>
              <DollarSign className="size-4 text-emerald-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
              Rs. {monthStats.totalRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-neutral-400 mt-1">Total revenue collected</p>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between text-neutral-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Sales</span>
              <ShoppingBag className="size-4 text-neutral-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
              {monthStats.totalSalesCount}
            </p>
            <p className="text-xs text-neutral-400 mt-1">Confirmed client dispatches</p>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between text-neutral-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Avg Order Value</span>
              <BarChart3 className="size-4 text-neutral-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
              Rs. {monthStats.averageOrderValue.toLocaleString()}
            </p>
            <p className="text-xs text-neutral-400 mt-1">Per transaction average</p>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between text-neutral-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Fulfillment</span>
              <CheckCircle2 className="size-4 text-emerald-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
              {monthStats.deliveredCount} Delivered
            </p>
            <p className="text-xs text-neutral-400 mt-1">{monthStats.pendingCount} pending / in transit</p>
          </div>
        </div>

        {/* Channel Breakdown */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-neutral-900">Sales by Channel ({selectedMonth === "all" ? "All Time" : formatMonthName(selectedMonth)})</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {(["website", "instagram", "reference", "whatsapp", "direct"] as SalesChannel[]).map((ch) => {
              const meta = getChannelMeta(ch);
              const count = monthStats.channelCounts[ch].count;
              const rev = monthStats.channelCounts[ch].revenue;

              return (
                <button
                  key={ch}
                  type="button"
                  onClick={() => setChannelFilter(channelFilter === ch ? "all" : ch)}
                  className={`p-4 rounded-xl border text-left transition ${
                    channelFilter === ch
                      ? "border-black bg-neutral-900 text-white ring-2 ring-neutral-400"
                      : "border-neutral-200 bg-neutral-50 hover:bg-neutral-100"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span>{meta.iconEmoji}</span>
                    <span className="text-xs font-bold">{meta.label}</span>
                  </div>
                  <p className="text-lg font-extrabold">{count} orders</p>
                  <p className={`text-xs mt-0.5 ${channelFilter === ch ? "text-neutral-300" : "text-neutral-500"}`}>
                    Rs. {rev.toLocaleString()}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-neutral-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-base font-bold text-neutral-900">Sales Transactions</h2>
              <p className="text-xs text-neutral-500">Showing {filteredOrders.length} orders matching your filters</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="size-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm divide-y divide-neutral-100">
              <thead className="bg-neutral-50 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-6">Order</th>
                  <th className="py-3 px-6">Channel</th>
                  <th className="py-3 px-6">Customer</th>
                  <th className="py-3 px-6">City</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Total</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-xs text-neutral-400">
                      No orders found for the selected period.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => {
                    const ch = getOrderChannel(o);
                    const meta = getChannelMeta(ch);

                    return (
                      <tr key={o.id} className="hover:bg-neutral-50/80 transition">
                        <td className="py-3.5 px-6 font-mono text-xs font-bold text-neutral-900">
                          #{o.id}
                        </td>
                        <td className="py-3.5 px-6">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${meta.bg}`}>
                            <span>{meta.iconEmoji}</span>
                            <span>{meta.label}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-6 font-medium text-neutral-900">
                          {o.firstName} {o.lastName}
                        </td>
                        <td className="py-3.5 px-6 text-neutral-600">
                          {o.city}
                        </td>
                        <td className="py-3.5 px-6">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusClasses[o.status] || "bg-neutral-100 text-neutral-700"}`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 font-bold text-neutral-900">
                          Rs. {o.totalAmount.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <Link
                            href={`/admin/manageOrders/${o.id}`}
                            className="inline-flex items-center px-3 py-1 rounded-lg border border-neutral-200 text-xs font-semibold hover:border-black transition"
                          >
                            Details
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Manual Sale Modal */}
        <ManualSaleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => fetchOrders()}
        />
      </div>
    </div>
  );
}
