'use client';

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Filter, ShoppingBag, Star, Check, ArrowRight, Sparkles, SlidersHorizontal } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { Product } from "@/app/lib/types";

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [family, setFamily] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<number, string>>({});

  const { addToCart, cart } = useCart();
  const [, startTransition] = useTransition();

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          category,
          family,
          search,
          sort,
          page: String(page),
          pageSize: "12"
        });
        const res = await fetch(`/api/product?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
          setTotalPages(data.totalPages || 1);
        }
      } catch (err) {
        console.error("Error fetching catalog", err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchProducts();
    }, 200);

    return () => clearTimeout(timer);
  }, [category, family, search, sort, page]);

  return (
    <main className="w-full min-h-screen py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Editorial Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#e5dbc7] text-[#1b4431] text-xs font-bold tracking-[0.25em] uppercase shadow-xs">
          <Sparkles size={13} className="text-[#b39b66]" />
          <span>Haute Parfumerie Catalog</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-neutral-900 font-serif">
          The Fragrance Collection
        </h1>

        <p className="text-sm sm:text-base text-neutral-600 font-light max-w-xl mx-auto">
          Explore our complete range of concentrated Extrait de Parfum creations, engineered for enduring elegance and commanding sillage.
        </p>
      </div>

      {/* Search & Filter Controls Bar */}
      <div className="bg-white rounded-3xl p-6 border border-[#e5dbc7] shadow-xs mb-10 space-y-5">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, oud, rose, amber, notes..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e5dbc7] bg-[#faf7f2] text-sm text-neutral-800 placeholder-neutral-400 focus:outline-hidden focus:border-[#1b4431]"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <span className="text-xs uppercase font-bold tracking-wider text-neutral-500 whitespace-nowrap">
              Sort By:
            </span>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="px-3.5 py-2 rounded-xl border border-[#e5dbc7] bg-[#faf7f2] text-xs font-semibold text-neutral-800 focus:outline-hidden focus:border-[#1b4431]"
            >
              <option value="featured">Curated & Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="name">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Gender / Category Pills */}
        <div className="pt-3 border-t border-[#f0e8d9] flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 mr-2 flex items-center gap-1">
              <Filter size={13} />
              <span>Category:</span>
            </span>
            {[
              { id: "all", label: "All Fragrances" },
              { id: "unisex", label: "Unisex Editions" },
              { id: "mens", label: "For Men" },
              { id: "women", label: "For Women" }
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setCategory(cat.id);
                  setPage(1);
                }}
                className={`text-xs font-semibold px-4 py-1.5 rounded-full border transition ${
                  category === cat.id
                    ? "bg-[#1b4431] text-white border-[#1b4431]"
                    : "bg-[#faf7f2] text-neutral-700 border-[#e5dbc7] hover:border-[#1b4431]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Olfactory Family Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", label: "All Families" },
              { id: "Oriental Oud", label: "Oriental Oud" },
              { id: "Floral Bouquet", label: "Floral Bouquet" },
              { id: "Citrus Leather", label: "Citrus Leather" },
              { id: "Woody Amber", label: "Woody Amber" },
              { id: "Fresh Aquatic", label: "Fresh Aquatic" }
            ].map((fam) => (
              <button
                key={fam.id}
                type="button"
                onClick={() => {
                  setFamily(fam.id);
                  setPage(1);
                }}
                className={`text-[11px] font-medium px-3 py-1 rounded-lg transition ${
                  family === fam.id
                    ? "bg-[#b39b66] text-[#0f271c] font-bold"
                    : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                }`}
              >
                {fam.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="animate-pulse space-y-4">
              <div className="aspect-4/5 w-full rounded-3xl bg-neutral-200" />
              <div className="h-4 w-24 bg-neutral-200 rounded mx-auto" />
              <div className="h-6 w-36 bg-neutral-200 rounded mx-auto" />
              <div className="h-10 w-full bg-neutral-200 rounded-xl" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#e5dbc7] p-8">
          <p className="text-lg font-bold text-neutral-800 font-serif">No fragrances match your selection</p>
          <p className="text-sm text-neutral-500 mt-2">Try clearing your search query or choosing another category.</p>
          <button
            onClick={() => {
              setSearch("");
              setCategory("all");
              setFamily("all");
            }}
            className="mt-6 px-6 py-2.5 rounded-full bg-[#1b4431] text-white text-xs font-bold uppercase tracking-widest"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((item) => {
            const currentVariantLabel =
              selectedVariants[item.id] || item.variants?.[0]?.label || "50ml Extrait";
            const currentVariant =
              item.variants?.find((v) => v.label === currentVariantLabel) || item.variants?.[0];
            const activePrice = currentVariant ? currentVariant.price : item.price;
            const activeStock = currentVariant ? currentVariant.stock : item.stock;
            const inCart = cart.some(
              (c) => c.id === item.id && c.variantLabel === currentVariantLabel
            );

            return (
              <div
                key={item.id}
                className="group flex flex-col justify-between bg-white rounded-3xl p-5 border border-[#e8dfcf] shadow-xs hover:shadow-xl hover:border-[#1b4431] transition-all duration-300"
              >
                <div>
                  <Link href={`/productDetail/${item.id}`} className="block relative aspect-4/5 w-full rounded-2xl overflow-hidden bg-[#faf7f2] border border-[#f0e8d9]">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />

                    <div className="absolute top-3 left-3 bg-[#1b4431]/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                      {item.concentration || "Extrait"}
                    </div>

                    <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs text-neutral-800 text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                      <Star size={11} className="text-amber-500 fill-amber-500" />
                      <span>{item.rating || 5.0}</span>
                    </div>
                  </Link>

                  <div className="pt-4 text-center space-y-1">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-[#b39b66]">
                      {item.olfactoryFamily}
                    </p>
                    <Link href={`/productDetail/${item.id}`}>
                      <h3 className="text-lg font-bold uppercase tracking-tight text-neutral-900 group-hover:text-[#1b4431] transition font-serif truncate">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-neutral-500 line-clamp-1">{item.tagline}</p>

                    {/* Variant Switcher */}
                    {item.variants && item.variants.length > 0 && (
                      <div className="flex justify-center gap-1.5 pt-2">
                        {item.variants.map((v) => (
                          <button
                            key={v.label}
                            type="button"
                            onClick={() =>
                              setSelectedVariants({
                                ...selectedVariants,
                                [item.id]: v.label
                              })
                            }
                            className={`text-[11px] px-2 py-0.5 rounded-md font-semibold transition ${
                              currentVariantLabel === v.label
                                ? "bg-[#1b4431] text-white"
                                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                            }`}
                          >
                            {v.label.split(" ")[0]}
                          </button>
                        ))}
                      </div>
                    )}

                    <p className="text-base font-bold text-[#1b4431] pt-1">
                      Rs. {activePrice.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-2">
                  <button
                    disabled={activeStock <= 0}
                    onClick={() =>
                      addToCart({
                        id: item.id,
                        name: item.name,
                        description: item.tagline,
                        price: activePrice,
                        image: item.image,
                        stock: activeStock,
                        category: item.category,
                        variantLabel: currentVariantLabel
                      })
                    }
                    className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed ${
                      inCart
                        ? "bg-[#1b4431] text-white"
                        : "border border-neutral-300 hover:border-[#1b4431] bg-[#faf7f2] hover:bg-[#1b4431] hover:text-white text-neutral-800"
                    }`}
                  >
                    {activeStock <= 0 ? (
                      <span>Sold Out</span>
                    ) : inCart ? (
                      <>
                        <Check size={14} />
                        <span>In Bag</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={14} />
                        <span>Add To Bag</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-16 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-full border border-neutral-300 text-xs font-bold uppercase tracking-wider disabled:opacity-40 hover:border-black transition"
          >
            Previous
          </button>
          <span className="text-xs text-neutral-500 font-medium">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-full border border-neutral-300 text-xs font-bold uppercase tracking-wider disabled:opacity-40 hover:border-black transition"
          >
            Next
          </button>
        </div>
      )}
    </main>
  );
}

