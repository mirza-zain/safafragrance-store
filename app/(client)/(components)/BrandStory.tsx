import Image from "next/image";
import Link from "next/link";
import { Sparkles, Award, ShieldCheck, HeartHandshake } from "lucide-react";
import { InstagramIcon } from "./InstagramIcon";

export default function BrandStory() {
  return (
    <section id="story" className="w-full py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#eee6d7]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Column: Story */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#e5dbc7] text-[#1b4431] text-xs font-bold tracking-[0.25em] uppercase shadow-xs">
            <Sparkles size={13} className="text-[#b39b66]" />
            <span>The Safa Heritage</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-neutral-900 leading-tight font-serif">
            Artisanal Perfumery <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1b4431] to-[#b39b66]">
              Without Compromise.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-light text-justify">
            At Safa Fragrance, we believe scent is not an afterthought — it is an invisible armor of distinction. Every formulation is meticulously crafted with high-density perfume oils, rare aged agarwood, Damascena rose petals, and precious resins.
          </p>

          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-light text-justify">
            Unlike commercial sprays diluted with excessive alcohol, our Extrait de Parfum editions hold up to 38% concentration. Subtle and refined up close, commanding from afar, and impossible to forget once you depart.
          </p>

          {/* Core Metrics */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#eee6d7]">
            <div>
              <p className="text-2xl sm:text-3xl font-black text-[#1b4431] font-serif">35%+</p>
              <p className="text-xs text-neutral-500 font-medium">Extrait Oil Density</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-[#1b4431] font-serif">14h+</p>
              <p className="text-xs text-neutral-500 font-medium">Projection Sillage</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-[#1b4431] font-serif">100%</p>
              <p className="text-xs text-neutral-500 font-medium">Artisanal Blended</p>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <Link
              href="/shop"
              className="px-6 py-3.5 rounded-full bg-[#1b4431] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#123023] transition shadow-md"
            >
              Discover The Blends
            </Link>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full border border-neutral-300 hover:border-black text-xs font-bold uppercase tracking-wider text-neutral-800 transition"
            >
              <InstagramIcon className="size-4" />
              <span>@safafragrance</span>
            </a>
          </div>
        </div>

        {/* Right Column: Visual */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="relative w-full max-w-lg aspect-4/5 rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-[#faf7f2]">
            <Image
              src="/images/aboutscent.png"
              alt="Safa Fragrance Artisanal Extraction"
              fill
              className="object-cover object-top"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-8 text-white">
              <span className="text-xs uppercase font-bold tracking-widest text-[#d8c38c]">Craftsmanship</span>
              <h3 className="text-2xl font-bold font-serif">Aged Resins & Botanical Concentrates</h3>
              <p className="text-xs text-neutral-200 mt-1 max-w-sm">
                Each batch undergoes an extended 60-day cold maceration process to mature accords into absolute harmony.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
