import Hero from "./(components)/Hero";
import SignatureEditions from "./(components)/SignatureEditions";
import ScentFinder from "./(components)/ScentFinder";
import FeaturedCollection from "./(components)/FeaturedCollection";
import BrandStory from "./(components)/BrandStory";
import CustomerReviews from "./(components)/CustomerReviews";
import FragranceFAQ from "./(components)/FragranceFAQ";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <>
      <Hero />
      <SignatureEditions />
      <ScentFinder />

      {/* Luxury Promo Strip Banner */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-10 max-w-7xl mx-auto">
        <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-r from-[#1b4431] via-[#123023] to-[#0f271c] text-[#f2ece2] p-8 sm:p-12 shadow-xl border border-[#2a6348] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs uppercase font-bold tracking-widest text-[#d8c38c]">
              <Sparkles size={14} />
              <span>Complimentary Gift Decant</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black uppercase font-serif tracking-tight">
              Order Any 100ml Edition, Receive 2 Discovery Samples
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 font-light max-w-xl">
              Experience the full olfactory spectrum. Every full-size purchase includes two complimentary 5ml luxury glass atomizers.
            </p>
          </div>

          <Link
            href="/shop"
            className="px-8 py-4 rounded-full bg-[#b39b66] hover:bg-[#d8c38c] text-[#0f271c] font-bold text-xs uppercase tracking-widest transition shadow-md whitespace-nowrap active:scale-[0.98]"
          >
            Claim Privilege →
          </Link>
        </div>
      </section>

      <FeaturedCollection />
      <BrandStory />
      <CustomerReviews />
      <FragranceFAQ />
    </>
  );
}
