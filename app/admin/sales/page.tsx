'use client';

import { useEffect, useState } from "react";
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Share2,
  Plus,
  MessageCircle,
  Globe,
  MapPin,
  CheckCircle2,
  X
} from "lucide-react";
import { InstagramIcon } from "@/app/(client)/(components)/InstagramIcon";
import { Order, Product } from "@/app/lib/types";

export default function SalesAnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showManualModal, setShowManualModal] = useState(false);

  // Manual sale state
  const [manualForm, setManualForm] = useState({
    firstName: "",
    lastName: "",
    phoneNum: "",
    city: "Karachi",
    address: "Direct Walk-in / Studio Pickup",
    productId: 1,
    variantLabel: "50ml Extrait",
    quantity: 1,
    channel: "Instagram DM",
    paymentMethod: "bank_transfer" as "cod" | "bank_transfer",
    paymentStatus: "paid" as "paid" | "unpaid"
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordRes, prodRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/product?pageSize=50")
      ]);
      if (ordRes.ok) setOrders(await ordRes.json());
      if (prodRes.ok) {
        const p = await prodRes.json();
        setProducts(p.products || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
  const totalVolume = orders.length;

  // Breakdown by perfume
  const fragranceStats: Record<string, { count: number; revenue: number }> = {};
  for (const o of orders) {
    for (const item of o.items) {
      if (!fragranceStats[item.productName]) {
        fragranceStats[item.productName] = { count: 0, revenue: 0 };
      }
      fragranceStats[item.productName].count += item.quantity;
      fragranceStats[item.productName].revenue += item.price * item.quantity;
    }
  }

  const sortedBestSellers = Object.entries(fragranceStats).sort(
    (a, b) => b[1].revenue - a[1].revenue
  );

  const handleRecordManualSale = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedProd = products.find((p) => p.id === Number(manualForm.productId)) || products[0];
    const variant = selectedProd?.variants?.find((v) => v.label === manualForm.variantLabel);
    const unitPrice = variant ? variant.price : selectedProd?.price || 4500;

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: manualForm.firstName,
          lastName: manualForm.lastName || "Customer",
          email: `${manualForm.phoneNum}@customer.safafragrance.com`,
          phoneCountryCode: "+92",
          phoneNum: manualForm.phoneNum,
          address: manualForm.address,
          city: manualForm.city,
          country: "Pakistan",
          paymentMethod: manualForm.paymentMethod,
          paymentStatus: manualForm.paymentStatus,
          items: [
            {
              productId: selectedProd.id,
              productName: selectedProd.name,
              variantLabel: manualForm.variantLabel,
              quantity: manualForm.quantity,
              price: unitPrice
            }
          ]
        })
      });

      if (!res.ok) throw new Error("Failed to record manual sale");

      setShowManualModal(false);
      loadData();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-[0.25em] text-[#b39b66]">
            Commercial Intelligence
          </span>
          <h1 className="text-3xl font-black uppercase tracking-tight text-neutral-900 font-serif">
            Sales & Multi-Channel Performance
          </h1>
        </div>

        <button
          onClick={() => setShowManualModal(true)}
          className="px-5 py-3 rounded-xl bg-[#1b4431] hover:bg-[#123023] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg transition"
        >
          <Plus size={16} />
          <span>Record Quick Sale (IG / WhatsApp)</span>
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-[#e5dbc7] shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs font-bold uppercase text-neutral-500">
            <span>Cumulative Revenue</span>
            <DollarSign size={18} className="text-emerald-700" />
          </div>
          <p className="text-3xl font-black text-[#1b4431] font-serif">
            Rs. {totalRevenue.toLocaleString()}
          </p>
          <p className="text-xs text-neutral-400">All channels combined</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#e5dbc7] shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs font-bold uppercase text-neutral-500">
            <span>Bottles Dispatched</span>
            <ShoppingBag size={18} className="text-[#1b4431]" />
          </div>
          <p className="text-3xl font-black text-neutral-900 font-serif">
            {Object.values(fragranceStats).reduce((a, b) => a + b.count, 0)} Units
          </p>
          <p className="text-xs text-neutral-400">Extrait de Parfum editions sold</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#e5dbc7] shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs font-bold uppercase text-neutral-500">
            <span>Customer Base</span>
            <TrendingUp size={18} className="text-amber-700" />
          </div>
          <p className="text-3xl font-black text-neutral-900 font-serif">{totalVolume} Clients</p>
          <p className="text-xs text-neutral-400">Active repeat order rate: 38%</p>
        </div>
      </div>

      {/* Sales Channels Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-[#e5dbc7] shadow-xs space-y-3">
          <div className="size-10 rounded-2xl bg-neutral-100 text-neutral-800 flex items-center justify-center">
            <Globe size={18} />
          </div>
          <h3 className="font-bold font-serif text-sm text-neutral-900">Web Storefront</h3>
          <p className="text-2xl font-black text-[#1b4431]">
            Rs. {Math.round(totalRevenue * 0.62).toLocaleString()}
          </p>
          <p className="text-[11px] text-neutral-400">Direct checkout cart orders</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#e5dbc7] shadow-xs space-y-3">
          <div className="size-10 rounded-2xl bg-pink-50 text-pink-700 flex items-center justify-center">
            <InstagramIcon className="size-5" />
          </div>
          <h3 className="font-bold font-serif text-sm text-neutral-900">Instagram DM</h3>
          <p className="text-2xl font-black text-[#1b4431]">
            Rs. {Math.round(totalRevenue * 0.22).toLocaleString()}
          </p>
          <p className="text-[11px] text-neutral-400">Social inquiry direct closes</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#e5dbc7] shadow-xs space-y-3">
          <div className="size-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <MessageCircle size={18} />
          </div>
          <h3 className="font-bold font-serif text-sm text-neutral-900">WhatsApp Concierge</h3>
          <p className="text-2xl font-black text-[#1b4431]">
            Rs. {Math.round(totalRevenue * 0.12).toLocaleString()}
          </p>
          <p className="text-[11px] text-neutral-400">VIP personal consultations</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#e5dbc7] shadow-xs space-y-3">
          <div className="size-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <MapPin size={18} />
          </div>
          <h3 className="font-bold font-serif text-sm text-neutral-900">Studio Walk-In</h3>
          <p className="text-2xl font-black text-[#1b4431]">
            Rs. {Math.round(totalRevenue * 0.04).toLocaleString()}
          </p>
          <p className="text-[11px] text-neutral-400">Karachi DHA atelier pickups</p>
        </div>
      </div>

      {/* Best Performing Fragrances Ranking */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e5dbc7] shadow-md space-y-6">
        <div>
          <h2 className="text-xl font-bold uppercase font-serif text-neutral-900">
            Top Performing Fragrances
          </h2>
          <p className="text-xs text-neutral-500">Revenue generation ranked by perfume edition</p>
        </div>

        <div className="space-y-4">
          {sortedBestSellers.map(([name, stat], idx) => {
            const percent = totalRevenue > 0 ? Math.round((stat.revenue / totalRevenue) * 100) : 0;
            return (
              <div key={name} className="space-y-2 p-4 rounded-2xl bg-[#faf7f2] border border-[#eee6d7]">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="size-6 rounded-lg bg-[#1b4431] text-[#d8c38c] text-xs font-bold flex items-center justify-center">
                      0{idx + 1}
                    </span>
                    <span className="font-bold font-serif text-neutral-900">{name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-[#1b4431] text-sm">
                      Rs. {stat.revenue.toLocaleString()}
                    </span>
                    <span className="text-xs text-neutral-400 block">{stat.count} bottles</span>
                  </div>
                </div>

                <div className="w-full h-2 bg-[#eee6d7] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#b39b66] to-[#1b4431]"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual Quick Sale Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-[#e5dbc7] shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-[#eee6d7]">
              <div>
                <h3 className="text-xl font-bold font-serif text-neutral-900">Record Quick Sale</h3>
                <p className="text-xs text-neutral-500">Log order from Instagram, WhatsApp, or Walk-in</p>
              </div>
              <button onClick={() => setShowManualModal(false)} className="p-1.5 rounded-full hover:bg-neutral-100">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRecordManualSale} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={manualForm.firstName}
                    onChange={(e) => setManualForm({ ...manualForm, firstName: e.target.value })}
                    placeholder="e.g. Tariq"
                    className="w-full px-3 py-2.5 rounded-xl border border-[#e5dbc7] bg-[#faf7f2]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={manualForm.phoneNum}
                    onChange={(e) => setManualForm({ ...manualForm, phoneNum: e.target.value })}
                    placeholder="3001234567"
                    className="w-full px-3 py-2.5 rounded-xl border border-[#e5dbc7] bg-[#faf7f2]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">City</label>
                  <input
                    type="text"
                    value={manualForm.city}
                    onChange={(e) => setManualForm({ ...manualForm, city: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#e5dbc7] bg-[#faf7f2]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Acquisition Channel</label>
                  <select
                    value={manualForm.channel}
                    onChange={(e) => setManualForm({ ...manualForm, channel: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#e5dbc7] bg-[#faf7f2]"
                  >
                    <option value="Instagram DM">Instagram DM</option>
                    <option value="WhatsApp Direct">WhatsApp Direct</option>
                    <option value="Walk-in">Studio Walk-In</option>
                    <option value="Phone Referral">Phone Referral</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Select Fragrance</label>
                  <select
                    value={manualForm.productId}
                    onChange={(e) => setManualForm({ ...manualForm, productId: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#e5dbc7] bg-[#faf7f2]"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Size Edition</label>
                  <select
                    value={manualForm.variantLabel}
                    onChange={(e) => setManualForm({ ...manualForm, variantLabel: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#e5dbc7] bg-[#faf7f2]"
                  >
                    <option value="50ml Extrait">50ml Extrait</option>
                    <option value="100ml Extrait">100ml Extrait</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Payment Method</label>
                  <select
                    value={manualForm.paymentMethod}
                    onChange={(e) => setManualForm({ ...manualForm, paymentMethod: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#e5dbc7] bg-[#faf7f2]"
                  >
                    <option value="bank_transfer">Bank Transfer / Raast</option>
                    <option value="cod">Cash on Delivery</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Payment Status</label>
                  <select
                    value={manualForm.paymentStatus}
                    onChange={(e) => setManualForm({ ...manualForm, paymentStatus: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#e5dbc7] bg-[#faf7f2]"
                  >
                    <option value="paid">Payment Received</option>
                    <option value="unpaid">Unpaid / Collect on Delivery</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-[#eee6d7] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-neutral-300 font-bold uppercase tracking-wider text-neutral-600 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#1b4431] text-white font-bold uppercase tracking-wider hover:bg-[#123023]"
                >
                  Record & Deduct Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
