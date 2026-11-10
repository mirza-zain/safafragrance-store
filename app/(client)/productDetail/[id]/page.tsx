'use client';

import { use, useEffect, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ShoppingBag,
  Sparkles,
  Star,
  ShieldCheck,
  Truck,
  Clock,
  Award,
  Check,
  Plus,
  Minus
} from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { Product, ProductVariant } from "@/app/lib/types";

type PageProps = {
  params: Promise<{ id: string }>;
};

function ProductDetailContent({ params }: PageProps) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const { addToCart } = useCart();

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const res = await fetch(`/api/productDetail/${id}`);
        if (!res.ok) throw new Error("Fragrance not found");
        const data: Product = await res.json();
        setProduct(data);
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="w-full min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 rounded-full border-2 border-[#1b4431] border-t-transparent animate-spin" />
          <p className="text-xs uppercase font-bold tracking-widest text-neutral-500">Unveiling Accords...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <h2 className="text-2xl font-bold font-serif text-neutral-900">Fragrance Not Found</h2>
        <p className="text-sm text-neutral-500 mt-2">The edition you are looking for may have been archived.</p>
        <Link
          href="/shop"
          className="mt-6 px-6 py-3 rounded-full bg-[#1b4431] text-white text-xs font-bold uppercase tracking-widest"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  const activePrice = selectedVariant ? selectedVariant.price : product.price;
  const activeStock = selectedVariant ? selectedVariant.stock : product.stock;

  const handleAddToCart = () => {
    addToCart(
      {
        id: product.id,
        name: product.name,
        description: product.tagline,
        price: activePrice,
        image: product.image,
        stock: activeStock,
        category: product.category,
        variantLabel: selectedVariant?.label
      },
      selectedVariant?.label,
      quantity
    );

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="w-full py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Breadcrumb Navigation */}
      <div className="mb-8">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-[#1b4431] transition"
        >
          <ArrowLeft size={14} />
          <span>Back to All Fragrances</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column: Visual Showcase */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="relative w-full max-w-md sm:max-w-lg aspect-square rounded-3xl overflow-hidden bg-white border border-[#e5dbc7] shadow-xl p-6 flex items-center justify-center">
            <div className="relative size-full rounded-2xl overflow-hidden bg-[#faf7f2]">
              <Image
                src={product.image}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>

            {/* Badges */}
            <div className="absolute top-8 left-8 bg-[#1b4431]/95 backdrop-blur-md text-[#d8c38c] text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-md">
              {product.concentration || "Extrait de Parfum"}
            </div>

            <div className="absolute bottom-8 right-8 bg-white/90 backdrop-blur-xs text-neutral-900 text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
              <Sparkles size={13} className="text-[#b39b66]" />
              <span>{product.olfactoryFamily}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Product Details & Purchase Controls */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-[0.25em] text-[#b39b66]">
                Safa Haute Parfumerie
              </span>
              <div className="flex items-center gap-1 text-xs font-semibold text-neutral-600">
                <Star size={14} className="text-amber-500 fill-amber-500" />
                <span>{product.rating || 5.0}</span>
                <span className="text-neutral-400">({product.reviewCount || 34} reviews)</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-neutral-900 font-serif">
              {product.name}
            </h1>

            <p className="text-sm sm:text-base text-neutral-600 font-light leading-relaxed">
              {product.tagline}
            </p>
          </div>

          {/* Price & Stock Display */}
          <div className="py-4 border-y border-[#eee6d7] flex items-center justify-between">
            <div>
              <p className="text-3xl font-black text-[#1b4431] font-serif">
                Rs. {activePrice.toLocaleString()}
              </p>
              <p className="text-xs text-neutral-500">Taxes included • Free delivery over Rs. 6,000</p>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <span className="size-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>{activeStock > 0 ? "In Stock • Dispatch in 24h" : "Sold Out"}</span>
              </span>
            </div>
          </div>

          {/* Size / Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                Select Edition Size:
              </label>
              <div className="grid grid-cols-2 gap-3">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.label === v.label;
                  return (
                    <button
                      key={v.label}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                        isSelected
                          ? "border-[#1b4431] bg-[#faf7f2] shadow-xs"
                          : "border-[#e5dbc7] bg-white hover:border-[#1b4431]"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-neutral-900">{v.label}</span>
                        {isSelected && <Check size={16} className="text-[#1b4431]" />}
                      </div>
                      <span className="text-sm font-semibold text-[#1b4431] mt-1">
                        Rs. {v.price.toLocaleString()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity & Add to Cart Controls */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              {/* Stepper */}
              <div className="flex items-center border border-[#d8cbb5] rounded-xl bg-white overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-3 text-neutral-600 hover:bg-[#faf7f2] transition"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="px-4 text-sm font-bold text-neutral-900 min-w-8 text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(activeStock, q + 1))}
                  className="p-3 text-neutral-600 hover:bg-[#faf7f2] transition"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Add to Bag Button */}
              <button
                type="button"
                disabled={activeStock <= 0}
                onClick={handleAddToCart}
                className={`flex-1 py-4 px-8 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.98] ${
                  added
                    ? "bg-emerald-700 text-white"
                    : "bg-[#1b4431] hover:bg-[#123023] text-white"
                }`}
              >
                {added ? (
                  <>
                    <Check size={18} />
                    <span>Added To Fragrance Bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} />
                    <span>Add To Fragrance Bag • Rs. {(activePrice * quantity).toLocaleString()}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Guarantees */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#eee6d7] text-xs text-neutral-600">
            <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-[#e5dbc7]">
              <Truck size={16} className="text-[#1b4431] shrink-0" />
              <span>Complimentary Express Shipping over Rs. 6,000</span>
            </div>
            <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-[#e5dbc7]">
              <ShieldCheck size={16} className="text-[#1b4431] shrink-0" />
              <span>100% Extrait de Parfum Authenticity Sealed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Olfactory Scent Pyramid Breakdown */}
      <section className="mt-20 pt-16 border-t border-[#eee6d7]">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#b39b66]">Olfactory Architecture</p>
          <h2 className="text-3xl font-black uppercase tracking-tight text-neutral-900 font-serif">
            The Scent Pyramid
          </h2>
          <p className="text-sm text-neutral-600 font-light">
            Formulated to evolve over 14 hours as body warmth releases deeper layers of rare concentrates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Top Notes */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e5dbc7] shadow-xs space-y-4">
            <div className="size-10 rounded-2xl bg-[#faf7f2] border border-[#e5dbc7] flex items-center justify-center text-[#b39b66] font-bold text-xs">
              01
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#b39b66]">
                First 30 Minutes
              </span>
              <h3 className="text-xl font-bold uppercase text-neutral-900 font-serif">Top Notes</h3>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              The opening greeting. Vibrant, luminous accords engineered to make an instant impression.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {product.notes?.top.map((note) => (
                <span
                  key={note}
                  className="px-3 py-1 rounded-lg bg-[#faf7f2] border border-[#eee6d7] text-xs font-semibold text-neutral-800"
                >
                  {note}
                </span>
              ))}
            </div>
          </div>

          {/* Heart Notes */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#1b4431] shadow-md space-y-4 relative">
            <div className="absolute top-4 right-4 bg-[#1b4431] text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
              Heart Core
            </div>
            <div className="size-10 rounded-2xl bg-[#1b4431] text-[#d8c38c] flex items-center justify-center font-bold text-xs">
              02
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#b39b66]">
                Hours 1 to 6
              </span>
              <h3 className="text-xl font-bold uppercase text-neutral-900 font-serif">Heart Notes</h3>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              The soul of the fragrance. Rich floral, spice, and aromatic absolutes providing character.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {product.notes?.heart.map((note) => (
                <span
                  key={note}
                  className="px-3 py-1 rounded-lg bg-[#faf7f2] border border-[#eee6d7] text-xs font-semibold text-neutral-800"
                >
                  {note}
                </span>
              ))}
            </div>
          </div>

          {/* Base Notes */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e5dbc7] shadow-xs space-y-4">
            <div className="size-10 rounded-2xl bg-[#faf7f2] border border-[#e5dbc7] flex items-center justify-center text-[#b39b66] font-bold text-xs">
              03
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#b39b66]">
                Hours 6 to 16+
              </span>
              <h3 className="text-xl font-bold uppercase text-neutral-900 font-serif">Base Notes</h3>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              The lingering signature. Heavy resins, aged agarwood, and amber that anchor to skin and clothing.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {product.notes?.base.map((note) => (
                <span
                  key={note}
                  className="px-3 py-1 rounded-lg bg-[#faf7f2] border border-[#eee6d7] text-xs font-semibold text-neutral-800"
                >
                  {note}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sillage & Technical Specs */}
      <section className="mt-16 bg-[#faf7f2] rounded-3xl border border-[#e5dbc7] p-8 sm:p-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <Award className="size-6 text-[#b39b66] mx-auto" />
            <p className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Concentration</p>
            <p className="text-sm font-bold text-neutral-900">{product.concentration}</p>
          </div>
          <div className="space-y-1">
            <Clock className="size-6 text-[#b39b66] mx-auto" />
            <p className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Longevity</p>
            <p className="text-sm font-bold text-neutral-900">{product.longevity}</p>
          </div>
          <div className="space-y-1">
            <Sparkles className="size-6 text-[#b39b66] mx-auto" />
            <p className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Sillage</p>
            <p className="text-sm font-bold text-neutral-900">{product.sillage}</p>
          </div>
          <div className="space-y-1">
            <ShieldCheck className="size-6 text-[#b39b66] mx-auto" />
            <p className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Suitability</p>
            <p className="text-sm font-bold text-neutral-900">{product.season}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ProductDetailPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-[70vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="size-10 rounded-full border-2 border-[#1b4431] border-t-transparent animate-spin" />
            <p className="text-xs uppercase font-bold tracking-widest text-neutral-500">
              Unveiling Accords...
            </p>
          </div>
        </div>
      }
    >
      <ProductDetailContent params={params} />
    </Suspense>
  );
}
