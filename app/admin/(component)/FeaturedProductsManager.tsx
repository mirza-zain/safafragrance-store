'use client';

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { 
  Star, 
  X, 
  Plus, 
  Check, 
  Search,
  Loader2,
} from "lucide-react";

export type AdminProduct = {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  image: string;
};

type Props = {
  allProducts: AdminProduct[];
  onFeaturedUpdated?: (featuredIds: number[]) => void;
};

export default function FeaturedProductsManager({ allProducts, onFeaturedUpdated }: Props) {
  const [slots, setSlots] = useState<(AdminProduct | null)[]>([null, null, null, null]);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const onFeaturedUpdatedRef = useRef(onFeaturedUpdated);
  useEffect(() => {
    onFeaturedUpdatedRef.current = onFeaturedUpdated;
  }, [onFeaturedUpdated]);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const res = await fetch("/api/featured-products", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load featured products");
        const data = await res.json();
        const loaded: AdminProduct[] = data.featuredProducts || [];

        const newSlots: (AdminProduct | null)[] = [null, null, null, null];
        for (let i = 0; i < loaded.length && i < 4; i++) {
          newSlots[i] = loaded[i] || null;
        }
        setSlots(newSlots);
        onFeaturedUpdatedRef.current?.(newSlots.filter(Boolean).map(p => p!.id));
      } catch (err) {
        console.error("Error loading featured slots:", err);
      }
    }

    loadFeatured();
  }, []);

  const saveFeaturedProducts = async (nextSlots: (AdminProduct | null)[]) => {
    try {
      setSaving(true);
      const featuredProductIds = nextSlots.filter(Boolean).map(p => p!.id);
      const res = await fetch("/api/featured-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featuredProductIds })
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to save featured products");
      }

      const data = await res.json();
      const loaded: AdminProduct[] = data.featuredProducts || [];
      const updatedSlots: (AdminProduct | null)[] = [null, null, null, null];
      for (let i = 0; i < loaded.length && i < 4; i++) {
        updatedSlots[i] = loaded[i] || null;
      }
      setSlots(updatedSlots);
      setHasChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      onFeaturedUpdatedRef.current?.(featuredProductIds);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Error saving featured showcase");
    } finally {
      setSaving(false);
    }
  };

  const handleSelectProduct = (product: AdminProduct) => {
    if (activeSlotIndex === null) return;
    const newSlots = [...slots];
    newSlots[activeSlotIndex] = product;
    setSlots(newSlots);
    setActiveSlotIndex(null);
    setSearchQuery("");
    void saveFeaturedProducts(newSlots);
  };

  const handleRemoveSlot = (index: number) => {
    const newSlots = [...slots];
    newSlots[index] = null;
    setSlots(newSlots);
    void saveFeaturedProducts(newSlots);
  };

  const handleSave = () => {
    void saveFeaturedProducts(slots);
  };

  const availableProducts = allProducts.filter(
    p => !slots.some(s => s && s.id === p.id)
  );

  const filteredSelection = availableProducts.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-neutral-100">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Star className="size-4 fill-amber-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Featured Homepage Showcase (4 Slots)</h2>
            <p className="text-xs text-neutral-500">Curate the four perfumes prominently displayed on the storefront hero</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 animate-in fade-in">
              <Check className="size-3.5" />
              <span>Saved successfully</span>
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving || (!hasChanges && !saveSuccess)}
            className="px-4 py-2 bg-black hover:bg-neutral-800 disabled:opacity-40 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-1.5"
          >
            {saving && <Loader2 className="size-3 animate-spin" />}
            <span>{saving ? "Saving..." : "Save Showcase"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {slots.map((slot, idx) => (
          <div
            key={idx}
            className={`relative rounded-xl border p-4 transition flex flex-col justify-between ${
              slot
                ? "border-neutral-200 bg-neutral-50/50"
                : "border-dashed border-neutral-300 bg-white hover:border-black"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Slot {idx + 1}
              </span>
              {slot && (
                <button
                  type="button"
                  onClick={() => handleRemoveSlot(idx)}
                  title="Remove from slot"
                  className="text-neutral-400 hover:text-red-600 p-1 rounded-md transition"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {slot ? (
              <div className="space-y-3">
                <div className="relative h-28 w-full rounded-lg overflow-hidden bg-white border border-neutral-200">
                  <Image
                    src={slot.image || "/images/safaPerfume.png"}
                    alt={slot.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                    onError={(event) => {
                      event.currentTarget.src = "/images/safaPerfume.png";
                    }}
                  />
                </div>
                <div>
                  <p className="font-bold text-xs text-neutral-900 truncate">{slot.name}</p>
                  <p className="text-[11px] text-neutral-500">Rs. {slot.price.toLocaleString()}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSlotIndex(idx)}
                  className="w-full text-center py-1.5 rounded-lg border border-neutral-200 bg-white text-[11px] font-semibold text-neutral-700 hover:border-black transition"
                >
                  Replace
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setActiveSlotIndex(idx)}
                className="h-36 flex flex-col items-center justify-center gap-2 text-neutral-400 hover:text-black transition"
              >
                <Plus className="size-6" />
                <span className="text-xs font-semibold">Assign Perfume</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Product Selection Modal */}
      {activeSlotIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-neutral-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-bold text-neutral-900">
                Select Perfume for Slot {activeSlotIndex + 1}
              </h3>
              <button onClick={() => setActiveSlotIndex(null)} className="p-1 text-neutral-400 hover:text-black">
                <X className="size-5" />
              </button>
            </div>

            <div className="relative">
              <Search className="size-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-black"
                autoFocus
              />
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-neutral-100">
              {filteredSelection.length === 0 ? (
                <p className="py-8 text-center text-xs text-neutral-400">
                  {allProducts.length === 0 ? "Loading products..." : "No matching fragrances available."}
                </p>
              ) : (
                filteredSelection.map(p => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between gap-3 hover:bg-neutral-50 px-2 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="relative size-10 rounded-lg overflow-hidden border border-neutral-200 shrink-0">
                        <Image src={p.image || "/images/safaPerfume.png"} alt={p.name} fill sizes="64px" className="object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-neutral-900">{p.name}</p>
                        <p className="text-[11px] text-neutral-400">Rs. {p.price.toLocaleString()} • {p.category}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectProduct(p)}
                      className="px-3 py-1 bg-black text-white text-[11px] font-bold rounded-lg hover:bg-neutral-800"
                    >
                      Choose
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
