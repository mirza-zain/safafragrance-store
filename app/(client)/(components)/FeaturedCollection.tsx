'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, ShoppingBag, ArrowRight, Star, Check } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { Product } from "@/app/lib/types";

export default function FeaturedCollection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, cart } = useCart();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/featured-products");
        if (res.ok) {
          const data = await res.json();
          setProducts(data.featuredProducts || []);
        }
      } catch (e) {
        console.error("Failed to load featured products", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <section className="w-full py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#e5dbc7] text-[#1b4431] text-xs font-bold tracking-[0.25em] uppercase shadow-xs">
          <Sparkles size={13} className="text-[#b39b66]" />
          <span>Curated Selection</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-neutral-900 font-serif">
          Featured Fragrances
        </h2>

        <p className="text-sm sm:text-base md:text-lg text-neutral-600 font-light">
          Handpicked signature editions commanding attention with extraordinary sillage and longevity.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse space-y-4">
              <div className="aspect-4/5 w-full rounded-3xl bg-neutral-200" />
              <div className="h-4 w-28 bg-neutral-200 rounded mx-auto" />
              <div className="h-6 w-40 bg-neutral-200 rounded mx-auto" />
              <div className="h-12 w-full bg-neutral-200 rounded-xl" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((item) => {
            const inCart = cart.some((c) => c.id === item.id);
            const minPrice = item.variants?.length
              ? Math.min(...item.variants.map((v) => v.price))
              : item.price;

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
                      Featured
                    </div>

                    <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs text-neutral-800 text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                      <Star size={11} className="text-amber-500 fill-amber-500" />
                      <span>{item.rating || 5.0}</span>
                    </div>
                  </Link>

                  <div className="pt-4 text-center space-y-1">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-[#b39b66]">
                      {item.olfactoryFamily || "Extrait de Parfum"}
                    </p>
                    <Link href={`/productDetail/${item.id}`}>
                      <h3 className="text-lg font-bold uppercase tracking-tight text-neutral-900 group-hover:text-[#1b4431] transition font-serif truncate">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-neutral-500 line-clamp-1">{item.tagline}</p>
                    <p className="text-base font-bold text-[#1b4431] pt-1">
                      {item.variants?.length ? `From Rs. ${minPrice.toLocaleString()}` : `Rs. ${item.price.toLocaleString()}`}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-2">
                  <button
                    onClick={() =>
                      addToCart({
                        id: item.id,
                        name: item.name,
                        description: item.tagline,
                        price: minPrice,
                        image: item.image,
                        stock: item.stock,
                        category: item.category,
                        variantLabel: item.variants?.[0]?.label || "50ml Extrait"
                      })
                    }
                    className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-[0.98] ${
                      inCart
                        ? "bg-[#1b4431] text-white"
                        : "border border-neutral-300 hover:border-[#1b4431] bg-[#faf7f2] hover:bg-[#1b4431] hover:text-white text-neutral-800"
                    }`}
                  >
                    {inCart ? (
                      <>
                        <Check size={14} />
                        <span>In Bag</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={14} />
                        <span>Quick Add</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Explore All Catalog CTA */}
      <div className="mt-14 text-center">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2.5 rounded-full border border-[#d8cbb5] bg-white px-8 py-3.5 text-xs sm:text-sm font-bold tracking-widest uppercase text-neutral-900 hover:border-[#1b4431] hover:bg-[#1b4431] hover:text-white transition shadow-xs"
        >
          <span>Explore Complete Collection</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}

