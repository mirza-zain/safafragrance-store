'use client';

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full bg-[#0e281d] text-white mt-auto border-t border-[#1b4431]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16 items-start">
          {/* Brand Info */}
          <div className="text-center md:text-left flex flex-col items-center md:items-start">
            <Link href="/" className="relative block h-20 w-56 sm:h-24 sm:w-64" aria-label="Safa Fragrance Home">
              <Image
                src="/logo-gold.png"
                alt="Safa Fragrance"
                fill
                sizes="(max-width: 640px) 224px, 256px"
                className="object-contain object-center md:object-left"
                priority
              />
            </Link>
            <p className="text-[#d8c38c]/90 mt-4 text-sm sm:text-base max-w-sm font-normal leading-relaxed">
              Concentrated fragrances composed with warmth, depth, and a sense of quiet distinction.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#d8c38c] mb-4 font-sans">
              Quick Links
            </h3>
            <ul className="flex flex-col space-y-2.5">
              <li>
                <Link href="/" className="text-neutral-300 hover:text-[#d8c38c] transition text-sm font-normal">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/product" className="text-neutral-300 hover:text-[#d8c38c] transition text-sm font-normal">
                  Fragrances
                </Link>
              </li>
              <li>
                <Link href="/track" className="text-neutral-300 hover:text-[#d8c38c] transition text-sm font-normal">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-neutral-300 hover:text-[#d8c38c] transition text-sm font-normal">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="text-center md:text-left flex flex-col items-center md:items-start">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#d8c38c] mb-4 font-sans">
              Contact
            </h3>
            <p className="text-sm text-neutral-300 font-normal">Karachi, Pakistan</p>
            <a
              href="tel:+923453124310"
              className="text-sm text-[#d8c38c] hover:underline mt-1 font-medium tracking-wide transition"
            >
              +92 345 3124310
            </a>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="border-t border-[#1b4431] mt-12 pt-8 text-center text-xs sm:text-sm text-neutral-400 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© 2026 Safa Fragrance. All rights reserved.</p>
          <p className="font-light">Concentrated extrait de parfum • Made to be remembered.</p>
        </div>
      </div>
    </footer>
  );
}
