'use client';

import React, { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Check, Sparkles, ArrowRight } from "lucide-react";
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

// Curated luxury accent schemes for the 4 slots inspired by Perfumora
const SCENT_THEMES = [
  {
    bg: "#183e2d", // Emerald Noir
    accent: "#1b4431",
    glow: "rgba(216, 195, 140, 0.25)",
    tag: "Edition 01",
  },
  {
    bg: "#3f1f2c", // Plum Velvet
    accent: "#4a2233",
    glow: "rgba(235, 180, 190, 0.28)",
    tag: "Edition 02",
  },
  {
    bg: "#452e18", // Golden Smoked Amber
    accent: "#53371d",
    glow: "rgba(245, 205, 140, 0.3)",
    tag: "Edition 03",
  },
  {
    bg: "#1c2a29", // Midnight Cypress
    accent: "#223533",
    glow: "rgba(180, 215, 205, 0.25)",
    tag: "Edition 04",
  },
];

interface ShowcaseCardProps {
  product: FeaturedProduct;
  index: number;
}

function ShowcaseCard({ product, index }: ShowcaseCardProps) {
  const theme = SCENT_THEMES[index % SCENT_THEMES.length];
  const { addToCart } = useCart();

  // Variant selection (default to first variant or 50ml)
  const variants = product.variants && product.variants.length > 0
    ? product.variants
    : [
        { label: "50 ml", price: product.price, stock: product.stock || 100 },
        { label: "100 ml", price: Math.round(product.price * 1.65), stock: 50 },
      ];

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const activeVariant = variants[selectedVariantIndex] || variants[0];
  const currentPrice = Number(activeVariant.price) || product.price;

  // Add to Bag feedback state
  const [added, setAdded] = useState(false);

  // 3D Tilt Stage Refs and States
  const stageRef = useRef<HTMLDivElement>(null);
  const flaconRef = useRef<HTMLDivElement>(null);
  const frameId = useRef<number | null>(null);

  const targetX = useRef(0);
  const targetY = useRef(0);
  const currentX = useRef(0);
  const currentY = useRef(0);

  const [isHovered, setIsHovered] = useState(false);
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  // Physics animation loop using lerp for silky smooth 3D response
  const updateMotion = useCallback(() => {
    currentX.current += (targetX.current - currentX.current) * 0.12;
    currentY.current += (targetY.current - currentY.current) * 0.12;

    if (flaconRef.current) {
      const rotX = (-currentY.current * 16).toFixed(2);
      const rotY = (currentX.current * 16).toFixed(2);
      const shadowX = (-currentX.current * 18).toFixed(1);
      const shadowY = (currentY.current * 18 + 16).toFixed(1);

      flaconRef.current.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(28px) scale3d(1.03, 1.03, 1.03)`;
      flaconRef.current.style.filter = `drop-shadow(${shadowX}px ${shadowY}px 22px rgba(0, 0, 0, 0.45))`;
    }

    frameId.current = requestAnimationFrame(updateMotion);
  }, []);

  useEffect(() => {
    frameId.current = requestAnimationFrame(updateMotion);
    return () => {
      if (frameId.current) cancelAnimationFrame(frameId.current);
    };
  }, [updateMotion]);

  // Ambient idle breathing when not hovered
  useEffect(() => {
    if (isHovered) return;

    let time = index * 1.5; // Offset by card index for organic wave effect
    const interval = setInterval(() => {
      time += 0.04;
      targetX.current = Math.sin(time * 0.8) * 0.22;
      targetY.current = Math.cos(time * 0.6) * 0.18;
      setGlare({
        x: 50 + targetX.current * 30,
        y: 45 + targetY.current * 30,
        opacity: 0.18,
      });
    }, 16);

    return () => clearInterval(interval);
  }, [isHovered, index]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    setIsHovered(true);

    const rect = stageRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    const normX = Math.max(-1, Math.min(1, (px - 0.5) * 2));
    const normY = Math.max(-1, Math.min(1, (py - 0.5) * 2));

    targetX.current = normX;
    targetY.current = normY;

    setGlare({
      x: px * 100,
      y: py * 100,
      opacity: 0.55,
    });
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    targetX.current = 0;
    targetY.current = 0;
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  const handleAddToCart = () => {
    addToCart(
      {
        id: product.id,
        name: product.name,
        description: product.description,
        price: currentPrice,
        image: product.image || "/images/safaPerfume.png",
        stock: activeVariant.stock,
        category: product.category,
      },
      activeVariant.label,
      1
    );

    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <li className="flex flex-col list-none">
      <article className="relative flex flex-col h-full rounded-[2rem] border border-[#e7decb]/80 bg-white shadow-[0_18px_44px_-26px_rgba(14,40,29,0.18)] hover:shadow-[0_24px_50px_-20px_rgba(14,40,29,0.28)] transition-all duration-500 overflow-hidden group">
        
        {/* TOP BOTTLE 3D SHOWCASE STAGE */}
        <div
          ref={stageRef}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          className="relative w-full overflow-hidden select-none cursor-grab active:cursor-grabbing"
          style={{
            backgroundColor: theme.bg,
            perspective: "900px",
          }}
        >
          {/* Radial Ambient Backdrop Glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(120% 80% at 50% 18%, ${theme.glow}, transparent 65%)`,
            }}
          />

          {/* Scent Accord Pill */}
          <div className="absolute top-4 left-4 z-20">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase text-white/90 bg-black/30 backdrop-blur-md border border-white/10 shadow-xs">
              <span className="size-1.5 rounded-full bg-[#d8c38c]" />
              {product.concentration || "35% Extrait"}
            </span>
          </div>

          {/* 3D Dynamic Specular Light Glare Sweep */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
            style={{
              opacity: glare.opacity,
              background: `radial-gradient(circle 180px at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.08) 50%, transparent 80%)`,
            }}
          />

          {/* 3D Tilting Flacon Flank */}
          <Link
            href={`/productDetail/${product.id}`}
            className="relative z-10 block px-6 pt-10 pb-12 focus:outline-hidden"
            aria-label={`View ${product.name} details`}
          >
            <div
              ref={flaconRef}
              className="mx-auto aspect-3/4 w-[76%] max-w-[240px] will-change-transform transition-all duration-100 ease-out"
              style={{
                transformStyle: "preserve-3d",
              }}
            >
              <div className="relative w-full h-full">
                <Image
                  src={product.image || "/images/safaPerfume.png"}
                  alt={`${product.name} Luxury Flacon`}
                  fill
                  sizes="(max-width: 640px) 75vw, (max-width: 1024px) 40vw, 22vw"
                  className="object-contain"
                  priority={index < 2}
                />
              </div>
            </div>
          </Link>

          {/* Interactive 3D Perspective Cue */}
          <div className="absolute bottom-2.5 right-3.5 z-20 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">
            <span className="text-[9px] uppercase tracking-widest text-white/70 font-semibold flex items-center gap-1">
              <Sparkles className="size-2.5 text-[#d8c38c]" /> 3D Tilt
            </span>
          </div>
        </div>

        {/* BOTTOM CARD CONTENT (PERFUMORA ARCHITECTURE) */}
        <div className="p-6 flex flex-col flex-1 justify-between bg-gradient-to-b from-white to-[#faf7f2]/50">
          <div>
            {/* Price Pill Badge */}
            <div className="flex items-center justify-between mb-3">
              <span
                className="inline-flex items-center rounded-full px-4 py-1.5 text-[0.95rem] font-bold tracking-tight text-white shadow-xs tabular-nums transition-colors duration-300"
                style={{ backgroundColor: theme.accent }}
              >
                Rs. {currentPrice.toLocaleString()}
              </span>

              {/* Family pill */}
              <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                {product.olfactoryFamily || product.category || "Extrait de Parfum"}
              </span>
            </div>

            {/* Fragrance Name */}
            <Link href={`/productDetail/${product.id}`} className="group/title block">
              <h3 className="text-xl sm:text-2xl font-bold text-[#0e281d] font-[Galsod] uppercase tracking-wide group-hover/title:text-[#b39b66] transition-colors">
                {product.name}
              </h3>
            </Link>

            {/* Subtitle / Tagline */}
            <p className="text-xs text-neutral-600 mt-1 line-clamp-1 font-medium">
              {product.tagline || product.description}
            </p>
          </div>

          {/* Controls: Size Selector & Add to Bag */}
          <div className="mt-5 space-y-4 pt-4 border-t border-[#e7decb]/60">
            {/* Size Variant Radio Buttons */}
            <div
              role="radiogroup"
              aria-label="Select Volume"
              className="flex items-center gap-2"
            >
              {variants.map((v, i) => {
                const isSelected = i === selectedVariantIndex;
                return (
                  <button
                    key={v.label}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setSelectedVariantIndex(i)}
                    className={`flex-1 rounded-full border py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "border-[#1b4431] bg-[#1b4431] text-white shadow-xs"
                        : "border-[#e7decb] bg-white text-neutral-600 hover:border-[#1b4431]/60 hover:text-neutral-900"
                    }`}
                  >
                    {v.label}
                  </button>
                );
              })}
            </div>

            {/* Add to Bag Luxury Action Button */}
            <button
              type="button"
              onClick={handleAddToCart}
              className={`w-full relative overflow-hidden rounded-full py-3.5 px-6 text-xs sm:text-sm font-semibold tracking-widest uppercase transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] ${
                added
                  ? "bg-[#0e281d] text-[#d8c38c] ring-2 ring-[#d8c38c]"
                  : "bg-[#1b4431] text-white hover:bg-[#0e281d] hover:shadow-lg border border-[#255840]"
              }`}
              aria-label={`Add ${product.name} (${activeVariant.label}) to cart`}
            >
              {added ? (
                <>
                  <Check className="size-4 text-[#d8c38c] animate-bounce" />
                  <span>Added to Bag</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="size-4" />
                  <span>Add to Bag</span>
                </>
              )}
            </button>

            {/* Quick Explore Link */}
            <div className="text-center pt-1">
              <Link
                href={`/productDetail/${product.id}`}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-500 hover:text-[#1b4431] transition-colors"
              >
                <span>View Edition Details</span>
                <ArrowRight className="size-3 text-[#b39b66]" />
              </Link>
            </div>
          </div>
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
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12 sm:mb-16">
          <p className="text-xs uppercase tracking-[0.3em] font-semibold text-[#b39b66]">
            The Collection • Haute Parfumerie
          </p>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-wider text-[#0e281d] font-[Galsod]">
            Selected Fragrances
          </h2>

          <p className="text-sm sm:text-base text-neutral-700 max-w-xl mx-auto font-normal leading-relaxed">
            Handcrafted Extrait de Parfum formulated with high oil concentrations. Commanding presence, delicate refinement, and unforgettable sillage.
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
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {products.slice(0, 4).map((product, idx) => (
              <ShowcaseCard key={product.id} product={product} index={idx} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
