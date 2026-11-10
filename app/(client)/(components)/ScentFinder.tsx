'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, ArrowRight, ShoppingBag, Check } from "lucide-react";
import { useCart } from "@/app/context/CartContext";

type Recommendation = {
  id: number;
  name: string;
  family: string;
  price: number;
  image: string;
  description: string;
  longevity: string;
  notes: string;
};

const RECOMMENDATIONS: Record<string, Recommendation> = {
  oud: {
    id: 1,
    name: "Safa Royale Oud",
    family: "Oriental Oud",
    price: 4500,
    image: "/images/featurev1.png",
    description: "A commanding extrait of Cambodian agarwood, royal Taif rose, and bourbon vanilla.",
    longevity: "16+ Hours",
    notes: "Cambodian Oud • Saffron • Taif Rose"
  },
  floral: {
    id: 2,
    name: "Safa Velvet Rose",
    family: "Floral Bouquet",
    price: 3900,
    image: "/images/featurev2.png",
    description: "An opulent, sunlit floral masterpiece sparkling with pink peppercorn and white musk.",
    longevity: "14+ Hours",
    notes: "Grasse Rose • Pink Peppercorn • Cashmere Musk"
  },
  leather: {
    id: 3,
    name: "Safa Imperial Leather",
    family: "Citrus Leather",
    price: 4200,
    image: "/images/featurev3.png",
    description: "Sharp Tuscan leather and smoked birch sharpened by fresh Calabrian bergamot.",
    longevity: "15+ Hours",
    notes: "Tuscan Leather • Bergamot • Smoked Birch"
  },
  amber: {
    id: 4,
    name: "Safa Celestial Amber",
    family: "Woody Amber",
    price: 4800,
    image: "/images/icon2.png",
    description: "Warm, intoxicating Kashmiri saffron and golden amber resin for chilly evenings.",
    longevity: "18+ Hours",
    notes: "Kashmiri Saffron • Golden Amber • Sandalwood"
  },
  fresh: {
    id: 7,
    name: "Safa Aqua Solaris",
    family: "Fresh Aquatic",
    price: 3900,
    image: "/images/featurev3.png",
    description: "An invigorating splash of turquoise ocean waves with Amalfi lemon and driftwood.",
    longevity: "12+ Hours",
    notes: "Amalfi Lemon • Sea Spray • Mineral Driftwood"
  }
};

export default function ScentFinder() {
  const [occasion, setOccasion] = useState<"evening" | "daily" | "boardroom" | "summer">("evening");
  const [profile, setProfile] = useState<"oud" | "floral" | "leather" | "amber" | "fresh">("oud");
  const { addToCart, cart } = useCart();

  const currentMatch =
    occasion === "summer"
      ? RECOMMENDATIONS.fresh
      : occasion === "boardroom"
      ? RECOMMENDATIONS.leather
      : profile === "floral"
      ? RECOMMENDATIONS.floral
      : profile === "amber"
      ? RECOMMENDATIONS.amber
      : RECOMMENDATIONS.oud;

  const inCart = cart.some((c) => c.id === currentMatch.id);

  return (
    <section className="w-full bg-[#f4ece0] border-y border-[#e5dbc7] py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl border border-[#e5dbc7] p-8 sm:p-12 shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left: Interactive Quiz Controls */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#faf7f2] border border-[#e5dbc7] text-[#1b4431] text-[11px] font-bold tracking-widest uppercase">
                <Sparkles size={13} className="text-[#b39b66]" />
                <span>Bespoke Olfactory Concierge</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900 font-serif">
                Find Your Signature Scent
              </h2>

              <p className="text-sm sm:text-base text-neutral-600 font-light">
                Select your desired mood, occasion, and scent notes to receive an instant formulation recommendation tailored to your presence.
              </p>

              {/* Step 1: Occasion */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  1. The Occasion:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "evening", label: "Evening Gala" },
                    { id: "boardroom", label: "Executive" },
                    { id: "daily", label: "Daily Signature" },
                    { id: "summer", label: "Warm Weather" }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setOccasion(item.id as typeof occasion)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                        occasion === item.id
                          ? "bg-[#1b4431] border-[#1b4431] text-white shadow-xs"
                          : "bg-[#faf7f2] border-[#e5dbc7] text-neutral-700 hover:border-[#1b4431]"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Scent Profile */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  2. Scent Family Preference:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: "oud", label: "Oud & Spices" },
                    { id: "floral", label: "Rose & Florals" },
                    { id: "leather", label: "Leather & Wood" },
                    { id: "amber", label: "Golden Amber" },
                    { id: "fresh", label: "Aqua & Citrus" }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setProfile(item.id as typeof profile)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                        profile === item.id
                          ? "bg-[#1b4431] border-[#1b4431] text-white shadow-xs"
                          : "bg-[#faf7f2] border-[#e5dbc7] text-neutral-700 hover:border-[#1b4431]"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Dynamic Match Recommendation Card */}
            <div className="lg:col-span-5 bg-[#faf7f2] border border-[#e5dbc7] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between pb-4 border-b border-[#eee6d7]">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#b39b66]">
                  98% Compatibility Match
                </span>
                <span className="text-xs font-semibold text-neutral-500">{currentMatch.longevity}</span>
              </div>

              <div className="py-6 flex flex-col sm:flex-row items-center gap-5">
                <div className="relative size-28 rounded-2xl overflow-hidden bg-white border border-[#e5dbc7] shrink-0 shadow-xs">
                  <Image src={currentMatch.image} alt={currentMatch.name} fill className="object-cover" />
                </div>
                <div className="text-center sm:text-left space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    {currentMatch.family}
                  </span>
                  <h3 className="text-xl font-bold uppercase text-neutral-900 font-serif">
                    {currentMatch.name}
                  </h3>
                  <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                    {currentMatch.description}
                  </p>
                  <p className="text-sm font-bold text-[#1b4431] pt-1">
                    Rs. {currentMatch.price.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    addToCart({
                      id: currentMatch.id,
                      name: currentMatch.name,
                      description: currentMatch.description,
                      price: currentMatch.price,
                      image: currentMatch.image,
                      stock: 30,
                      category: "unisex",
                      variantLabel: "50ml Extrait"
                    })
                  }
                  className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xs transition active:scale-[0.98] ${
                    inCart
                      ? "bg-[#1b4431] text-white"
                      : "bg-[#1b4431] hover:bg-[#123023] text-white"
                  }`}
                >
                  {inCart ? (
                    <>
                      <Check size={16} />
                      <span>Added to Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={16} />
                      <span>Claim Your Match</span>
                    </>
                  )}
                </button>

                <Link
                  href={`/productDetail/${currentMatch.id}`}
                  className="w-full py-2 text-center text-xs font-semibold text-neutral-600 hover:text-black flex items-center justify-center gap-1"
                >
                  <span>View Full Olfactory Pyramid</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

