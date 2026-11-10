'use client';

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, Sparkles, ShieldCheck, Clock, Award } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#f5efe3] via-[#faf7f2] to-[#faf7f2] border-b border-[#eee6d7]">
      {/* Subtle luxury ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full bg-[#b39b66]/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-20 size-80 rounded-full bg-[#1b4431]/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Text Content */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-[#e5dbc7] text-[#1b4431] text-xs font-bold tracking-[0.25em] uppercase shadow-xs backdrop-blur-xs">
              <Sparkles size={13} className="text-[#b39b66]" />
              <span>Haute Parfumerie • Pure Extrait de Parfum</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-neutral-900 leading-[1.05] font-serif">
              Command The Room <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1b4431] via-[#2a6348] to-[#b39b66]">
                Without A Word.
              </span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-neutral-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
              Masterfully formulated with up to 38% concentrated perfume oils. Sourced from Grasse, Taif, and Cambodia to leave an intoxicating, 14+ hour trail wherever you venture.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2.5 rounded-full bg-[#1b4431] px-8 py-4 text-xs sm:text-sm font-bold tracking-widest uppercase text-[#f2ece2] hover:bg-[#123023] transition shadow-lg active:scale-[0.98]"
              >
                <span>Explore The Editions</span>
                <span className="text-[#d8c38c]">→</span>
              </Link>

              <a
                href="#reserve"
                className="inline-flex items-center gap-2 rounded-full border border-[#d8cbb5] bg-white/80 px-7 py-4 text-xs sm:text-sm font-bold tracking-widest uppercase text-neutral-800 hover:border-[#1b4431] hover:bg-white transition shadow-xs"
              >
                <span>Private Reserve</span>
                <ArrowDown size={14} className="text-neutral-500" />
              </a>
            </div>

            {/* Accreditation Badges */}
            <div className="pt-8 border-t border-[#eee6d7] flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-neutral-600 font-medium">
              <span className="flex items-center gap-1.5">
                <Award size={15} className="text-[#b39b66]" />
                <span>35% Pure Oil Concentration</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={15} className="text-[#b39b66]" />
                <span>14+ Hour Sillage Guarantee</span>
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-[#b39b66]" />
                <span>Express Insured Nationwide Delivery</span>
              </span>
            </div>
          </div>

          {/* Luxury Visual Spotlight */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative size-80 sm:size-96 lg:size-[440px] flex items-center justify-center">
              {/* Outer decorative rings */}
              <div className="absolute inset-0 rounded-full border border-[#e5dbc7]/70 animate-pulse" />
              <div className="absolute inset-4 rounded-full border border-[#d8cbb5]/40" />

              {/* Main Image Card */}
              <div className="relative size-72 sm:size-84 lg:size-96 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-[#faf7f2] group">
                <Image
                  src="/images/icon2.png"
                  alt="Safa Fragrance Signature Extrait"
                  fill
                  priority
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                />
              </div>

              {/* Floating Luxury Badges */}
              <div className="absolute -bottom-2 -left-2 sm:bottom-4 sm:left-2 bg-white/95 backdrop-blur-md border border-[#e7decb] rounded-2xl p-3.5 shadow-xl flex items-center gap-3">
                <div className="size-10 rounded-xl bg-[#1b4431] text-[#d8c38c] flex items-center justify-center font-bold text-xs">
                  35%
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Concentration</p>
                  <p className="text-xs font-bold text-neutral-900">Extrait de Parfum</p>
                </div>
              </div>

              <div className="absolute top-2 -right-2 sm:top-6 sm:right-2 bg-white/95 backdrop-blur-md border border-[#e7decb] rounded-2xl p-3 shadow-xl flex items-center gap-2.5">
                <Sparkles size={16} className="text-[#b39b66]" />
                <span className="text-xs font-bold text-neutral-800">Rare Natural Accords</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

