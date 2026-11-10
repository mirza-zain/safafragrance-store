'use client';

import { useEffect, useState } from "react";
import Form, { AdminProduct } from "../(component)/Form";
import FeaturedProductsManager from "../(component)/FeaturedProductsManager";
import { 
  Pencil, 
  Trash2, 
  Search,
  Package,
  AlertCircle,
  Star
} from "lucide-react";
import Link from "next/link";

export default function ManageProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [featuredProductIds, setFeaturedProductIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this fragrance?")) return;

    try {
      const response = await fetch(`/api/productDetail/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        alert("Product could not be deleted");
        return;
      }

      setProducts((currentProducts) => currentProducts.filter((product) => product.id !== id));
      setFeaturedProductIds((currentIds) => currentIds.filter((fid) => fid !== id));
    } catch {
      alert("Error deleting product");
    }
  }

  useEffect(() => {
    async function getProducts() {
      try {
        const response = await fetch("/api/product");
        if (!response.ok) throw new Error("Error fetching products");
        const data = await response.json();
        const list = Array.isArray(data) ? data : (data.products || []);
        setProducts(list);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    getProducts();
  }, []);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:space-y-10 sm:px-10 sm:py-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-neutral-200">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 font-serif">
            Product Management
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Create new fragrance releases and monitor catalog inventory levels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 shadow-xs flex items-center gap-2">
            <Package className="size-4 text-neutral-400" />
            <span>{products.length} Total Fragrances</span>
          </div>
        </div>
      </div>

      {/* Featured Showcase Manager */}
      <FeaturedProductsManager
        allProducts={products}
        onFeaturedUpdated={(ids) => setFeaturedProductIds(ids)}
      />

      {/* Add Product Form Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 font-serif">
            Add New Fragrance Edition
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Fill in details below to publish a new perfume to the store.
          </p>
        </div>
        <Form 
          onProductSaved={(newProd) => setProducts((prev) => [newProd, ...prev])} 
        />
      </div>

      {/* Product Inventory Table Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-neutral-900 font-serif">
              Product Inventory
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Live stock and pricing across all active catalog items.
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-72">
            <Search className="size-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition"
            />
          </div>
        </div>

        {/* Content States */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
            <div className="size-8 border-2 border-neutral-300 border-t-black rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-neutral-500">Loading catalog inventory...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl flex items-center gap-3">
            <AlertCircle className="size-6 text-red-500 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
            <Package className="size-12 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-neutral-800">No products found</h3>
            <p className="text-xs text-neutral-500 mt-1">
              {searchQuery ? "Try refining your search query." : "Use the form above to add your first product."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-[46rem] w-full border-collapse text-left">
                <thead>
                  <tr className="bg-neutral-50/80 border-b border-neutral-200 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    <th className="py-3.5 px-6">ID</th>
                    <th className="py-3.5 px-6">Fragrance</th>
                    <th className="py-3.5 px-6">Category</th>
                    <th className="py-3.5 px-6">Price</th>
                    <th className="py-3.5 px-6">Stock Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-sm">
                  {filteredProducts.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-50/60 transition">
                      <td className="py-4 px-6 font-mono text-xs text-neutral-500">
                        #{item.id}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-neutral-900">
                            {item.name}
                          </span>
                          {featuredProductIds.includes(item.id) && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                              <Star className="size-3 text-amber-600 fill-amber-500" />
                              <span>Featured (Slot {featuredProductIds.indexOf(item.id) + 1})</span>
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-neutral-400 max-w-xs truncate mt-0.5">
                          {item.description}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-block px-2.5 py-1 text-xs font-medium uppercase tracking-wide rounded-full bg-neutral-100 text-neutral-700">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-medium text-neutral-900">
                        Rs. {item.price.toLocaleString()}
                      </td>
                      <td className="py-4 px-6">
                        {item.stock > 10 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="size-1.5 rounded-full bg-emerald-500" />
                            {item.stock} in stock
                          </span>
                        ) : item.stock > 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="size-1.5 rounded-full bg-amber-500" />
                            Low ({item.stock})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-red-50 text-red-700 border border-red-200">
                            <span className="size-1.5 rounded-full bg-red-500" />
                            Out of stock
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link 
                            href={`/admin/manageProducts/${item.id}`}
                            className="p-2 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-lg transition"
                            title="Edit product"
                          >
                            <Pencil className="size-4" />
                          </Link>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete product"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
