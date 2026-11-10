'use client';

import React, { useState } from "react";
import { CheckCircle2, AlertCircle, Upload, Image as ImageIcon } from "lucide-react";
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
  olfactoryFamily?: string;
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

  const [formData, setFormData] = useState({
    name: product?.name ?? "",
    tagline: product?.tagline ?? "",
    description: product?.description ?? "",
    category: product?.category ?? "unisex",
    olfactoryFamily: product?.olfactoryFamily ?? "Oriental Woody",
    price: product?.price ?? 4500,
    stock: product?.stock ?? 30,
    image: product?.image ?? "/images/featurev1.png",
    variants: product?.variants ?? [
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

    const totalVariantStock = formData.variants.length > 0
      ? formData.variants.reduce((acc, curr) => acc + curr.stock, 0)
      : formData.stock;

    const basePrice = formData.variants.length > 0 ? formData.variants[0].price : formData.price;

    const payload = {
      name: formData.name,
      tagline: formData.tagline,
      description: formData.description,
      category: formData.category,
      olfactoryFamily: formData.olfactoryFamily,
      price: Number(basePrice),
      stock: Number(totalVariantStock),
      image: formData.image,
      concentration: "Extrait de Parfum • 35%",
      sillage: "Commanding",
      longevity: "14+ Hours",
      season: "All Seasons",
      ...(product?.notes ? { notes: product.notes } : {}),
      variants: formData.variants.map(v => ({
        label: v.label,
        price: Number(v.price),
        stock: Number(v.stock)
      }))
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
          olfactoryFamily: "Oriental Woody",
          price: 4500,
          stock: 30,
          image: "/images/featurev1.png",
          variants: [
            { label: "50ml Extrait", price: 4500, stock: 20 },
            { label: "100ml Extrait", price: 7200, stock: 10 }
          ]
        });
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
              Fragrance Name
            </label>
            <input
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition"
              type="text"
              name="name"
              id="prodName"
              placeholder="e.g. Amber Nuit Extrait"
              value={formData.name}
              onChange={handleData}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

          {/* Olfactory Family */}
          <div>
            <label htmlFor="olfactoryFamily" className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-2">
              Olfactory Family
            </label>
            <select
              id="olfactoryFamily"
              name="olfactoryFamily"
              value={formData.olfactoryFamily}
              onChange={handleData}
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition"
            >
              <option value="Oriental Oud">Oriental Oud</option>
              <option value="Woody Spicy">Woody Spicy</option>
              <option value="Floral Amber">Floral Amber</option>
              <option value="Gourmand">Gourmand</option>
              <option value="Citrus Aromatic">Citrus Aromatic</option>
              <option value="Leather Oriental">Leather Oriental</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="prodDes" className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-2">
            Description & Scent Narrative
          </label>
          <textarea
            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition resize-none"
            name="description"
            id="prodDes"
            rows={3}
            placeholder="Describe fragrance composition, projection, and mood..."
            value={formData.description}
            onChange={handleData}
          />
        </div>

        {/* Size Variations */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                Size Variations & Inventory
              </label>
              <p className="mt-0.5 text-xs text-neutral-500">Manage individual stock and prices for 50ml, 100ml, etc.</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData((currentData) => ({
                ...currentData,
                variants: [...currentData.variants, { label: "Sample Extrait", price: 2000, stock: 15 }]
              }))}
              className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide hover:border-black transition"
            >
              Add Size
            </button>
          </div>
          <div className="space-y-3">
            {formData.variants.map((variant, index) => (
              <div key={index} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <div>
                  <label className="mb-1 block text-xs text-neutral-500">Size Label</label>
                  <input
                    type="text"
                    placeholder="e.g. 50ml Extrait"
                    value={variant.label}
                    onChange={(event) => updateVariant(index, "label", event.target.value)}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-medium focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-neutral-500">Price (PKR)</label>
                  <input
                    type="number"
                    min="0"
                    value={variant.price || ""}
                    onChange={(event) => updateVariant(index, "price", event.target.value)}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-medium focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-neutral-500">Stock Units</label>
                  <input
                    type="number"
                    min="0"
                    value={variant.stock || ""}
                    onChange={(event) => updateVariant(index, "stock", event.target.value)}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-medium focus:outline-none focus:border-black"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setFormData((currentData) => ({
                    ...currentData,
                    variants: currentData.variants.filter((_, variantIndex) => variantIndex !== index)
                  }))}
                  className="mb-1 px-2 py-2 text-xs font-semibold text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
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
                placeholder="/images/featurev1.png"
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
