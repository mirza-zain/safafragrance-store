'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShoppingBag, Sparkles } from "lucide-react";
import { useCart } from "@/app/context/CartContext";

type ProductVariant = {
  label: string;
  price: number;
  stock: number;
};

type FeaturedProduct = {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  variants: ProductVariant[];
  position?: number;
};

export default function FeaturedProducts() {
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart, cart } = useCart();

  useEffect(() => {
    async function loadFeatured() {
      try {
        setLoading(true);
        const res = await fetch("/api/featured-products");
        if (!res.ok) throw new Error("Failed to load featured fragrances");
        const data = await res.json();
        setProducts(data.featuredProducts || []);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    loadFeatured();
  }, []);

  if (!loading && products.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-16 sm:py-24 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto">
      {/* Editorial Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3 mb-12 sm:mb-16">
        <p className="text-xs uppercase tracking-[0.3em] font-semibold text-[#b39b66]">
          Curated Selection
        </p>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-wider text-[#0e281d] font-[Galsod]">
          Featured Fragrances
        </h2>

        <p className="text-sm sm:text-base text-neutral-700 max-w-lg mx-auto font-normal leading-relaxed">
          Handpicked signature editions commanding attention with extraordinary sillage and longevity.
        </p>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse space-y-4">
              <div className="aspect-4/5 w-full rounded-2xl bg-neutral-200" />
              <div className="h-4 w-24 rounded bg-neutral-200 mx-auto" />
              <div className="h-6 w-48 rounded bg-neutral-200 mx-auto" />
              <div className="h-10 w-full rounded-xl bg-neutral-200" />
            </div>
          ))}
        </div>
      )}

      {/* Error Fallback */}
      {error && !loading && (
        <div className="text-center py-12 text-sm text-neutral-500">
          Unable to display featured collection right now.
        </div>
      )}

      {/* Curated 4-Product Grid */}
      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {products.map((item) => {
            const minPrice = item.variants?.length
              ? Math.min(...item.variants.map((v) => Number(v.price) || item.price))
              : item.price;

            const selectedQuantity = cart.find((c) => c.id === item.id)?.quantity ?? 0;

            return (
              <div className="w-full flex flex-col group" key={item.id}>
                <Link href={`/productDetail/${item.id}`} className="block flex-1">
                  <div className="relative aspect-4/5 w-full overflow-hidden rounded-2xl bg-[#faf7f2] border border-[#e7decb]/80 transition-all duration-300 group-hover:shadow-md group-hover:border-[#1b4431]">
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

                    {/* Minimalist Floating Badge */}
                    <div className="absolute top-3 left-3 bg-[#0e281d]/85 backdrop-blur-xs text-[#d8c38c] text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full font-sans">
                      Featured
                    </div>
                  </div>

                  <div className="flex flex-col justify-center items-center gap-1 mt-4 text-center">
                    <span className="text-[11px] uppercase tracking-wider text-[#b39b66] font-semibold">
                      {item.category || "Extrait de Parfum"}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-neutral-900 group-hover:text-[#1b4431] transition font-sans tracking-wide">
                      {item.name}
                    </h3>
                    <p className="text-sm sm:text-base font-semibold text-[#1b4431]">
                      {item.variants?.length
                        ? `From Rs. ${minPrice.toLocaleString()}`
                        : `Rs. ${Number(item.price).toLocaleString()}`}
                    </p>
                  </div>
                </Link>

                <div className="mt-4">
                  {item.variants?.length ? (
                    <Link
                      href={`/productDetail/${item.id}`}
                      className="w-full py-3 text-xs sm:text-sm font-semibold flex items-center justify-center border border-[#1b4431] text-[#1b4431] rounded-xl uppercase tracking-wider transition-all duration-150 hover:bg-[#1b4431] hover:text-white active:scale-[0.98]"
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
                      className={`w-full py-3 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 border rounded-xl uppercase tracking-wider transition-all duration-150 active:scale-[0.98] focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 ${
                        selectedQuantity > 0
                          ? "border-[#1b4431] bg-[#1b4431] text-white hover:bg-[#0e281d]"
                          : "border-[#1b4431] text-[#1b4431] hover:bg-[#1b4431] hover:text-white"
                      }`}
                    >
                      <ShoppingBag className="size-4" />
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

      {/* Explore All Catalog CTA */}
      <div className="mt-12 sm:mt-16 text-center">
        <Link
          href="/product"
          className="inline-flex items-center gap-2.5 rounded-full border border-[#1b4431]/40 bg-white px-8 py-3.5 text-xs sm:text-sm font-semibold tracking-widest uppercase text-[#1b4431] hover:border-[#1b4431] hover:bg-[#1b4431] hover:text-white transition-all duration-200 shadow-xs"
        >
          <span>Explore All Fragrances</span>
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
