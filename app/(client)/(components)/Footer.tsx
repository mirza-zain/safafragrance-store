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
                className="object-contain object-center md:object-left"
                priority
              />
            </Link>
            <p className="text-[#d8c38c]/90 mt-4 text-sm sm:text-base max-w-sm font-normal leading-relaxed">
              Crafting premium, long-lasting fragrances engineered for elegance, projection, and timeless distinction.
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

          {/* Contact & Socials */}
          <div className="text-center md:text-left flex flex-col items-center md:items-start">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#d8c38c] mb-4 font-sans">
              Contact
            </h3>
            <p className="text-sm text-neutral-300 font-normal">Karachi, Pakistan</p>
            <p className="text-sm text-[#d8c38c]/90 mt-1 font-normal">concierge@safafragrance.com</p>
            <p className="text-xs text-neutral-300 mt-1 font-normal">Available Mon–Sat: 10:00 AM – 8:00 PM</p>

            <ul className="flex items-center gap-5 mt-6">
              <li>
                <a
                  href="https://www.instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="text-neutral-300 hover:text-[#d8c38c] transition hover:scale-110 block"
                >
                  <svg className="size-6 sm:size-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.79-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              </li>
              <li>
                <a
                  href="https://www.tiktok.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="TikTok"
                  className="text-neutral-300 hover:text-[#d8c38c] transition hover:scale-110 block"
                >
                  <svg className="size-6 sm:size-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.48 6.27 6.27 0 0 0 1.96-4.52V8.97a8.27 8.27 0 0 0 4.81 1.54V7.07c-.33 0-.67-.12-1-.38z" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="border-t border-[#1b4431] mt-12 pt-8 text-center text-xs sm:text-sm text-neutral-400 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© 2026 Safa Fragrance. All rights reserved.</p>
          <p className="font-light">Haute Parfumerie • Designed for elegance & quality.</p>
        </div>
      </div>
    </footer>
  );
}
