'use client';

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Check } from "lucide-react";
import { useCart } from "@/app/context/CartContext";

type ProductVariant = {
  label: string;
  price: number;
  stock: number;
};

type FeaturedProduct = {
  id: number;
  name: string;
  tagline?: string;
  description: string;
  category: string;
  olfactoryFamily?: string;
  price: number;
  stock: number;
  image: string;
  concentration?: string;
  variants: ProductVariant[];
};

interface ShowcaseCardProps {
  product: FeaturedProduct;
  index: number;
}

const CARD_ACCENTS = ["#183e2d", "#3f1f2c", "#452e18", "#1c2a29"];

function ShowcaseCard({ product, index }: ShowcaseCardProps) {
  const { addToCart } = useCart();
  const accent = CARD_ACCENTS[index % CARD_ACCENTS.length];

  // Variant selection (only if product has variants)
  const hasVariants = Boolean(product.variants && product.variants.length > 0);
  const variants = hasVariants ? product.variants! : [];
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const activeVariant = hasVariants ? variants[selectedVariantIndex] || variants[0] : null;
  const currentPrice = activeVariant ? (Number(activeVariant.price) || product.price) : Number(product.price);
  const activeStock = activeVariant ? activeVariant.stock : Number(product.stock);

  // Add to Bag feedback state
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(
      {
        id: product.id,
        name: product.name,
        description: product.description,
        price: currentPrice,
        image: product.image || "/images/safaPerfume.png",
        stock: activeStock,
        category: product.category,
      },
      activeVariant?.label,
      1
    );

    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <li className="min-w-0 list-none">
      <article className="flex h-full flex-col text-center">
        <Link
          href={`/productDetail/${product.id}`}
          className="group relative block aspect-4/5 overflow-hidden rounded-xl border-2 bg-[#f3eee6] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand"
          style={{ borderColor: accent }}
          aria-label={`View ${product.name} details`}
        >
          <span className="absolute left-3 top-3 z-10 rounded-full bg-black/75 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-white">
            Featured
          </span>
          <Image
            src={product.image || "/images/safaPerfume.png"}
            alt={`${product.name} fragrance`}
            fill
            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            priority={index < 2}
          />
        </Link>

        <div className="flex min-h-[178px] flex-1 flex-col items-center pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9a7b35]">
            {product.olfactoryFamily || product.category || "Safa Fragrance"}
          </p>
          <Link href={`/productDetail/${product.id}`} className="mt-2">
            <h3 className="text-xl font-bold uppercase tracking-wide text-brand-dark transition-colors hover:text-brand">
              {product.name}
            </h3>
          </Link>
          <p className="mt-2 text-base font-medium text-neutral-700">
            {variants.length > 1 ? `From Rs. ${currentPrice.toLocaleString()}` : `Rs. ${currentPrice.toLocaleString()}`}
          </p>

          {variants.length > 1 && (
            <div role="radiogroup" aria-label="Select volume" className="mt-4 flex min-h-8 w-full gap-2">
              {variants.map((v, i) => {
                const isSelected = i === selectedVariantIndex;
                return (
                  <button
                    key={v.label}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setSelectedVariantIndex(i)}
                    className={`flex-1 rounded-md border py-2 text-[12px] font-semibold uppercase tracking-wider transition ${
                      isSelected
                        ? "border-brand-dark bg-brand-dark text-white"
                        : "border-neutral-300 bg-transparent text-neutral-600 hover:border-brand-dark"
                    }`}
                  >
                    {v.label}
                  </button>
                );
              })}
            </div>
          )}

          {!variants.length && <div className="mt-4 min-h-8" aria-hidden="true" />}

          <button
            type="button"
            onClick={handleAddToCart}
            className={`mt-4 flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border-2 px-3 text-[11px] font-bold uppercase tracking-wider transition ${
              added
                ? "border-[#1b4431] bg-[#1b4431] text-white"
                : "border-brand bg-transparent text-brand-dark hover:bg-brand hover:text-white"
            }`}
            aria-label={`Add ${product.name} to cart`}
          >
            {added ? <><Check className="size-3.5" /> Added to Cart</> : <><ShoppingBag className="size-3.5" /> Add to Cart</>}
          </button>
        </div>
      </article>
    </li>
  );
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFeatured() {
      try {
        setLoading(true);
        const res = await fetch("/api/featured-products", { cache: "no-store" });
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
    <section className="relative w-full overflow-hidden py-16 sm:py-24 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto">
      {/* GIANT EDITORIAL WATERMARK IN BACKGROUND */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden"
      >
        <span className="text-[#1b4431]/[0.035] text-[22vw] leading-none font-bold tracking-tighter uppercase select-none font-[Galsod]">
          SAFA
        </span>
      </div>

      <div className="relative z-10">
        {/* EDITORIAL HEADER */}
        <div className="mx-auto mb-12 max-w-2xl space-y-4 text-center sm:mb-16">
          <p className="text-xs uppercase tracking-[0.3em] font-semibold text-[#b39b66]">
            The Safa Collection • Extrait de Parfum
          </p>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-wider text-[#0e281d] font-[Galsod]">
            Featured fragrances
          </h2>

          <p className="text-sm sm:text-base text-neutral-700 max-w-xl mx-auto font-normal leading-relaxed">
            Discover the four fragrances selected from the Safa collection.
          </p>
        </div>

        {/* LOADING SKELETON */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-[2rem] border border-[#e7decb] bg-white overflow-hidden space-y-4"
              >
                <div className="aspect-3/4 w-full bg-neutral-200" />
                <div className="p-6 space-y-4">
                  <div className="h-6 w-24 rounded-full bg-neutral-200" />
                  <div className="h-6 w-3/4 rounded bg-neutral-200" />
                  <div className="h-4 w-1/2 rounded bg-neutral-200" />
                  <div className="h-10 w-full rounded-full bg-neutral-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ERROR STATE */}
        {error && !loading && (
          <div className="text-center py-12 text-sm text-neutral-500">
            Unable to load featured collection right now.
          </div>
        )}

        {/* THE 4 FEATURED PRODUCTS SHOWCASE */}
        {!loading && !error && products.length > 0 && (
          <ul className="mx-auto grid w-full max-w-6xl grid-cols-1 items-stretch gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(0, 4).map((product, idx) => (
              <ShowcaseCard key={product.id} product={product} index={idx} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
