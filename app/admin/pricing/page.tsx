'use client';

import { FormEvent, useEffect, useState } from "react";

type Discount = {
  id: number;
  code: string;
  type: string;
  value: number;
  minAmount: number;
  usedCount: number;
  maxUses: number | null;
  active: boolean;
};

type Delivery = {
  id: number;
  city: string;
  amount: number;
  active: boolean;
};

export default function PricingPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [discountForm, setDiscountForm] = useState({
    code: "",
    type: "percentage",
    value: "",
    minAmount: "0",
    maxUses: ""
  });
  const [deliveryForm, setDeliveryForm] = useState({ city: "", amount: "" });
  const commonCities = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta", "Sialkot", "Gujranwala", "Hyderabad"];
  const [message, setMessage] = useState("");

  const load = async () => {
    try {
      const [discountResponse, deliveryResponse] = await Promise.all([
        fetch("/api/discount-codes", { cache: "no-store" }),
        fetch("/api/delivery-charges", { cache: "no-store" })
      ]);
      if (discountResponse.ok) setDiscounts(await discountResponse.json());
      if (deliveryResponse.ok) setDeliveries(await deliveryResponse.json());
    } catch (err) {
      console.error("Error loading pricing rules:", err);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const submit = async (event: FormEvent, url: string, body: object, reset: () => void) => {
    event.preventDefault();
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      setMessage(response.ok ? "Saved successfully" : data.error ?? "Unable to save");
      if (response.ok) {
        reset();
        await load();
      }
    } catch {
      setMessage("Error saving rule");
    }
  };

  const toggle = async (url: string, active: boolean) => {
    try {
      await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active })
      });
      await load();
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  const remove = async (url: string) => {
    try {
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to delete item");
        return;
      }
      await load();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-8">
      <header>
        <h1 className="text-3xl font-bold font-serif text-neutral-900">Pricing Rules</h1>
        <p className="mt-1 text-sm text-neutral-500">Control checkout discount promo codes, Pakistani city charges, and the default charge for all other locations.</p>
      </header>

      {message && <p className="rounded-xl bg-neutral-100 border border-neutral-200 px-4 py-3 text-sm font-medium">{message}</p>}

      <section className="grid gap-8 lg:grid-cols-2">
        {/* Discount Codes Section */}
        <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
          <h2 className="text-xl font-semibold text-neutral-900">Add Discount Code</h2>
          <form
            className="space-y-3"
            onSubmit={(event) =>
              submit(event, "/api/discount-codes", discountForm, () =>
                setDiscountForm({ code: "", type: "percentage", value: "", minAmount: "0", maxUses: "" })
              )
            }
          >
            <input
              required
              placeholder="Code (e.g. SAFA15)"
              value={discountForm.code}
              onChange={(e) => setDiscountForm({ ...discountForm, code: e.target.value.toUpperCase() })}
              className="w-full rounded-xl border border-neutral-200 px-3.5 py-2 text-sm focus:outline-none focus:border-black"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={discountForm.type}
                onChange={(e) => setDiscountForm({ ...discountForm, type: e.target.value })}
                className="rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (Rs.)</option>
              </select>
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Discount Value"
                value={discountForm.value}
                onChange={(e) => setDiscountForm({ ...discountForm, value: e.target.value })}
                className="rounded-xl border border-neutral-200 px-3.5 py-2 text-sm focus:outline-none focus:border-black"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Min order subtotal"
                value={discountForm.minAmount}
                onChange={(e) => setDiscountForm({ ...discountForm, minAmount: e.target.value })}
                className="rounded-xl border border-neutral-200 px-3.5 py-2 text-sm focus:outline-none focus:border-black"
              />
              <input
                type="number"
                min="1"
                placeholder="Max uses (optional)"
                value={discountForm.maxUses}
                onChange={(e) => setDiscountForm({ ...discountForm, maxUses: e.target.value })}
                className="rounded-xl border border-neutral-200 px-3.5 py-2 text-sm focus:outline-none focus:border-black"
              />
            </div>
            <button className="rounded-xl bg-black px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800 transition">
              Create Discount Code
            </button>
          </form>

          <div className="divide-y divide-neutral-100 border-t border-neutral-100 pt-2">
            {discounts.length === 0 ? (
              <p className="py-4 text-xs text-neutral-400">No discount codes created yet.</p>
            ) : (
              discounts.map((discount) => (
                <div key={discount.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div>
                    <b className="text-neutral-900">{discount.code}</b>
                    <p className="text-neutral-500 text-xs">
                      {discount.type === "percentage" ? `${discount.value}% off` : `Rs. ${discount.value} off`}, used {discount.usedCount}
                      {discount.maxUses ? `/${discount.maxUses}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <button
                      onClick={() => toggle(`/api/discount-codes/${discount.id}`, discount.active)}
                      className="rounded-lg border border-neutral-200 px-2.5 py-1 text-neutral-700 hover:border-black"
                    >
                      {discount.active ? "Disable" : "Enable"}
                    </button>
                    <button
                      onClick={() => remove(`/api/discount-codes/${discount.id}`)}
                      className="rounded-lg border border-red-200 px-2.5 py-1 text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Delivery Charges Section */}
        <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
          <h2 className="text-xl font-semibold text-neutral-900">Delivery Charges</h2>
          <p className="text-xs leading-relaxed text-neutral-500">
            Add a Pakistani city for a specific price. Use <strong>Other Cities (Nationwide)</strong> once to set the fallback for Pakistani districts and international cities.
          </p>
          <form
            className="space-y-3"
            onSubmit={(event) =>
              submit(event, "/api/delivery-charges", deliveryForm, () =>
                setDeliveryForm({ city: "", amount: "" })
              )
            }
          >
            <input
              required
              list="common-pakistan-cities"
              placeholder="City or Other Cities (Nationwide)"
              value={deliveryForm.city}
              onChange={(e) => setDeliveryForm({ ...deliveryForm, city: e.target.value })}
              className="w-full rounded-xl border border-neutral-200 px-3.5 py-2 text-sm focus:outline-none focus:border-black"
            />
            <datalist id="common-pakistan-cities">
              {commonCities.map((city) => <option key={city} value={city} />)}
              <option value="Other Cities (Nationwide)" />
            </datalist>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              placeholder="Shipping Charge (Rs.)"
              value={deliveryForm.amount}
              onChange={(e) => setDeliveryForm({ ...deliveryForm, amount: e.target.value })}
              className="w-full rounded-xl border border-neutral-200 px-3.5 py-2 text-sm focus:outline-none focus:border-black"
            />
            <button className="rounded-xl bg-black px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800 transition">
              Create Delivery Rule
            </button>
          </form>

          <div className="divide-y divide-neutral-100 border-t border-neutral-100 pt-2">
            {deliveries.length === 0 ? (
              <p className="py-4 text-xs text-neutral-400">No delivery charges set.</p>
            ) : (
              deliveries.map((delivery) => (
                <div key={delivery.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div>
                    <b className="capitalize text-neutral-900">{delivery.city}</b>
                    <p className="text-neutral-500 text-xs">Rs. {delivery.amount}</p>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <button
                      onClick={() => toggle(`/api/delivery-charges/${delivery.id}`, delivery.active)}
                      className="rounded-lg border border-neutral-200 px-2.5 py-1 text-neutral-700 hover:border-black"
                    >
                      {delivery.active ? "Disable" : "Enable"}
                    </button>
                    <button
                      onClick={() => remove(`/api/delivery-charges/${delivery.id}`)}
                      className="rounded-lg border border-red-200 px-2.5 py-1 text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
