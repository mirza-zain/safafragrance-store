'use client';

import { useEffect, useState } from "react";
import { 
  X, 
  Plus, 
  Trash2, 
  CheckCircle2,
  Users,
  MessageCircle,
  Store,
  Receipt
} from "lucide-react";
import { InstagramIcon } from "@/app/(client)/(components)/InstagramIcon";

type ProductVariant = {
  label: string;
  price: number;
  stock: number;
};

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  variants?: ProductVariant[];
};

type SelectedItem = {
  productId: number;
  variantLabel: string;
  quantity: number;
  price: number;
  maxStock: number;
};

type ManualSaleModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function ManualSaleModal({ isOpen, onClose, onSuccess }: ManualSaleModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [channel, setChannel] = useState<"instagram" | "reference" | "whatsapp" | "direct">("instagram");
  const [customerName, setCustomerName] = useState("");
  const [phoneNum, setPhoneNum] = useState("");
  const [city, setCity] = useState("Karachi");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  
  const [items, setItems] = useState<SelectedItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentStatus, setPaymentStatus] = useState<"paid" | "pending">("paid");
  const [orderStatus, setOrderStatus] = useState<"delivered" | "processing" | "pending">("delivered");
  const [saleDate, setSaleDate] = useState("2026-11-10");
  const [deliveryAmount, setDeliveryAmount] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) return;
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const res = await fetch("/api/product");
        if (!res.ok) throw new Error("Failed to load products");
        const data = await res.json();
        const list: Product[] = Array.isArray(data) ? data : (data.products || []);
        setProducts(list);

        if (items.length === 0 && list.length > 0) {
          const first = list[0];
          const initialVariant = first.variants?.[0];
          setItems([{
            productId: first.id,
            variantLabel: initialVariant?.label || "",
            quantity: 1,
            price: initialVariant ? Number(initialVariant.price) : Number(first.price),
            maxStock: initialVariant ? initialVariant.stock : Number(first.stock)
          }]);
        }
      } catch (err) {
        console.error("Products fetch error:", err);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleProductChange = (index: number, productId: number) => {
    const selectedProd = products.find(p => p.id === productId);
    if (!selectedProd) return;

    const initialVariant = selectedProd.variants?.[0];
    const newItems = [...items];
    newItems[index] = {
      productId,
      variantLabel: initialVariant?.label || "",
      quantity: 1,
      price: initialVariant ? Number(initialVariant.price) : Number(selectedProd.price),
      maxStock: initialVariant ? initialVariant.stock : Number(selectedProd.stock)
    };
    setItems(newItems);
  };

  const handleVariantChange = (index: number, variantLabel: string) => {
    const item = items[index];
    const prod = products.find(p => p.id === item.productId);
    const variant = prod?.variants?.find(v => v.label === variantLabel);

    const newItems = [...items];
    newItems[index] = {
      ...item,
      variantLabel,
      price: variant ? Number(variant.price) : Number(prod?.price || item.price),
      maxStock: variant ? variant.stock : Number(prod?.stock || 0)
    };
    setItems(newItems);
  };

  const handlePriceChange = (index: number, price: number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], price };
    setItems(newItems);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], quantity: Math.max(1, quantity) };
    setItems(newItems);
  };

  const addItemRow = () => {
    if (products.length === 0) return;
    const prod = products[0];
    const variant = prod.variants?.[0];
    setItems([
      ...items,
      {
        productId: prod.id,
        variantLabel: variant?.label || "",
        quantity: 1,
        price: variant ? Number(variant.price) : Number(prod.price),
        maxStock: variant ? variant.stock : Number(prod.stock)
      }
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const subTotal = items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  const netTotal = Math.max(0, subTotal + Number(deliveryAmount || 0) - Number(discountAmount || 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError("Please add at least one fragrance item.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        channel,
        customerName: customerName.trim() || `${channel.toUpperCase()} Customer`,
        phoneNum: phoneNum.trim(),
        city: city.trim() || "Karachi",
        address: address.trim() || `${channel.toUpperCase()} Direct Sale`,
        items: items.map(i => ({
          productId: i.productId,
          variantLabel: i.variantLabel || null,
          quantity: i.quantity,
          price: i.price
        })),
        paymentMethod,
        paymentStatus,
        orderStatus,
        deliveryAmount: Number(deliveryAmount) || 0,
        discountAmount: Number(discountAmount) || 0,
        saleDate: saleDate ? new Date(saleDate).toISOString() : new Date().toISOString(),
        notes: notes.trim()
      };

      const res = await fetch("/api/orders/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to record sale");

      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-neutral-200 my-8 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-black text-white">
              <Receipt className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Record Offline / Manual Sale</h2>
              <p className="text-xs text-neutral-500">Log sales from Instagram DM, Personal Referrals, or In-Person</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-black transition"
          >
            <X className="size-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Sales Channel Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
              Sales Channel
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setChannel("instagram")}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-semibold transition ${
                  channel === "instagram"
                    ? "border-fuchsia-400 bg-fuchsia-50 text-fuchsia-800 ring-2 ring-fuchsia-200"
                    : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                <InstagramIcon className="size-4" />
                <span>Instagram</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel("reference")}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-semibold transition ${
                  channel === "reference"
                    ? "border-indigo-400 bg-indigo-50 text-indigo-800 ring-2 ring-indigo-200"
                    : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                <Users className="size-4" />
                <span>Reference</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel("whatsapp")}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-semibold transition ${
                  channel === "whatsapp"
                    ? "border-emerald-400 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-200"
                    : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                <MessageCircle className="size-4" />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel("direct")}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-semibold transition ${
                  channel === "direct"
                    ? "border-amber-400 bg-amber-50 text-amber-800 ring-2 ring-amber-200"
                    : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                <Store className="size-4" />
                <span>In-Person</span>
              </button>
            </div>
          </div>

          {/* Customer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Customer Name</label>
              <input
                type="text"
                placeholder="e.g. Zain Mirza / @username"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 px-3.5 py-2 text-sm text-neutral-900 focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="0300 1234567"
                value={phoneNum}
                onChange={(e) => setPhoneNum(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 px-3.5 py-2 text-sm text-neutral-900 focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 px-3.5 py-2 text-sm text-neutral-900 focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Sale Date</label>
              <input
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 px-3.5 py-2 text-sm text-neutral-900 focus:outline-none focus:border-black"
              />
            </div>
          </div>

          {/* Items Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Fragrance Items
              </label>
              <button
                type="button"
                onClick={addItemRow}
                className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-800 hover:text-black"
              >
                <Plus className="size-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => {
                const prod = products.find(p => p.id === item.productId);
                return (
                  <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
                    <select
                      value={item.productId}
                      onChange={(e) => handleProductChange(idx, Number(e.target.value))}
                      className="flex-1 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 font-medium text-neutral-900"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>

                    {prod?.variants && prod.variants.length > 0 && (
                      <select
                        value={item.variantLabel}
                        onChange={(e) => handleVariantChange(idx, e.target.value)}
                        className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 font-medium text-neutral-900"
                      >
                        {prod.variants.map((v, vidx) => (
                          <option key={vidx} value={v.label}>{v.label}</option>
                        ))}
                      </select>
                    )}

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span className="text-neutral-400">Qty:</span>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
                          className="w-14 rounded-lg border border-neutral-200 bg-white px-2 py-1 text-center font-bold"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-neutral-400">Rs:</span>
                        <input
                          type="number"
                          min={0}
                          value={item.price}
                          onChange={(e) => handlePriceChange(idx, Number(e.target.value))}
                          className="w-20 rounded-lg border border-neutral-200 bg-white px-2 py-1 text-center font-bold"
                        />
                      </div>

                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          className="p-1 text-neutral-400 hover:text-red-600 transition"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing Adjustments */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-neutral-100">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Delivery Fee (Rs.)</label>
              <input
                type="number"
                min={0}
                value={deliveryAmount}
                onChange={(e) => setDeliveryAmount(Number(e.target.value))}
                className="w-full rounded-xl border border-neutral-200 px-3 py-1.5 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Discount (Rs.)</label>
              <input
                type="number"
                min={0}
                value={discountAmount}
                onChange={(e) => setDiscountAmount(Number(e.target.value))}
                className="w-full rounded-xl border border-neutral-200 px-3 py-1.5 text-xs font-semibold"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-neutral-600 mb-1">Net Total</label>
              <div className="rounded-xl bg-neutral-100 px-3 py-1.5 text-xs font-bold text-neutral-900 border border-neutral-200">
                Rs. {netTotal.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Payment & Order Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-medium"
              >
                <option value="Cash">Cash / COD</option>
                <option value="Bank Transfer">Bank Transfer / Raast</option>
                <option value="Credit Card">Online / Card</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Status</label>
              <select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value as any)}
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-medium"
              >
                <option value="delivered">Delivered / Completed</option>
                <option value="processing">Processing / Dispatched</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Internal Reference Notes</label>
            <input
              type="text"
              placeholder="e.g. Reached via Instagram story, VIP customer"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 px-3.5 py-2 text-xs"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-black transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800 transition active:scale-[0.98] disabled:opacity-50"
            >
              <CheckCircle2 className="size-4" />
              <span>{submitting ? "Recording..." : "Save Sale"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
