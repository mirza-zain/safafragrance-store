'use client';

import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ShoppingBag, Search, X } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { useEffect, useState } from "react";

type ProductVariant = {
  label: string;
  price: number;
  stock: number;
};

type Product = {
  id: number;
  name: string;
  tagline?: string;
  description: string;
  image: string;
  price: number;
  category: string;
  stock: number;
  variants: ProductVariant[];
};

type Props = {
  limit?: number;
};

export default function Products({ limit }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { addToCart, cart } = useCart();

  useEffect(() => {
    const timer = setTimeout(() => {
      async function getProducts() {
        setLoading(true);
        try {
          const pageSize = limit ?? 8;
          const searchParam = searchQuery.trim() ? `&search=${encodeURIComponent(searchQuery.trim())}` : "";
          const response = await fetch(
            `/api/product?catalog=true&page=${limit ? 1 : currentPage}&pageSize=${pageSize}&category=${selectedCategory}${searchParam}`
          );

          if (!response.ok) throw new Error("Could not fetch products");

          const result: { products: Product[]; totalPages: number } = await response.json();

          setProducts(result.products || []);
          setTotalPages(result.totalPages || 1);
          setLoading(false);
        } catch (err) {
          setError((err as Error).message);
          setLoading(false);
        }
      }

      getProducts();
    }, 200);

    return () => clearTimeout(timer);
  }, [currentPage, limit, selectedCategory, searchQuery]);

  return (
    <div className="w-full">
      {/* Search & Category Controls */}
      <div className="mb-10 max-w-2xl mx-auto space-y-5">
        {/* Live Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search fragrances by name (e.g. Oud, Rose, Imperial)..."
            className="w-full pl-11 pr-10 py-3.5 rounded-full border border-[#e7decb] bg-white text-xs sm:text-sm text-neutral-800 placeholder-neutral-400 focus:outline-hidden focus:border-[#1b4431] focus:ring-1 focus:ring-[#1b4431] shadow-xs transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-700 transition"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Filter products by category">
          {[
            { value: "all", label: "All Fragrances" },
            { value: "mens", label: "Men" },
            { value: "women", label: "Women" },
            { value: "unisex", label: "Unisex" },
          ].map((category) => (
            <button
              key={category.value}
              type="button"
              onClick={() => {
                setSelectedCategory(category.value);
                setCurrentPage(1);
              }}
              className={`rounded-full border px-5 py-2.5 text-xs sm:text-sm font-semibold tracking-wider uppercase transition active:scale-95 ${
                selectedCategory === category.value
                  ? "border-[#1b4431] bg-[#1b4431] text-white shadow-xs"
                  : "border-[#e7decb] bg-white text-neutral-600 hover:border-[#1b4431] hover:text-[#1b4431]"
              }`}
              aria-pressed={selectedCategory === category.value}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div
          className={
            products.length === 1
              ? "flex justify-center"
              : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          }
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].slice(0, limit ?? 8).map((i) => (
            <div key={i} className="animate-pulse space-y-4">
              <div className="aspect-4/5 w-full rounded-2xl bg-neutral-200" />
              <div className="h-4 w-24 rounded bg-neutral-200 mx-auto" />
              <div className="h-6 w-48 rounded bg-neutral-200 mx-auto" />
              <div className="h-12 w-full rounded-md bg-neutral-200" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="text-center py-16 text-sm text-neutral-500">
          <p>There was an error loading the fragrance catalog.</p>
        </div>
      )}

      {/* Products Grid */}
      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((item) => {
            const minPrice = item.variants?.length
              ? Math.min(...item.variants.map((variant) => Number(variant.price) || item.price))
              : item.price;

            const selectedQuantity = cart.find((c) => c.id === item.id)?.quantity ?? 0;

            return (
              <div className={`w-full flex flex-col group ${products.length === 1 ? "max-w-md" : ""}`} key={item.id}>
                <Link href={`/productDetail/${item.id}`} className="block flex-1">
                  <div className="relative aspect-4/5 w-full overflow-hidden rounded-2xl shadow-sm bg-[#faf7f2] border border-[#e7decb] transition-all duration-300 group-hover:shadow-lg group-hover:border-[#1b4431]">
                    {item.image ? (
                      <Image
                        src={item.image}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        alt={`${item.name} perfume`}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
                        No Image Available
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-[#b39b66] uppercase tracking-widest mt-4 text-center font-semibold">
                    Extrait de Parfum
                  </p>
                  <div className="flex flex-col justify-center items-center gap-1 mt-1 text-center">
                    <h3 className="text-base sm:text-lg font-bold text-neutral-900 group-hover:text-[#1b4431] transition font-sans tracking-wide">
                      {item.name}
                    </h3>
                    {item.tagline && (
                      <p className="text-xs text-neutral-500 line-clamp-1">{item.tagline}</p>
                    )}
                    <p className="text-base sm:text-lg font-semibold text-[#1b4431]">
                      {item.variants?.length
                        ? `From Rs. ${minPrice.toLocaleString()}`
                        : `Rs. ${Number(item.price).toLocaleString()}`}
                    </p>
                  </div>
                </Link>

                <div className="flex flex-col gap-2 items-center mt-5 justify-center">
                  {item.variants?.length ? (
                    <Link
                      href={`/productDetail/${item.id}`}
                      className="w-full py-3.5 text-sm sm:text-base font-semibold flex items-center justify-center border-2 border-[#1b4431] text-[#1b4431] rounded-xl uppercase transition-all duration-150 hover:bg-[#1b4431] hover:text-white active:scale-[0.98]"
                    >
                      Choose Edition
                    </Link>
                  ) : (
                    <button
                      disabled={Number(item.stock) <= 0}
                      onClick={() => addToCart(item)}
                      aria-label={
                        selectedQuantity > 0
                          ? `${selectedQuantity} selected, add another ${item.name}`
                          : `Add ${item.name} to cart`
                      }
                      className={`w-full py-3.5 text-sm sm:text-base font-semibold flex items-center justify-center gap-2 border-2 rounded-xl uppercase transition-all duration-150 active:scale-[0.98] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#1b4431] disabled:cursor-not-allowed disabled:opacity-50 ${
                        selectedQuantity > 0
                          ? "border-[#1b4431] bg-[#1b4431] text-white hover:bg-[#0e281d]"
                          : "border-[#1b4431] text-[#1b4431] hover:bg-[#1b4431] hover:text-white"
                      }`}
                    >
                      <ShoppingBag className="size-5" />
                      {Number(item.stock) > 0
                        ? selectedQuantity > 0
                          ? `Added (${selectedQuantity})`
                          : "Add to Cart"
                        : "Out of Stock"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && products.length === 0 && (
        <div className="text-center py-20 px-4 max-w-md mx-auto space-y-4">
          <div className="size-12 rounded-full bg-[#1b4431]/10 flex items-center justify-center mx-auto text-[#1b4431]">
            ✦
          </div>
          <h3 className="text-xl font-bold uppercase tracking-wider font-[Galsod] text-[#0e281d]">
            Collection In Creation
          </h3>
          <p className="text-sm text-neutral-600 leading-relaxed font-normal">
            Our master perfumers are curating the next private reserve editions. Explore our brand story or contact our concierge for inquiries.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-[#1b4431] px-6 py-2.5 text-xs font-semibold tracking-widest uppercase text-white hover:bg-[#0e281d] transition"
            >
              Contact Concierge
            </Link>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!limit && totalPages > 1 && (
        <nav className="mt-14 flex items-center justify-center gap-2" aria-label="Product pages">
          <button
            type="button"
            onClick={() => setCurrentPage((page) => page - 1)}
            disabled={currentPage === 1}
            className="inline-flex items-center gap-1 rounded-full border border-[#e7decb] bg-white px-4 py-2 text-xs sm:text-sm font-semibold uppercase tracking-wider text-neutral-700 transition hover:border-[#1b4431] hover:text-[#1b4431] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
            Previous
          </button>
          <span className="px-4 text-xs sm:text-sm text-neutral-500 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((page) => page + 1)}
            disabled={currentPage === totalPages}
            className="inline-flex items-center gap-1 rounded-full border border-[#e7decb] bg-white px-4 py-2 text-xs sm:text-sm font-semibold uppercase tracking-wider text-neutral-700 transition hover:border-[#1b4431] hover:text-[#1b4431] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <ChevronRight className="size-4" />
          </button>
        </nav>
      )}
    </div>
  );
}
