'use client';

import Image from "next/image";
import Link from "next/link";
import { Sparkles, ArrowUpRight, ShoppingBag, Check } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { useState } from "react";

type EditionItem = {
  id: number;
  name: string;
  edition: string;
  family: string;
  tagline: string;
  notes: string;
  price: number;
  image: string;
  stock: number;
  variants: { label: string; price: number; stock: number }[];
};

const EDITIONS: EditionItem[] = [
  {
    id: 1,
    name: "Safa Royale Oud",
    edition: "Edition I • Grand Reserve",
    family: "Oriental Oud",
    tagline: "Aged Cambodian agarwood layered with smoked incense and royal Taif rose petals.",
    notes: "Cambodian Oud • Taif Rose • Bourbon Vanilla • Smoked Saffron",
    price: 4500,
    image: "/images/featurev1.png",
    stock: 45,
    variants: [
      { label: "50ml Extrait", price: 4500, stock: 25 },
      { label: "100ml Extrait", price: 7800, stock: 20 }
    ]
  },
  {
    id: 2,
    name: "Safa Velvet Rose",
    edition: "Edition II • Floral Elixir",
    family: "Floral Bouquet",
    tagline: "Dew-kissed Grasse rose petals sparkling with pink peppercorn and white peach.",
    notes: "Grasse Rose • Pink Peppercorn • Cashmere Musk • Amber",
    price: 3900,
    image: "/images/featurev2.png",
    stock: 35,
    variants: [
      { label: "50ml Extrait", price: 3900, stock: 20 },
      { label: "100ml Extrait", price: 6800, stock: 15 }
    ]
  },
  {
    id: 3,
    name: "Safa Imperial Leather",
    edition: "Edition III • Executive Accords",
    family: "Citrus Leather",
    tagline: "Tuscan leather and smoked birch sharpened by fresh Calabrian bergamot.",
    notes: "Tuscan Leather • Calabrian Bergamot • Smoked Birch • Tonka",
    price: 4200,
    image: "/images/featurev3.png",
    stock: 50,
    variants: [
      { label: "50ml Extrait", price: 4200, stock: 30 },
      { label: "100ml Extrait", price: 7200, stock: 20 }
    ]
  }
];

export default function SignatureEditions() {
  const { addToCart, cart } = useCart();
  const [selectedVariants, setSelectedVariants] = useState<Record<number, string>>({
    1: "50ml Extrait",
    2: "50ml Extrait",
    3: "50ml Extrait"
  });

  return (
    <section id="reserve" className="w-full py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#e5dbc7] text-[#1b4431] text-xs font-bold tracking-[0.25em] uppercase shadow-xs">
          <Sparkles size={13} className="text-[#b39b66]" />
          <span>Haute Parfumerie Reserve</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-neutral-900 font-serif">
          The Signature Lines
        </h2>

        <p className="text-sm sm:text-base md:text-lg text-neutral-600 font-light leading-relaxed">
          Rare extrait masterpieces distilled from concentrated botanical and resinous oils, formulated for lasting distinction and unforgettable projection.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {EDITIONS.map((item) => {
          const currentVariantLabel = selectedVariants[item.id] || item.variants[0].label;
          const currentVariant = item.variants.find((v) => v.label === currentVariantLabel) || item.variants[0];
          const inCart = cart.some((c) => c.id === item.id && c.variantLabel === currentVariantLabel);

          return (
            <div
              key={item.id}
              className="group relative flex flex-col rounded-3xl border border-[#e8dfcf] bg-white p-6 shadow-xs hover:shadow-xl hover:border-[#1b4431] transition-all duration-500"
            >
              {/* Image Box */}
              <Link href={`/productDetail/${item.id}`} className="block relative aspect-square w-full rounded-2xl overflow-hidden bg-[#faf7f2] border border-[#f0e8d9]">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-106"
                />

                {/* Edition Badge */}
                <div className="absolute top-3.5 left-3.5 bg-[#1b4431]/90 backdrop-blur-md text-[#f2ece2] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-xs">
                  {item.edition}
                </div>

                {/* Arrow indicator */}
                <div className="absolute bottom-3.5 right-3.5 size-10 rounded-full bg-white/95 text-neutral-900 shadow-md flex items-center justify-center group-hover:bg-[#1b4431] group-hover:text-white transition-all duration-300">
                  <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </Link>

              {/* Details */}
              <div className="flex flex-col flex-1 pt-5 space-y-2.5">
                <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider text-[#b39b66]">
                  <span>{item.family}</span>
                  <span className="text-neutral-400">Extrait 35%</span>
                </div>

                <Link href={`/productDetail/${item.id}`}>
                  <h3 className="text-2xl font-bold uppercase tracking-tight text-neutral-900 font-serif group-hover:text-[#1b4431] transition">
                    {item.name}
                  </h3>
                </Link>

                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed line-clamp-2">
                  {item.tagline}
                </p>

                {/* Scent notes pill */}
                <div className="p-2.5 rounded-xl bg-[#faf7f2] border border-[#eee6d7] text-[11px] text-neutral-600">
                  <span className="font-bold text-neutral-900">Key Accords: </span>
                  <span>{item.notes}</span>
                </div>

                {/* Size Variant Toggle */}
                <div className="pt-2 flex items-center justify-between gap-2">
                  <div className="flex gap-1.5">
                    {item.variants.map((v) => (
                      <button
                        key={v.label}
                        type="button"
                        onClick={() => setSelectedVariants({ ...selectedVariants, [item.id]: v.label })}
                        className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition ${
                          currentVariantLabel === v.label
                            ? "bg-[#1b4431] text-white"
                            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                        }`}
                      >
                        {v.label.split(" ")[0]}
                      </button>
                    ))}
                  </div>

                  <p className="text-lg font-bold text-[#1b4431]">
                    Rs. {currentVariant.price.toLocaleString()}
                  </p>
                </div>

                {/* Action button */}
                <div className="pt-3 mt-auto">
                  <button
                    onClick={() =>
                      addToCart({
                        id: item.id,
                        name: item.name,
                        description: item.tagline,
                        price: currentVariant.price,
                        image: item.image,
                        stock: currentVariant.stock,
                        category: "unisex",
                        variantLabel: currentVariant.label
                      })
                    }
                    className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition shadow-xs active:scale-[0.98] ${
                      inCart
                        ? "bg-[#1b4431] text-white hover:bg-[#123023]"
                        : "border-2 border-[#1b4431] text-[#1b4431] hover:bg-[#1b4431] hover:text-white"
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
                        <span>Add To Bag</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

