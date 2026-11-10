import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

type SignatureEdition = {
  id: string;
  name: string;
  edition: string;
  category: string;
  tagline: string;
  notes: string;
  image: string;
  alt: string;
};

const editions: SignatureEdition[] = [
  {
    id: "la-rose-divine",
    name: "LA ROSE DIVINE",
    edition: "Edition 01",
    category: "Opulent Floral Bouquet",
    tagline: "A luminous floral masterpiece inspired by rare Damascena and Grasse blooms.",
    notes: "Damascena Rose • Sambac Jasmine • Ylang-Ylang",
    image: "/images/featurev1.png",
    alt: "Safa Fragrance La Rose Divine",
  },
  {
    id: "executive",
    name: "EXECUTIVE",
    edition: "Edition 02",
    category: "Woody Aromatic & Amber",
    tagline: "A power-packed scent made to dominate the room and leave an indelible imprint.",
    notes: "Crisp Bergamot • Smoked Cedarwood • Rich Amber",
    image: "/images/featurev2.png",
    alt: "Safa Fragrance Executive Perfume",
  },
  {
    id: "sea-mist",
    name: "SEA MIST",
    edition: "Edition 03",
    category: "Fresh Aquatic & Floral",
    tagline: "A fresh, watery fragrance with oceanic air, rain-kissed petals, and subtle musk.",
    notes: "Cool Waters • Rain-Kissed Freesia • Sheer Musk",
    image: "/images/featurev3.png",
    alt: "Safa Fragrance Sea Mist Perfume",
  },
];

export default function SpecialItems() {
  return (
    <section className="w-full py-16 sm:py-24 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto">
      {/* Minimalist Editorial Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3 mb-12 sm:mb-16">
        <p className="text-xs uppercase tracking-[0.3em] font-semibold text-[#b39b66]">
          Private Reserve
        </p>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-wider text-[#0e281d] font-[Gebuk]">
          Signature Lines
        </h2>

        <p className="text-sm sm:text-base text-neutral-600 max-w-lg mx-auto font-light leading-relaxed">
          Olfactory masterpieces formulated with concentrated oils and rare accords, engineered for lasting distinction.
        </p>
      </div>

      {/* 3-Column Luxury Product Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {editions.map((item) => (
          <Link
            key={item.id}
            href="/product"
            className="group relative flex flex-col rounded-3xl border border-[#e7decb]/80 bg-white p-5 sm:p-6 shadow-xs hover:shadow-lg hover:border-[#1b4431] transition-all duration-300"
          >
            {/* Image Box */}
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#faf7f2] border border-[#eee6d7]">
              <Image
                src={item.image}
                alt={item.alt}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Minimalist Edition Badge */}
              <div className="absolute top-3.5 left-3.5 bg-[#0e281d]/85 backdrop-blur-md text-[#d8c38c] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm font-sans">
                {item.edition}
              </div>

              {/* Minimalist Arrow Pill on Hover */}
              <div className="absolute bottom-3.5 right-3.5 flex size-8 items-center justify-center rounded-full bg-white/95 text-[#1b4431] shadow-sm group-hover:scale-110 group-hover:bg-[#1b4431] group-hover:text-white transition-all duration-200">
                <ArrowUpRight className="size-4" />
              </div>
            </div>

            {/* Content Details */}
            <div className="flex flex-col flex-1 pt-5 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#b39b66]">
                {item.category}
              </span>

              <h3 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-neutral-900 group-hover:text-[#1b4431] transition font-sans">
                {item.name}
              </h3>

              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed line-clamp-2 font-normal">
                {item.tagline}
              </p>

              {/* Scent Accord Notes */}
              <div className="pt-4 mt-auto border-t border-[#eee6d7] flex items-center justify-between text-xs">
                <div className="text-[11px] text-neutral-500 font-light truncate pr-2">
                  <span className="font-semibold text-neutral-700">Notes: </span>
                  <span>{item.notes}</span>
                </div>

                <span className="text-xs font-semibold text-[#1b4431] uppercase tracking-wider whitespace-nowrap group-hover:underline decoration-1 underline-offset-4">
                  Shop
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
