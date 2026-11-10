'use client';

import { use, useEffect, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ShoppingBag,
  ShieldCheck,
  Truck,
  Sparkles,
  Droplets,
  Clock,
  Wind,
  Calendar,
  Layers
} from "lucide-react";
import { useCart } from "@/app/context/CartContext";

type ProductVariant = {
  label: string;
  price: number;
  stock: number;
};

type FragranceNotesObj = {
  top?: string[];
  heart?: string[];
  base?: string[];
};

type Product = {
  id: number;
  name: string;
  tagline?: string;
  image: string | null;
  description: string;
  category: string;
  olfactoryFamily?: string;
  price: number;
  stock: number;
  concentration?: string;
  sillage?: string;
  longevity?: string;
  season?: string;
  notes?: string | FragranceNotesObj;
  variants: ProductVariant[];
};

type Props = {
  params: Promise<{ id: string }>;
};

function ProductDetailContent({ params }: Props) {
  const unwrappedParams = use(params);
  const routeParams = useParams();
  const id = unwrappedParams?.id || (routeParams?.id as string) || "";

  const [prodDetail, setProdDetail] = useState<Product | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const { addToCart, cart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    const getProd = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(`/api/productDetail/${encodeURIComponent(id)}`);
        if (!response.ok) {
          throw new Error("Fragrance not found");
        }
        const data = await response.json();
        const product: Product = Array.isArray(data) ? data[0] : data;

        if (isMounted) {
          setProdDetail(product);
          setSelectedVariant(product.variants?.[0] ?? null);
        }
      } catch (err) {
        if (isMounted) {
          setError((err as Error).message || "Could not load fragrance");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getProd();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="w-full min-h-[70vh] flex items-center justify-center py-20 px-4">
        <div className="animate-pulse flex flex-col items-center gap-4 text-center">
          <div className="size-16 rounded-full bg-neutral-200" />
          <div className="h-6 w-48 rounded bg-neutral-200" />
          <div className="h-4 w-32 rounded bg-neutral-200" />
          <p className="text-xs text-neutral-400 font-medium mt-2">Loading artisanal fragrance details...</p>
        </div>
      </main>
    );
  }

  if (error || !prodDetail) {
    return (
      <main className="w-full min-h-[70vh] flex flex-col items-center justify-center py-20 px-4 text-center">
        <p className="text-xl font-bold text-neutral-800 font-sans">Fragrance Not Found</p>
        <p className="text-sm text-neutral-600 mt-2 font-normal max-w-md">
          {error || "The scent edition you requested could not be loaded from our olfactory reserve."}
        </p>
        <Link
          href="/product"
          className="mt-6 px-6 py-3 bg-[#1b4431] text-white text-xs uppercase font-semibold tracking-wider rounded-lg hover:bg-[#0e281d] transition"
        >
          Return to Fragrances Catalog
        </Link>
      </main>
    );
  }

  const activePrice = selectedVariant?.price ?? Number(prodDetail.price);
  const activeStock = selectedVariant?.stock ?? Number(prodDetail.stock);
  const selectedQuantity =
    cart.find(
      (item) => item.id === prodDetail.id && item.variantLabel === selectedVariant?.label
    )?.quantity ?? 0;

  return (
    <section className="w-full min-h-[80vh] flex items-center justify-center py-10 sm:py-16 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto">
      <div className="w-full">
        {/* Back navigation */}
        <div className="mb-8">
          <Link
            href="/product"
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-neutral-600 hover:text-[#1b4431] uppercase tracking-wider font-semibold transition"
          >
            <ArrowLeft className="size-4" /> Back to Catalog
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-10 lg:gap-16">
          {/* Product Image */}
          <div className="w-full lg:w-1/2 flex justify-center items-center sticky top-24">
            <div className="w-full max-w-xs sm:max-w-md lg:max-w-lg aspect-square relative rounded-3xl overflow-hidden shadow-lg border-2 border-[#e7decb] bg-[#faf7f2]">
              <Image
                src={prodDetail.image || "/images/icon2.png"}
                alt={prodDetail.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 500px"
                priority
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="w-full lg:w-1/2 flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="flex items-center gap-2 flex-wrap justify-center lg:justify-start">
              <span className="text-xs uppercase tracking-widest text-[#b39b66] font-semibold">
                Safa Fragrance ©
              </span>
              {prodDetail.category && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#1b4431]/10 text-[#1b4431] border border-[#1b4431]/20">
                  {prodDetail.category}
                </span>
              )}
              {prodDetail.olfactoryFamily && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#faf7f2] text-neutral-700 border border-[#e7decb]">
                  {prodDetail.olfactoryFamily}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-wider mt-3 text-[#0e281d] leading-tight font-[Gebuk]">
              {prodDetail.name}
            </h1>

            {prodDetail.tagline && (
              <p className="mt-2 text-sm text-[#b39b66] font-medium italic">
                &ldquo;{prodDetail.tagline}&rdquo;
              </p>
            )}

            <p className="mt-4 text-sm sm:text-base text-neutral-700 leading-relaxed max-w-xl text-center lg:text-left font-normal">
              {prodDetail.description}
            </p>

            {/* Luxury Specifications Badges */}
            <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-semibold justify-center lg:justify-start">
              {prodDetail.concentration && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#e7decb] text-[#1b4431]">
                  <Droplets className="size-3 text-[#b39b66]" /> {prodDetail.concentration}
                </span>
              )}
              {prodDetail.longevity && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#e7decb] text-[#1b4431]">
                  <Clock className="size-3 text-[#b39b66]" /> Longevity: {prodDetail.longevity}
                </span>
              )}
              {prodDetail.sillage && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#e7decb] text-[#1b4431]">
                  <Wind className="size-3 text-[#b39b66]" /> Sillage: {prodDetail.sillage}
                </span>
              )}
              {prodDetail.season && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#e7decb] text-[#1b4431]">
                  <Calendar className="size-3 text-[#b39b66]" /> {prodDetail.season}
                </span>
              )}
            </div>

            {/* Price Display */}
            <p className="mt-6 text-2xl sm:text-3xl font-bold text-[#1b4431]">
              Rs. {activePrice.toLocaleString()}
            </p>

            {/* Variant Selector */}
            {prodDetail.variants && prodDetail.variants.length > 0 && (
              <div className="mt-6 w-full max-w-md">
                <p className="mb-2 text-xs uppercase font-bold tracking-wider text-[#1b4431] flex items-center gap-1.5">
                  <Layers className="size-3.5" />
                  <span>Choose Flacon Edition</span>
                </p>
                <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                  {prodDetail.variants.map((variant) => (
                    <button
                      key={variant.label}
                      type="button"
                      onClick={() => setSelectedVariant(variant)}
                      className={`rounded-xl border px-4 py-2.5 text-xs sm:text-sm font-semibold uppercase tracking-wider transition active:scale-95 ${
                        selectedVariant?.label === variant.label
                          ? "border-[#1b4431] bg-[#1b4431] text-white shadow-xs"
                          : "border-[#e7decb] bg-white text-neutral-700 hover:border-[#1b4431]"
                      }`}
                    >
                      {variant.label} — Rs. {Number(variant.price).toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="w-full max-w-md flex flex-col sm:flex-row items-center gap-4 mt-8">
              <button
                disabled={activeStock <= 0}
                onClick={() =>
                  addToCart({
                    id: prodDetail.id,
                    name: prodDetail.name,
                    description: prodDetail.description,
                    category: prodDetail.category,
                    image: prodDetail.image || "/images/icon2.png",
                    price: activePrice,
                    stock: activeStock,
                    variantLabel: selectedVariant?.label,
                  })
                }
                aria-label={
                  selectedQuantity > 0
                    ? `${selectedQuantity} selected, add another ${prodDetail.name}`
                    : `Add ${prodDetail.name} to cart`
                }
                className={`w-full py-4 px-6 text-sm sm:text-base font-semibold uppercase tracking-wider rounded-xl border-2 transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4431] disabled:cursor-not-allowed disabled:opacity-50 ${
                  selectedQuantity > 0
                    ? "border-[#1b4431] bg-[#1b4431] text-white hover:bg-[#0e281d]"
                    : "border-[#1b4431] bg-transparent text-[#1b4431] hover:bg-[#1b4431] hover:text-white"
                }`}
              >
                <ShoppingBag className="size-5" />
                {activeStock > 0
                  ? selectedQuantity > 0
                    ? `Added to Bag (${selectedQuantity})`
                    : "Add to Bag"
                  : "Out of Stock"}
              </button>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 pt-6 border-t border-[#e7decb] flex flex-wrap gap-5 text-xs text-neutral-600 font-medium justify-center lg:justify-start">
              <span className="flex items-center gap-1.5">
                <Truck className="size-4 text-[#1b4431]" /> Express Delivery Across Pakistan
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-[#1b4431]" /> 100% Authentic Extrait
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ProductDetailPage({ params }: Props) {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-[70vh] flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <div className="size-10 rounded-full bg-neutral-200" />
            <div className="h-4 w-32 rounded bg-neutral-200" />
          </div>
        </div>
      }
    >
      <ProductDetailContent params={params} />
    </Suspense>
  );
}
