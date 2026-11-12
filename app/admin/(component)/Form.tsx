'use client';

import React, { useState } from "react";
import { CheckCircle2, AlertCircle, Upload, Plus, Trash2, Layers } from "lucide-react";
import Image from "next/image";

export type ProductVariant = {
  label: string;
  price: number;
  stock: number;
};

export type AdminProduct = {
  id: number;
  name: string;
  tagline?: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  variants?: ProductVariant[];
  notes?: { top: string[]; heart: string[]; base: string[] };
};

type FormProps = {
  product?: AdminProduct;
  onProductSaved?: (product: AdminProduct) => void;
};

export default function Form({ product, onProductSaved }: FormProps) {
  const isEditing = !!product;

  const [hasVariants, setHasVariants] = useState<boolean>(() => {
    return Boolean(product?.variants && product.variants.length > 0);
  });

  const [formData, setFormData] = useState({
    name: product?.name ?? "",
    tagline: product?.tagline ?? "",
    description: product?.description ?? "",
    category: product?.category ?? "unisex",
    price: product?.price ?? 4500,
    stock: product?.stock ?? 30,
    image: product?.image ?? "/images/safaPerfume.png",
    variants: product?.variants && product.variants.length > 0
      ? product.variants
      : [
          { label: "50ml Extrait", price: product?.price ?? 4500, stock: 20 },
          { label: "100ml Extrait", price: Math.round((product?.price ?? 4500) * 1.6), stock: 10 }
        ]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  function handleData(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setServerError("");
    setSuccessMessage("");
    setFormData({
      ...formData,
      [name]: name === "price" || name === "stock" ? Number(value) : value
    });
  }

  function handleToggleVariants(enable: boolean) {
    setServerError("");
    setSuccessMessage("");
    setHasVariants(enable);
    if (enable && formData.variants.length === 0) {
      setFormData((prev) => ({
        ...prev,
        variants: [
          { label: "50ml Extrait", price: prev.price || 4500, stock: prev.stock || 20 }
        ]
      }));
    }
  }

  function handleAddVariant() {
    setServerError("");
    setSuccessMessage("");
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          label: prev.variants.length === 0 ? "50ml Extrait" : `${prev.variants.length === 1 ? "100ml" : "Sample"} Extrait`,
          price: prev.price || 4500,
          stock: 10
        }
      ]
    }));
  }

  function handleRemoveVariant(index: number) {
    setServerError("");
    setSuccessMessage("");
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, idx) => idx !== index)
    }));
  }

  function updateVariant(index: number, field: keyof ProductVariant, value: string) {
    setServerError("");
    setSuccessMessage("");
    setFormData((currentData) => ({
      ...currentData,
      variants: currentData.variants.map((variant, variantIndex) =>
        variantIndex === index
          ? { ...variant, [field]: field === "label" ? value : Number(value) }
          : variant
      )
    }));
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const data = new FormData();
      data.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: data });
      if (res.ok) {
        const json = await res.json();
        setFormData(prev => ({ ...prev, image: json.url }));
      }
    } catch {
      setServerError("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError("");
    setSuccessMessage("");

    if (!formData.name.trim()) return setServerError("Product name is required.");
    if (!formData.description.trim()) return setServerError("Product description is required.");
    if (!formData.category) return setServerError("Please select a category.");

    const useVariants = hasVariants && formData.variants.length > 0;

    const basePrice = useVariants
      ? Number(formData.variants[0]?.price) || 0
      : Number(formData.price) || 0;

    const totalStock = useVariants
      ? formData.variants.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0)
      : Number(formData.stock) || 0;

    if (basePrice <= 0) {
      return setServerError("Please enter a valid price greater than 0.");
    }
    if (totalStock < 0) {
      return setServerError("Stock cannot be negative.");
    }

    const payloadVariants = useVariants
      ? formData.variants.map((v) => ({
          label: v.label.trim() || "Standard",
          price: Number(v.price) || basePrice,
          stock: Math.max(0, Number(v.stock) || 0)
        }))
      : [];

    const payload = {
      name: formData.name.trim(),
      tagline: formData.tagline.trim(),
      description: formData.description.trim(),
      category: formData.category,
      price: Number(basePrice),
      stock: Number(totalStock),
      image: formData.image || "/images/safaPerfume.png",
      concentration: "Extrait de Parfum • 35%",
      sillage: "Commanding",
      longevity: "14+ Hours",
      season: "All Seasons",
      ...(product?.notes ? { notes: product.notes } : {}),
      variants: payloadVariants
    };

    try {
      setIsSubmitting(true);
      const url = isEditing
        ? `/api/productDetail/${product.id}`
        : "/api/product";

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(isEditing ? "Failed to update product." : "Failed to create product.");
      }

      const data = await response.json();
      const saved = Array.isArray(data) ? data[0] : data;

      setSuccessMessage(isEditing ? "Product updated successfully!" : "Product created successfully!");

      if (!isEditing) {
        setFormData({
          name: "",
          tagline: "",
          description: "",
          category: "unisex",
          price: 4500,
          stock: 30,
          image: "/images/safaPerfume.png",
          variants: [
            { label: "50ml Extrait", price: 4500, stock: 20 },
            { label: "100ml Extrait", price: 7200, stock: 10 }
          ]
        });
        setHasVariants(false);
      }

      if (onProductSaved && saved) {
        onProductSaved(saved);
      }
    } catch (error) {
      setServerError((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const totalVariantStock = formData.variants.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0);
  const startingVariantPrice = formData.variants[0]?.price ?? formData.price;

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-6 sm:p-8">
      {serverError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-3">
          <AlertCircle className="size-5 shrink-0 text-red-500" />
          <span>{serverError}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl flex items-center gap-3">
          <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Product Name */}
          <div>
            <label htmlFor="prodName" className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-2">
              Fragrance Name <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition"
              type="text"
              name="name"
              id="prodName"
              placeholder="e.g. Amber Nuit Extrait"
              value={formData.name}
              onChange={handleData}
              required
            />
          </div>

          {/* Tagline */}
          <div>
            <label htmlFor="prodTagline" className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-2">
              Tagline / Subtitle
            </label>
            <input
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition"
              type="text"
              name="tagline"
              id="prodTagline"
              placeholder="e.g. Smoky Royal Oud & Velvet Taif Rose"
              value={formData.tagline}
              onChange={handleData}
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="prodCategory" className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-2">
            Category
          </label>
          <select
            id="prodCategory"
            name="category"
            value={formData.category}
            onChange={handleData}
            className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition"
          >
            <option value="unisex">Unisex</option>
            <option value="mens">Men</option>
            <option value="women">Women</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="prodDes" className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-2">
            Description & Scent Narrative <span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition resize-none"
            name="description"
            id="prodDes"
            rows={3}
            placeholder="Describe fragrance composition, projection, and mood..."
            value={formData.description}
            onChange={handleData}
            required
          />
        </div>

        {/* Pricing & Inventory (Direct price for single piece, or optional multiple size variants) */}
        <div className="space-y-4 pt-2">
          {/* Base Single-Piece Pricing & Stock */}
          {!hasVariants && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-neutral-50/80 rounded-2xl border border-neutral-200/80">
              <div>
                <label htmlFor="prodPrice" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Direct Price (PKR) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">Rs.</span>
                  <input
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition"
                    type="number"
                    min="0"
                    name="price"
                    id="prodPrice"
                    placeholder="4500"
                    value={formData.price || ""}
                    onChange={handleData}
                    required={!hasVariants}
                  />
                </div>
                <p className="mt-1 text-[11px] text-neutral-500">Retail price for single piece.</p>
              </div>

              <div>
                <label htmlFor="prodStock" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Available Stock (Units) <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition"
                  type="number"
                  min="0"
                  name="stock"
                  id="prodStock"
                  placeholder="30"
                  value={formData.stock || ""}
                  onChange={handleData}
                  required={!hasVariants}
                />
                <p className="mt-1 text-[11px] text-neutral-500">Total units available in reserve.</p>
              </div>
            </div>
          )}

          {/* Optional Variants Toggle Box */}
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4 sm:p-5 transition">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Layers className="size-4 text-[#1b4431]" />
                  <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                    Multiple Size Editions (Optional)
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border ${
                    hasVariants 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                      : "bg-neutral-200/60 text-neutral-600 border-neutral-300/60"
                  }`}>
                    {hasVariants ? "Multi-Variant" : "Single Piece"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  {hasVariants 
                    ? "Manage separate stock and individual pricing for 50ml, 100ml, Sample sizes, etc."
                    : "Turn ON if this product has multiple sizes (e.g. 50ml, 100ml). Leave off for single piece."}
                </p>
              </div>

              {/* Toggle switch */}
              <label className="relative inline-flex items-center cursor-pointer select-none self-start sm:self-auto shrink-0">
                <input
                  type="checkbox"
                  checked={hasVariants}
                  onChange={(e) => handleToggleVariants(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1b4431]"></div>
                <span className="ml-2.5 text-xs font-semibold text-neutral-700">
                  {hasVariants ? "Variants Enabled" : "Enable Variants"}
                </span>
              </label>
            </div>

            {/* If Variants are enabled, show the responsive variant boxes */}
            {hasVariants && (
              <div className="mt-4 pt-4 border-t border-neutral-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    Size Variations ({formData.variants.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-300 hover:border-black text-neutral-900 rounded-lg text-xs font-semibold uppercase tracking-wide transition shadow-2xs cursor-pointer active:scale-95"
                  >
                    <Plus className="size-3.5" />
                    <span>Add Size</span>
                  </button>
                </div>

                {formData.variants.length === 0 ? (
                  <div className="p-6 text-center bg-white rounded-xl border border-dashed border-neutral-300">
                    <p className="text-xs text-neutral-500">No size variations configured.</p>
                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="mt-2 text-xs font-bold text-[#1b4431] hover:underline"
                    >
                      + Add first size variation
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.variants.map((variant, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-xl border border-neutral-200 p-3.5 sm:p-4 shadow-2xs transition hover:border-neutral-300"
                      >
                        {/* Mobile Header: Edition tag & Remove button */}
                        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-neutral-100 sm:hidden">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                            Edition #{index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(index)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 active:scale-95 py-1 px-2 rounded-md hover:bg-red-50"
                          >
                            <Trash2 className="size-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>

                        {/* Responsive Input Fields: Full width label on mobile, stacked or side-by-side price/stock */}
                        <div className="grid grid-cols-1 sm:grid-cols-[1.6fr_1fr_1fr_auto] gap-3 sm:items-end">
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-neutral-600">
                              Size Edition Label
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. 50ml Extrait"
                              value={variant.label}
                              onChange={(event) => updateVariant(index, "label", event.target.value)}
                              className="w-full rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 py-2 text-xs font-medium text-neutral-900 focus:bg-white focus:outline-none focus:border-black transition"
                            />
                          </div>

                          {/* Mobile: 2-column grid for Price & Stock so they sit side-by-side comfortably */}
                          <div className="grid grid-cols-2 sm:contents gap-3">
                            <div>
                              <label className="mb-1 block text-xs font-semibold text-neutral-600">
                                Price (PKR)
                              </label>
                              <input
                                type="number"
                                min="0"
                                placeholder="4500"
                                value={variant.price || ""}
                                onChange={(event) => updateVariant(index, "price", event.target.value)}
                                className="w-full rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 py-2 text-xs font-medium text-neutral-900 focus:bg-white focus:outline-none focus:border-black transition"
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-semibold text-neutral-600">
                                Stock Units
                              </label>
                              <input
                                type="number"
                                min="0"
                                placeholder="20"
                                value={variant.stock || ""}
                                onChange={(event) => updateVariant(index, "stock", event.target.value)}
                                className="w-full rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 py-2 text-xs font-medium text-neutral-900 focus:bg-white focus:outline-none focus:border-black transition"
                              />
                            </div>
                          </div>

                          {/* Desktop Remove Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(index)}
                            className="hidden sm:inline-flex mb-0.5 p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Remove edition"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Live Variant Summary */}
                {formData.variants.length > 0 && (
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 px-1 text-xs text-neutral-500 font-medium">
                    <div className="flex items-center gap-3">
                      <span>
                        Total Stock: <strong className="text-neutral-900 font-semibold">{totalVariantStock} units</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Starting Price: <strong className="text-neutral-900 font-semibold">Rs. {Number(startingVariantPrice).toLocaleString()}</strong>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Product Image */}
        <div>
          <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-2">
            Fragrance Bottle Image
          </label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-xl border border-neutral-300 transition">
              <Upload className="size-4" />
              <span>{uploadingImage ? "Uploading..." : "Upload Local Photo"}</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>

            <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
              <span className="text-xs text-neutral-400">or path:</span>
              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleData}
                placeholder="/images/safaPerfume.png"
                className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-black"
              />
            </div>
          </div>

          {formData.image && (
            <div className="mt-4 flex items-center gap-3">
              <div className="relative size-20 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 shrink-0">
                <Image
                  src={formData.image}
                  alt={formData.name || "Preview"}
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-xs text-neutral-500">Image preview active</span>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-black hover:bg-neutral-800 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition active:scale-[0.99] flex items-center gap-2 shadow-xs"
          >
            {isSubmitting ? (
              <span>Saving...</span>
            ) : (
              <span>{isEditing ? "Update Fragrance" : "Publish Fragrance"}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
