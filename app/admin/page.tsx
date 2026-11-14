'use client';

import { useEffect, useState } from "react";
import { Product, Order } from "@/app/lib/types";
import QuickRecordSaleButton from "./(component)/QuickRecordSaleButton";
import Link from "next/link";
import { ArrowRight, BarChart3, Star } from "lucide-react";
import { isPushSubscribed, subscribeUserToPush } from "@/app/lib/push-client";

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [notificationStatus, setNotificationStatus] = useState<"checking" | "inactive" | "active" | "enabling">("checking");

  // Handle PWA install prompt
  useEffect(() => {
    isPushSubscribed()
      .then((subscribed) => setNotificationStatus(subscribed ? "active" : "inactive"))
      .catch(() => setNotificationStatus("inactive"));
  }, []);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          fetch("/api/orders", { cache: "no-store" }),
          fetch("/api/product")
        ]);
        if (ordersRes.ok) {
          const ordData = await ordersRes.json();
          setOrders(ordData);
        }
        if (productsRes.ok) {
          const prodData = await productsRes.json();
          const list = Array.isArray(prodData) ? prodData : (prodData.products || []);
          setProducts(list);
        }
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
      }
    }

    loadData();
    const refreshTimer = window.setInterval(loadData, 5000);
    return () => window.clearInterval(refreshTimer);
  }, []);

  const currentMonthName = "November 2026";
  const nonCancelledOrders = orders.filter((o) => o.status !== "cancelled");
  const totalOrders = nonCancelledOrders.length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const totalRevenue = nonCancelledOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const monthlyOrders = totalOrders;
  const monthlyRevenue = totalRevenue;

  const lowStockProducts = products.filter((p) => p.stock <= 15);

  return (
    <main className="min-h-screen bg-white px-6 py-8 text-neutral-950 sm:px-10 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 border-b border-neutral-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
              Store overview
            </p>
            <h1 className="font-serif text-4xl tracking-tight sm:text-5xl font-bold">Dashboard</h1>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Link
              href="/admin/manageProducts"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs sm:text-sm font-semibold rounded-xl border border-neutral-200 shadow-2xs transition active:scale-[0.98]"
            >
              <Star className="size-4 text-amber-600 fill-amber-500" />
              <span>Featured Showcase</span>
            </Link>
            <QuickRecordSaleButton />
            {/* Notification & Mobile App Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-3">
              <button
                type="button"
                disabled={notificationStatus === "checking" || notificationStatus === "active" || notificationStatus === "enabling"}
                onClick={async () => {
                  setNotificationStatus("enabling");
                  const result = await subscribeUserToPush();
                  if (result.success) {
                    setNotificationStatus("active");
                  } else {
                    setNotificationStatus("inactive");
                    alert(result.message);
                  }
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  notificationStatus === "active"
                    ? "cursor-default bg-emerald-100 text-emerald-800"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                }`}
              >
                {notificationStatus === "checking"
                  ? "Checking Notifications..."
                  : notificationStatus === "enabling"
                    ? "Enabling Notifications..."
                    : notificationStatus === "active"
                      ? "Notifications Working"
                      : "Enable Notifications"}
              </button>
              <button
                type="button"
                onClick={() => {
                if (deferredPrompt) {
                  deferredPrompt.prompt();
                  deferredPrompt.userChoice.then((choice) => {
                    if (choice.outcome === 'accepted') {
                      console.log('User accepted the install prompt');
                    } else {
                      console.log('User dismissed the install prompt');
                    }
                    setDeferredPrompt(null);
                  });
                } else {
                  alert('Install prompt not available');
                }
              }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition"
              >
                Install Mobile App
              </button>
            </div>
          </div>
        </div>

        {/* Monthly Sales Highlight Banner */}
        <div className="mt-8 rounded-2xl border border-neutral-900 bg-neutral-950 p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-neutral-800 px-3 py-1 text-xs font-semibold text-emerald-400">
              <BarChart3 className="size-3.5" />
              <span>{currentMonthName} Performance</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              {monthlyOrders} sales recorded this month
            </h2>
            <p className="text-xs text-neutral-400">
              Total {currentMonthName} revenue:{" "}
              <span className="font-bold text-white">Rs. {monthlyRevenue.toLocaleString()}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/admin/sales"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-black transition hover:bg-neutral-200"
            >
              <span>View Monthly History & Breakdown</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <section className="grid gap-4 py-8 md:grid-cols-3" aria-label="Order summary">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <p className="text-sm font-medium text-neutral-500">Total orders (All Time)</p>
            <p className="mt-4 text-4xl font-semibold tracking-tight">{totalOrders}</p>
            <p className="mt-2 text-xs text-neutral-400">All orders received across channels</p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <p className="text-sm font-medium text-neutral-500">Pending orders</p>
            <p className="mt-4 text-4xl font-semibold tracking-tight">{pendingOrders}</p>
            <p className="mt-2 text-xs text-neutral-400">Awaiting fulfillment</p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <p className="text-sm font-medium text-neutral-500">Total revenue (All Time)</p>
            <p className="mt-4 text-4xl font-semibold tracking-tight">Rs. {totalRevenue.toLocaleString()}</p>
            <p className="mt-2 text-xs text-neutral-400">Revenue including offline & insta sales</p>
          </div>
        </section>

        {/* Low Stock Table */}
        <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-4 py-5 sm:px-6">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Low stock products</h2>
              <p className="mt-1 text-sm text-neutral-500">Products with 15 or fewer items remaining</p>
            </div>
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
              {lowStockProducts.length} items
            </span>
          </div>

          {lowStockProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-lg text-left text-sm">
                <thead className="bg-neutral-50 text-xs uppercase tracking-wider text-neutral-400">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Fragrance</th>
                    <th className="px-6 py-3 font-semibold">Stock remaining</th>
                    <th className="px-6 py-3 text-right font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {lowStockProducts.map((product) => (
                    <tr key={product.id} className="transition-colors hover:bg-neutral-50">
                      <td className="px-6 py-4 font-medium">{product.name}</td>
                      <td className="px-6 py-4 text-neutral-600">{product.stock} units</td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                          Restock soon
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="px-6 py-10 text-center text-sm text-neutral-500">No low stock products right now.</p>
          )}
        </section>
      </div>
    </main>
  );
}
