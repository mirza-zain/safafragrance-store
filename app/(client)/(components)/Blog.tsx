'use client';

import Image from "next/image";

export default function Blog() {
  return (
    <section className="w-full py-20 sm:py-28 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-12 lg:gap-20">
      <div className="w-full lg:w-1/2 space-y-5">
        <p className="text-xs uppercase tracking-[0.3em] font-semibold text-[#b39b66]">
          The Safa Approach
        </p>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-wider text-[#0e281d] font-[Galsod] leading-tight">
          Fragrance with presence
        </h2>

        <p className="text-sm sm:text-base font-normal leading-relaxed text-neutral-700 max-w-xl">
          Safa Fragrance creates concentrated extrait de parfum for people who want their scent to feel considered, personal, and quietly memorable. Each composition is built around a balance of luminous opening notes, rich woods, and warm resins—made to wear beautifully from the first spray through the final dry-down.
        </p>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center">
        <div className="relative w-full max-h-[460px] lg:max-h-[520px] aspect-4/3 overflow-hidden rounded-3xl shadow-lg border border-[#e7decb] bg-[#faf7f2] flex items-center justify-center p-6">
          <Image
            src="/images/safaPerfume.png"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain"
            alt="Safa Fragrance bottle and presentation box surrounded by soft florals"
          />
        </div>
      </div>
    </section>
  );
}
