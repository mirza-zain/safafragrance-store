'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Trash2, Edit2, Search, Star, Check, Sparkles, X } from "lucide-react";
import { Product } from "@/app/lib/types";

export default function ManageProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: "",
    tagline: "",
    description: "",
    category: "unisex" as "mens" | "women" | "unisex",
    olfactoryFamily: "Oriental Oud" as Product["olfactoryFamily"],
    price: 4500,
    stock: 30,
    image: "/images/featurev1.png",
    concentration: "Extrait de Parfum • 35%",
    sillage: "Commanding" as Product["sillage"],
    longevity: "14+ Hours",
    season: "All Seasons",
    topNotes: "Bergamot, Saffron",
    heartNotes: "Taif Rose, Jasmine",
    baseNotes: "Oud, Amber, Vanilla",
    variant50Price: 4500,
    variant50Stock: 20,
    variant100Price: 7500,
    variant100Stock: 10,
    isFeatured: true
  });

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/product?pageSize=100");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error("Failed to load products", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you certain you wish to archive this fragrance from the public catalog?")) return;

    try {
      const res = await fetch(`/api/productDetail/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts(products.filter((p) => p.id !== id));
      }
    } catch (err) {
      alert("Failed to delete product");
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        name: form.name,
        tagline: form.tagline,
        description: form.description,
        category: form.category,
        olfactoryFamily: form.olfactoryFamily,
        price: Number(form.price),
        stock: Number(form.variant50Stock) + Number(form.variant100Stock),
        image: form.image,
        concentration: form.concentration,
        sillage: form.sillage,
        longevity: form.longevity,
        season: form.season,
        notes: {
          top: form.topNotes.split(",").map((s) => s.trim()),
          heart: form.heartNotes.split(",").map((s) => s.trim()),
          base: form.baseNotes.split(",").map((s) => s.trim())
        },
        variants: [
          { label: "50ml Extrait", price: Number(form.variant50Price), stock: Number(form.variant50Stock) },
          { label: "100ml Extrait", price: Number(form.variant100Price), stock: Number(form.variant100Stock) }
        ],
        isFeatured: form.isFeatured
      };

      const res = await fetch("/api/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Creation failed");

      setShowAddModal(false);
      loadProducts();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.olfactoryFamily.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-[0.25em] text-[#b39b66]">
            Inventory Management
          </span>
          <h1 className="text-3xl font-black uppercase tracking-tight text-neutral-900 font-serif">
            Manage Fragrances
          </h1>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-3 rounded-xl bg-[#1b4431] hover:bg-[#123023] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg transition"
        >
          <Plus size={16} />
          <span>Add New Fragrance Edition</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#e5dbc7] shadow-xs flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by name, family, or category..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e5dbc7] bg-[#faf7f2] text-xs focus:outline-hidden focus:border-[#1b4431]"
          />
        </div>
        <span className="text-xs text-neutral-500 font-medium hidden sm:inline">
          Showing {filtered.length} of {products.length} formulations
        </span>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-[#e5dbc7] shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#faf7f2] border-b border-[#eee6d7] text-neutral-400 uppercase font-bold tracking-wider">
              <tr>
                <th className="py-4 px-6">Fragrance</th>
                <th className="py-4 px-4">Olfactory Family</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Base Price</th>
                <th className="py-4 px-4">Stock</th>
                <th className="py-4 px-4">Variants</th>
                <th className="py-4 px-4">Featured</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-400">
                    Loading fragrances...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-400">
                    No formulations found.
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-[#faf7f2] transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="relative size-12 rounded-xl overflow-hidden bg-[#faf7f2] border border-[#e5dbc7] shrink-0">
                          <Image src={product.image} alt={product.name} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900 text-sm font-serif">{product.name}</p>
                          <p className="text-[11px] text-neutral-400 truncate max-w-xs">{product.tagline}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-[#faf7f2] border border-[#e5dbc7] text-[11px] font-bold text-[#b39b66]">
                        {product.olfactoryFamily}
                      </span>
                    </td>
                    <td className="py-4 px-4 capitalize text-neutral-700">{product.category}</td>
                    <td className="py-4 px-4 font-bold text-neutral-900">
                      Rs. {product.price.toLocaleString()}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`font-bold ${
                          product.stock <= 15 ? "text-amber-600" : "text-emerald-700"
                        }`}
                      >
                        {product.stock} units
                      </span>
                    </td>
                    <td className="py-4 px-4 text-neutral-500">
                      {product.variants?.map((v) => v.label.split(" ")[0]).join(", ") || "Single"}
                    </td>
                    <td className="py-4 px-4">
                      {product.isFeatured ? (
                        <span className="size-2 rounded-full bg-[#1b4431] inline-block" title="Featured" />
                      ) : (
                        <span className="size-2 rounded-full bg-neutral-300 inline-block" />
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/productDetail/${product.id}`}
                          target="_blank"
                          className="p-2 rounded-lg border border-[#e5dbc7] hover:border-black text-neutral-600 hover:text-black transition"
                          title="View on Storefront"
                        >
                          <Star size={14} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add New Fragrance Edition */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-[#e5dbc7] shadow-2xl space-y-6 my-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-[#eee6d7]">
              <div>
                <h3 className="text-xl font-bold font-serif text-neutral-900">Add Fragrance Edition</h3>
                <p className="text-xs text-neutral-500">Create a new Extrait de Parfum in the live store</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-full hover:bg-neutral-100 text-neutral-500"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Fragrance Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Safa Royale Oud"
                    className="w-full px-3 py-2.5 rounded-xl border border-[#e5dbc7] bg-[#faf7f2]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Tagline / Short Hook *</label>
                  <input
                    type="text"
                    required
                    value={form.tagline}
                    onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                    placeholder="e.g. Rare Cambodian agarwood with royal rose"
                    className="w-full px-3 py-2.5 rounded-xl border border-[#e5dbc7] bg-[#faf7f2]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Full Description *</label>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Artisanal description of the olfactory journey..."
                  className="w-full px-3 py-2.5 rounded-xl border border-[#e5dbc7] bg-[#faf7f2]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#e5dbc7] bg-[#faf7f2]"
                  >
                    <option value="unisex">Unisex</option>
                    <option value="mens">Men</option>
                    <option value="women">Women</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Olfactory Family</label>
                  <select
                    value={form.olfactoryFamily}
                    onChange={(e) => setForm({ ...form, olfactoryFamily: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#e5dbc7] bg-[#faf7f2]"
                  >
                    <option value="Oriental Oud">Oriental Oud</option>
                    <option value="Floral Bouquet">Floral Bouquet</option>
                    <option value="Citrus Leather">Citrus Leather</option>
                    <option value="Woody Amber">Woody Amber</option>
                    <option value="Fresh Aquatic">Fresh Aquatic</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Bottle Image</label>
                  <select
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#e5dbc7] bg-[#faf7f2]"
                  >
                    <option value="/images/featurev1.png">Bottle Edition 1 (Amber Gold)</option>
                    <option value="/images/featurev2.png">Bottle Edition 2 (Velvet Rose)</option>
                    <option value="/images/featurev3.png">Bottle Edition 3 (Midnight Dark)</option>
                    <option value="/images/icon2.png">Bottle Edition 4 (Classic Icon)</option>
                  </select>
                </div>
              </div>

              {/* Scent Pyramid Notes */}
              <div className="p-4 rounded-2xl bg-[#faf7f2] border border-[#e5dbc7] space-y-3">
                <span className="font-bold text-[#b39b66] uppercase tracking-wider block">
                  Olfactory Accords (Comma Separated)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-neutral-600 mb-1">Top Notes</label>
                    <input
                      type="text"
                      value={form.topNotes}
                      onChange={(e) => setForm({ ...form, topNotes: e.target.value })}
                      className="w-full px-2.5 py-2 rounded-lg border border-[#e5dbc7] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-600 mb-1">Heart Notes</label>
                    <input
                      type="text"
                      value={form.heartNotes}
                      onChange={(e) => setForm({ ...form, heartNotes: e.target.value })}
                      className="w-full px-2.5 py-2 rounded-lg border border-[#e5dbc7] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-600 mb-1">Base Notes</label>
                    <input
                      type="text"
                      value={form.baseNotes}
                      onChange={(e) => setForm({ ...form, baseNotes: e.target.value })}
                      className="w-full px-2.5 py-2 rounded-lg border border-[#e5dbc7] bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Variants Pricing */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">50ml Price (Rs.)</label>
                  <input
                    type="number"
                    value={form.variant50Price}
                    onChange={(e) => setForm({ ...form, variant50Price: Number(e.target.value), price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e5dbc7] bg-[#faf7f2]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">50ml Stock</label>
                  <input
                    type="number"
                    value={form.variant50Stock}
                    onChange={(e) => setForm({ ...form, variant50Stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e5dbc7] bg-[#faf7f2]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">100ml Price (Rs.)</label>
                  <input
                    type="number"
                    value={form.variant100Price}
                    onChange={(e) => setForm({ ...form, variant100Price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e5dbc7] bg-[#faf7f2]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">100ml Stock</label>
                  <input
                    type="number"
                    value={form.variant100Stock}
                    onChange={(e) => setForm({ ...form, variant100Stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e5dbc7] bg-[#faf7f2]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featuredCheck"
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  className="size-4 text-[#1b4431]"
                />
                <label htmlFor="featuredCheck" className="font-bold text-neutral-800">
                  Highlight as Featured Edition on Homepage
                </label>
              </div>

              <div className="pt-4 border-t border-[#eee6d7] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-neutral-300 font-bold uppercase tracking-wider text-neutral-600 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-[#1b4431] text-white font-bold uppercase tracking-wider hover:bg-[#123023] disabled:opacity-50"
                >
                  {saving ? "Creating Edition..." : "Save Fragrance Edition"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

