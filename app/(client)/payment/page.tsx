'use client';

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import React, { useEffect, useState } from "react";
import { BANK_TRANSFER_CONFIG } from "@/app/lib/bank-details";
import {
  ShieldCheck,
  Truck,
  Copy,
  Check,
  Upload,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Phone,
  CheckCircle2,
  Lock
} from "lucide-react";

type PaymentMethod = "cod" | "bank_transfer";

export default function PaymentPage() {
  const { cart, clearCart, hasHydrated } = useCart();
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [pricingError, setPricingError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [trackingCopied, setTrackingCopied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [paymentReceipt, setPaymentReceipt] = useState<string>("");
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    country: "Pakistan",
    phoneCountryCode: "+92",
    phoneNum: "",
    address: "",
    city: "Karachi"
  });

  const isKarachi = formData.city.trim().toLowerCase() === "karachi";

  useEffect(() => {
    if (!isKarachi && paymentMethod === "cod") {
      setPaymentMethod("bank_transfer");
    }
  }, [isKarachi, paymentMethod]);

  const subTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryAmount = isKarachi ? 0 : 250;
  const grandTotal = Math.max(0, subTotal - appliedDiscount + deliveryAmount);

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingReceipt(true);
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setReceiptPreview(uploadEvent.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const data = new FormData();
      data.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: data
      });
      if (res.ok) {
        const json = await res.json();
        setPaymentReceipt(json.url);
      }
    } catch (err) {
      console.error("Receipt upload error", err);
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handleApplyPromo = async () => {
    setPricingError("");
    if (!discountCode.trim()) return;

    try {
      const res = await fetch("/api/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          city: formData.city,
          discountCode: discountCode.trim().toUpperCase()
        })
      });
      const data = await res.json();
      if (data.discountError) {
        setPricingError(data.discountError);
        setAppliedDiscount(0);
      } else {
        setAppliedDiscount(Number(data.discountAmount));
      }
    } catch {
      setPricingError("Unable to validate coupon.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (paymentMethod === "bank_transfer" && !paymentReceipt && !receiptPreview) {
      alert("Please upload your bank transfer payment receipt or screenshot to proceed.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          paymentMethod,
          paymentReceipt: paymentReceipt || receiptPreview || undefined,
          discountCode: appliedDiscount > 0 ? discountCode.toUpperCase() : undefined,
          items: cart.map((item) => ({
            productId: item.id,
            productName: item.name,
            variantLabel: item.variantLabel,
            quantity: item.quantity,
            price: item.price
          }))
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Order submission failed");
      }

      const order = await res.json();
      setTrackingId(order.trackingId);
      setCreatedOrder(order);
      clearCart();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  // Order Confirmation Success Screen
  if (trackingId && createdOrder) {
    return (
      <main className="w-full min-h-[85vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full bg-white rounded-3xl p-8 sm:p-12 border border-[#e5dbc7] shadow-xl text-center space-y-6">
          <div className="size-20 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 size={40} />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#b39b66]">
              Order Confirmed & Sealed
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold uppercase text-neutral-900 font-[Galsod] tracking-wider">
              Thank You, {createdOrder.firstName}!
            </h1>
            <p className="text-sm text-neutral-700 font-normal max-w-lg mx-auto">
              Your luxury Extrait de Parfum order has been recorded. Our master bottling concierge will prepare and package your parcel under hermetic seal.
            </p>
          </div>

          {/* Tracking ID Callout */}
          <div className="p-6 rounded-2xl bg-[#faf7f2] border border-[#e5dbc7] space-y-3">
            <p className="text-xs uppercase font-bold tracking-wider text-neutral-500">
              Your Exclusive Tracking Identifier:
            </p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl sm:text-3xl font-black text-[#1b4431] font-mono tracking-wider">
                {trackingId}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(trackingId);
                  setTrackingCopied(true);
                  setTimeout(() => setTrackingCopied(false), 2000);
                }}
                className="p-2 rounded-xl border border-neutral-300 hover:border-black bg-white transition text-xs font-bold flex items-center gap-1.5"
                title="Copy Tracking ID"
              >
                {trackingCopied ? <Check size={16} className="text-emerald-700" /> : <Copy size={16} />}
                <span>{trackingCopied ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <p className="text-[11px] text-neutral-500">
              A copy of this confirmation has been logged for {createdOrder.email}.
            </p>
          </div>

          {/* Order Details Preview */}
          <div className="border-t border-[#eee6d7] pt-4 text-xs text-neutral-600 space-y-1.5 text-left">
            <div className="flex justify-between">
              <span>Delivery Address:</span>
              <span className="font-semibold text-neutral-900">
                {createdOrder.address}, {createdOrder.city}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Payment Mode:</span>
              <span className="font-semibold text-neutral-900 capitalize">
                {createdOrder.paymentMethod === "cod" ? "Cash on Delivery" : "Bank / Raast Transfer"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total Amount:</span>
              <span className="font-black text-sm text-[#1b4431]">
                Rs. {Number(createdOrder.totalAmount).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link
              href={`/track?id=${trackingId}`}
              className="flex-1 py-4 rounded-xl bg-[#1b4431] text-white font-bold text-xs uppercase tracking-widest hover:bg-[#123023] transition shadow-md"
            >
              Track Parcel Status →
            </Link>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923001234567"}?text=Hello%20Safa%20Fragrance,%20my%20Order%20Tracking%20ID%20is%20${trackingId}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-4 rounded-xl border border-[#d8cbb5] bg-white text-neutral-900 font-bold text-xs uppercase tracking-wider hover:border-[#1b4431] transition flex items-center justify-center gap-2"
            >
              <Phone size={16} className="text-[#1b4431]" />
              <span>WhatsApp Concierge</span>
            </a>
          </div>
        </div>
      </main>
    );
  }

  if (!hasHydrated) {
    return (
      <main className="w-full min-h-[70vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="animate-pulse size-12 rounded-full bg-neutral-200 mb-3" />
        <div className="animate-pulse h-4 w-32 rounded bg-neutral-200" />
      </main>
    );
  }

  // If cart is empty and no order submitted
  if (cart.length === 0) {
    return (
      <main className="w-full min-h-[70vh] flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold font-serif">No Items to Checkout</h2>
        <p className="text-sm text-neutral-500 mt-2">Add items to your fragrance bag before proceeding.</p>
        <Link
          href="/product"
          className="mt-6 px-6 py-3 rounded-full bg-[#1b4431] text-white text-xs font-bold uppercase tracking-widest"
        >
          Explore Collection
        </Link>
      </main>
    );
  }

  return (
    <main className="w-full min-h-screen py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <span className="text-xs uppercase font-bold tracking-[0.25em] text-[#b39b66]">
          Secure Haute Parfumerie Checkout
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold uppercase text-neutral-900 font-[Galsod] mt-1 tracking-wider">
          Complete Your Order
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Form: Customer & Delivery Details */}
        <div className="lg:col-span-7 space-y-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. Contact & Recipient */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e5dbc7] shadow-xs space-y-5">
              <h2 className="text-lg font-bold uppercase tracking-wider font-[Galsod] text-[#0e281d] flex items-center gap-2">
                <span className="size-6 rounded-full bg-[#1b4431] text-white text-xs flex items-center justify-center font-sans">
                  1
                </span>
                <span>Contact & Recipient Details</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="e.g. Zubair"
                    className="w-full px-4 py-3 rounded-xl border border-[#e5dbc7] bg-[#faf7f2] text-sm focus:outline-hidden focus:border-[#1b4431]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="e.g. Ahmed"
                    className="w-full px-4 py-3 rounded-xl border border-[#e5dbc7] bg-[#faf7f2] text-sm focus:outline-hidden focus:border-[#1b4431]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="zubair@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-[#e5dbc7] bg-[#faf7f2] text-sm focus:outline-hidden focus:border-[#1b4431]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                    Phone / WhatsApp Number *
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3.5 rounded-l-xl border border-r-0 border-[#e5dbc7] bg-[#f0e8d9] text-xs font-bold text-neutral-700">
                      +92
                    </span>
                    <input
                      type="tel"
                      required
                      value={formData.phoneNum}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phoneNum: e.target.value.replace(/\D/g, "").slice(0, 10)
                        })
                      }
                      placeholder="3001234567"
                      className="w-full px-4 py-3 rounded-r-xl border border-[#e5dbc7] bg-[#faf7f2] text-sm focus:outline-hidden focus:border-[#1b4431]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Delivery Address */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e5dbc7] shadow-xs space-y-5">
              <h2 className="text-lg font-bold uppercase tracking-wider font-[Galsod] text-[#0e281d] flex items-center gap-2">
                <span className="size-6 rounded-full bg-[#1b4431] text-white text-xs flex items-center justify-center font-sans">
                  2
                </span>
                <span>Delivery Address</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                    City *
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#e5dbc7] bg-[#faf7f2] text-sm font-medium focus:outline-hidden focus:border-[#1b4431]"
                  >
                    <option value="Karachi">Karachi (Cash on Delivery & Bank Transfer)</option>
                    <option value="Lahore">Lahore (Bank Transfer Nationwide Express)</option>
                    <option value="Islamabad">Islamabad (Bank Transfer Nationwide Express)</option>
                    <option value="Rawalpindi">Rawalpindi (Bank Transfer Nationwide Express)</option>
                    <option value="Faisalabad">Faisalabad (Bank Transfer Nationwide Express)</option>
                    <option value="Multan">Multan (Bank Transfer Nationwide Express)</option>
                    <option value="Peshawar">Peshawar (Bank Transfer Nationwide Express)</option>
                    <option value="Quetta">Quetta (Bank Transfer Nationwide Express)</option>
                    <option value="Sialkot">Sialkot (Bank Transfer Nationwide Express)</option>
                    <option value="Gujranwala">Gujranwala (Bank Transfer Nationwide Express)</option>
                    <option value="Hyderabad">Hyderabad (Bank Transfer Nationwide Express)</option>
                    <option value="Other">Other City / District</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                    Country
                  </label>
                  <input
                    type="text"
                    disabled
                    value="Pakistan"
                    className="w-full px-4 py-3 rounded-xl border border-[#e5dbc7] bg-neutral-100 text-sm font-semibold text-neutral-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                  Complete Street Address & Area *
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="House/Apartment #, Street, Block, Phase, Landmark"
                  className="w-full px-4 py-3 rounded-xl border border-[#e5dbc7] bg-[#faf7f2] text-sm focus:outline-hidden focus:border-[#1b4431]"
                />
              </div>
            </div>

            {/* 3. Payment Method */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e5dbc7] shadow-xs space-y-6">
              <h2 className="text-lg font-bold uppercase tracking-wider font-[Galsod] text-[#0e281d] flex items-center gap-2">
                <span className="size-6 rounded-full bg-[#1b4431] text-white text-xs flex items-center justify-center font-sans">
                  3
                </span>
                <span>Payment Method</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Cash on delivery */}
                <div
                  onClick={() => isKarachi && setPaymentMethod("cod")}
                  className={`p-5 rounded-2xl border transition cursor-pointer relative ${
                    paymentMethod === "cod"
                      ? "border-[#1b4431] bg-[#faf7f2] ring-1 ring-[#1b4431]"
                      : isKarachi
                      ? "border-[#e5dbc7] bg-white hover:border-[#1b4431]"
                      : "border-neutral-200 bg-neutral-50 opacity-60 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-neutral-900">Cash on Delivery</span>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === "cod"}
                      disabled={!isKarachi}
                      onChange={() => setPaymentMethod("cod")}
                      className="size-4 text-[#1b4431]"
                    />
                  </div>
                  <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                    Pay in cash when your sealed fragrance parcel is delivered.
                  </p>
                  <span className="inline-block mt-3 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Karachi Exclusive
                  </span>
                </div>

                {/* Direct bank transfer */}
                <div
                  onClick={() => setPaymentMethod("bank_transfer")}
                  className={`p-5 rounded-2xl border transition cursor-pointer relative ${
                    paymentMethod === "bank_transfer"
                      ? "border-[#1b4431] bg-[#faf7f2] ring-1 ring-[#1b4431]"
                      : "border-[#e5dbc7] bg-white hover:border-[#1b4431]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-neutral-900">Bank & Raast Transfer</span>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === "bank_transfer"}
                      onChange={() => setPaymentMethod("bank_transfer")}
                      className="size-4 text-[#1b4431]"
                    />
                  </div>
                  <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                    Instant 0-fee transfer via any banking app, Raast ID, Nayapay, or SadaPay.
                  </p>
                  <span className="inline-block mt-3 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#1b4431]/10 text-[#1b4431] border border-[#1b4431]/20">
                    Nationwide Recommended
                  </span>
                </div>
              </div>

              {/* Bank Details Display Card */}
              {paymentMethod === "bank_transfer" && (
                <div className="p-6 rounded-2xl bg-[#f5efe3] border border-[#e5dbc7] space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-[#e5dbc7] pb-3">
                    <div className="flex items-center gap-2">
                      <Lock size={16} className="text-[#1b4431]" />
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                        {BANK_TRANSFER_CONFIG.title}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#1b4431]">
                      Amount: Rs. {grandTotal.toLocaleString()}
                    </span>
                  </div>

                  {BANK_TRANSFER_CONFIG.accounts.map((acc) => (
                    <div key={acc.accountNumber} className="space-y-3 bg-white p-4 rounded-xl border border-[#e5dbc7]">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-neutral-500">Bank:</span>
                        <span className="font-bold text-neutral-900">{acc.bankName}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-neutral-500">Account Title:</span>
                        <span className="font-bold text-neutral-900">{acc.accountTitle}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs pt-1 border-t border-neutral-100">
                        <span className="text-neutral-500">Account Number:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-neutral-900">{acc.accountNumber}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(acc.accountNumber, "acc")}
                            className="p-1 rounded-md hover:bg-neutral-100 text-[#1b4431]"
                            title="Copy Account Number"
                          >
                            {copiedField === "acc" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>
                      {acc.iban && (
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-neutral-500">IBAN:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-neutral-900 text-[11px]">{acc.iban}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(acc.iban!, "iban")}
                              className="p-1 rounded-md hover:bg-neutral-100 text-[#1b4431]"
                              title="Copy IBAN"
                            >
                              {copiedField === "iban" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Screenshot upload */}
                  <div className="space-y-2 pt-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                      Upload Payment Screenshot / Receipt Proof *
                    </label>

                    {receiptPreview ? (
                      <div className="relative p-4 rounded-xl bg-white border border-emerald-300 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative size-14 rounded-lg overflow-hidden border border-neutral-200">
                            <Image src={receiptPreview} alt="Receipt Preview" fill className="object-cover" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-emerald-800">Payment Proof Attached</p>
                            <p className="text-[11px] text-neutral-500">Ready to submit with order</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setReceiptPreview(null);
                            setPaymentReceipt("");
                          }}
                          className="text-xs font-semibold text-red-600 hover:underline px-2 py-1"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#d8cbb5] rounded-2xl bg-white cursor-pointer hover:bg-[#faf7f2] transition">
                        <Upload size={24} className="text-[#b39b66] mb-2" />
                        <span className="text-xs font-bold text-neutral-800">
                          {uploadingReceipt ? "Uploading screenshot..." : "Click to select banking screenshot"}
                        </span>
                        <span className="text-[11px] text-neutral-400 mt-1">PNG, JPG, or WEBP up to 10MB</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleReceiptUpload}
                          disabled={uploadingReceipt}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || uploadingReceipt}
              className="w-full py-5 rounded-2xl bg-[#1b4431] hover:bg-[#0e281d] text-white font-bold text-xs uppercase tracking-widest shadow-xl transition active:scale-[0.98] disabled:opacity-50 border border-[#255840]"
            >
              {submitting
                ? "Securing Your Order..."
                : paymentMethod === "cod"
                ? `Confirm Cash on Delivery • Rs. ${grandTotal.toLocaleString()}`
                : `Submit Order with Payment Proof • Rs. ${grandTotal.toLocaleString()}`}
            </button>
          </form>
        </div>

        {/* Right Sidebar: Order Summary */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-[#e5dbc7] shadow-md sticky top-24 space-y-6">
          <h2 className="text-xl font-bold uppercase tracking-wider text-[#0e281d] pb-4 border-b border-[#eee6d7] font-[Galsod]">
            Bag Review ({cart.reduce((a, b) => a + b.quantity, 0)})
          </h2>

          {/* Items */}
          <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
            {cart.map((item) => (
              <div key={`${item.id}-${item.variantLabel}`} className="flex items-center gap-3.5 pb-3 border-b border-neutral-100">
                <div className="relative size-16 rounded-xl overflow-hidden bg-[#faf7f2] border border-[#eee6d7] shrink-0">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-neutral-900 truncate">{item.name}</h4>
                  {item.variantLabel && (
                    <span className="text-[10px] text-neutral-500 font-medium block">
                      {item.variantLabel}
                    </span>
                  )}
                  <p className="text-[11px] text-neutral-400">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-[#1b4431]">
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Breakdown */}
          <div className="space-y-2 text-xs border-t border-[#eee6d7] pt-4">
            <div className="flex justify-between text-neutral-600">
              <span>Subtotal</span>
              <span className="font-semibold text-neutral-900">Rs. {subTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Delivery Charges</span>
              <span className="font-semibold text-neutral-900">
                {deliveryAmount === 0 ? "FREE (Karachi)" : `Rs. ${deliveryAmount.toLocaleString()}`}
              </span>
            </div>
            {appliedDiscount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Discount Code ({discountCode})</span>
                <span>- Rs. {appliedDiscount.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Promo code mini input */}
          <div className="flex gap-2 pt-1">
            <input
              type="text"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
              placeholder="Discount Code"
              className="flex-1 px-3 py-2 text-xs uppercase rounded-xl border border-[#e5dbc7] focus:outline-hidden"
            />
            <button
              type="button"
              onClick={handleApplyPromo}
              className="px-3.5 py-2 text-xs font-bold uppercase rounded-xl bg-neutral-900 text-white hover:bg-[#1b4431] transition"
            >
              Apply
            </button>
          </div>
          {pricingError && <p className="text-xs text-red-600">{pricingError}</p>}

          {/* Grand total */}
          <div className="pt-4 border-t border-[#eee6d7] flex justify-between items-baseline">
            <span className="text-sm font-bold text-neutral-900 font-sans uppercase tracking-wider">Total Payable</span>
            <span className="text-2xl font-black text-neutral-900">
              Rs. {grandTotal.toLocaleString()}
            </span>
          </div>

          <div className="pt-2 border-t border-neutral-100 flex items-center justify-center gap-2 text-[11px] text-neutral-500">
            <ShieldCheck size={14} className="text-[#1b4431]" />
            <span>Encrypted Checkout • Sealed Artisanal Dispatch</span>
          </div>
        </div>
      </div>
    </main>
  );
}

