'use client';

import { useEffect, useState } from "react";
import { Tag, Truck, Plus, Trash2, CheckCircle2, AlertCircle, Percent, DollarSign } from "lucide-react";
import { DiscountCode, DeliveryCharge } from "@/app/lib/types";

export default function PricingDiscountsPage() {
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [delivery, setDelivery] = useState<DeliveryCharge[]>([]);
  const [loading, setLoading] = useState(true);

  // New discount form
  const [newCode, setNewCode] = useState({
    code: "",
    type: "percentage" as "percentage" | "fixed",
    value: 10,
    minAmount: 3000,
    maxUses: 100
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [discRes, delivRes] = await Promise.all([
        fetch("/api/discount-codes"),
        fetch("/api/delivery-charges")
      ]);
      if (discRes.ok) setDiscounts(await discRes.json());
      if (delivRes.ok) setDelivery(await delivRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.code.trim()) return;

    try {
      const res = await fetch("/api/discount-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCode)
      });
      if (res.ok) {
        setNewCode({ code: "", type: "percentage", value: 10, minAmount: 3000, maxUses: 100 });
        loadData();
      }
    } catch {
      alert("Failed to create discount code");
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <span className="text-xs uppercase font-bold tracking-[0.25em] text-[#b39b66]">
          Monetization & Incentives
        </span>
        <h1 className="text-3xl font-black uppercase tracking-tight text-neutral-900 font-serif">
          Pricing, Coupons & Delivery Rates
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Promo Codes List & Creation */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e5dbc7] shadow-md space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-[#eee6d7]">
              <div>
                <h2 className="text-lg font-bold font-serif text-neutral-900 flex items-center gap-2">
                  <Tag size={18} className="text-[#1b4431]" />
                  <span>Active Promo & Discount Codes</span>
                </h2>
                <p className="text-xs text-neutral-500">Incentives verified during customer checkout</p>
              </div>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-neutral-400">Loading coupons...</div>
            ) : (
              <div className="space-y-3">
                {discounts.map((d) => (
                  <div
                    key={d.id}
                    className="p-4 rounded-2xl bg-[#faf7f2] border border-[#e5dbc7] flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-[#1b4431] bg-white px-2.5 py-0.5 rounded-md border border-[#e5dbc7]">
                          {d.code}
                        </span>
                        <span className="text-xs font-bold text-emerald-800">
                          {d.type === "percentage" ? `${d.value}% OFF` : `Rs. ${d.value} OFF`}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-1">
                        Min spend: Rs. {d.minAmount.toLocaleString()} • Used: {d.usedCount}
                        {d.maxUses ? ` / ${d.maxUses}` : " (Unlimited)"}
                      </p>
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Create new code */}
            <form onSubmit={handleCreateDiscount} className="pt-4 border-t border-[#eee6d7] space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                Generate New Voucher Code
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-neutral-600 mb-1 font-semibold">Code Name *</label>
                  <input
                    type="text"
                    required
                    value={newCode.code}
                    onChange={(e) => setNewCode({ ...newCode, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. VIP20"
                    className="w-full px-3 py-2 rounded-xl border border-[#e5dbc7] bg-[#faf7f2] font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 mb-1 font-semibold">Type</label>
                  <select
                    value={newCode.type}
                    onChange={(e) => setNewCode({ ...newCode, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e5dbc7] bg-[#faf7f2]"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (Rs.)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-600 mb-1 font-semibold">Value</label>
                  <input
                    type="number"
                    value={newCode.value}
                    onChange={(e) => setNewCode({ ...newCode, value: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e5dbc7] bg-[#faf7f2]"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 mb-1 font-semibold">Min Spend (Rs.)</label>
                  <input
                    type="number"
                    value={newCode.minAmount}
                    onChange={(e) => setNewCode({ ...newCode, minAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e5dbc7] bg-[#faf7f2]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#1b4431] hover:bg-[#123023] text-white text-xs font-bold uppercase tracking-widest transition shadow-md"
              >
                Create Promo Code
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Delivery Charges & Policy */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e5dbc7] shadow-md space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-[#eee6d7]">
              <div>
                <h2 className="text-lg font-bold font-serif text-neutral-900 flex items-center gap-2">
                  <Truck size={18} className="text-[#1b4431]" />
                  <span>City Shipping Rates</span>
                </h2>
                <p className="text-xs text-neutral-500">Configured air & ground courier costs</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {delivery.map((d) => (
                <div
                  key={d.id}
                  className="p-3 rounded-xl bg-[#faf7f2] border border-[#eee6d7] flex justify-between items-center text-xs"
                >
                  <span className="font-bold text-neutral-800">{d.city}</span>
                  <span className="font-mono font-bold text-[#1b4431]">
                    {d.amount === 0 ? "FREE" : `Rs. ${d.amount}`}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
              <p className="font-bold">✦ Free Shipping Threshold Active:</p>
              <p className="font-light text-emerald-800">
                Any customer cart reaching Rs. 6,000 or above automatically qualifies for 100% complimentary express air delivery across all Pakistan destinations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

