'use client';

import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, MapPin, Sparkles, ShieldCheck, Clock, Award } from "lucide-react";
import { InstagramIcon } from "./InstagramIcon";

export default function Footer() {
  return (
    <footer className="w-full bg-[#0d2218] text-[#f2ece2] mt-auto border-t border-[#1b4431]">
      {/* Top Value Badges Bar */}
      <div className="border-b border-[#1b4431]/80 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <Award className="size-6 text-[#d8c38c]" />
            <h4 className="text-xs uppercase font-bold tracking-widest text-[#d8c38c]">Extrait Concentration</h4>
            <p className="text-[11px] text-neutral-400">30%–38% pure perfume oil density</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Clock className="size-6 text-[#d8c38c]" />
            <h4 className="text-xs uppercase font-bold tracking-widest text-[#d8c38c]">14+ Hour Longevity</h4>
            <p className="text-[11px] text-neutral-400">Engineered projection & sillage</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ShieldCheck className="size-6 text-[#d8c38c]" />
            <h4 className="text-xs uppercase font-bold tracking-widest text-[#d8c38c]">Artisanal Blends</h4>
            <p className="text-[11px] text-neutral-400">Rare agarwood, Taif rose, amber</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Sparkles className="size-6 text-[#d8c38c]" />
            <h4 className="text-xs uppercase font-bold tracking-widest text-[#d8c38c]">Nationwide Delivery</h4>
            <p className="text-[11px] text-neutral-400">Complimentary on orders over Rs. 6,000</p>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16">
          {/* Brand Presentation */}
          <div className="md:col-span-4 flex flex-col items-start space-y-4">
            <Link href="/" className="inline-block bg-white/95 rounded-2xl p-2.5 shadow-md">
              <div className="relative h-12 w-44">
                <Image src="/logo.png" alt="Safa Fragrance" fill className="object-contain" />
              </div>
            </Link>
            <p className="text-sm text-neutral-300 leading-relaxed max-w-sm pt-2">
              Safa Fragrance defines modern haute perfumery. Handcrafted extrait formulations that command the room with timeless elegance, depth, and unforgettable olfactory signatures.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noreferrer"
                className="size-10 rounded-full bg-[#1b4431] hover:bg-[#b39b66] text-[#f2ece2] hover:text-[#0d2218] transition flex items-center justify-center shadow-xs"
                aria-label="Instagram"
              >
                <InstagramIcon className="size-4" />
              </a>
              <a
                href="mailto:concierge@safafragrance.com"
                className="size-10 rounded-full bg-[#1b4431] hover:bg-[#b39b66] text-[#f2ece2] hover:text-[#0d2218] transition flex items-center justify-center shadow-xs"
                aria-label="Email Concierge"
              >
                <Mail size={18} />
              </a>
              <a
                href="tel:+923001234567"
                className="size-10 rounded-full bg-[#1b4431] hover:bg-[#b39b66] text-[#f2ece2] hover:text-[#0d2218] transition flex items-center justify-center shadow-xs"
                aria-label="Call Concierge"
              >
                <Phone size={18} />
              </a>
            </div>
          </div>

          {/* Olfactory Collections */}
          <div className="md:col-span-2 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-[#d8c38c]">Editions</h3>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li>
                <Link href="/shop" className="hover:text-[#d8c38c] transition">All Fragrances</Link>
              </li>
              <li>
                <Link href="/shop?family=Oriental+Oud" className="hover:text-[#d8c38c] transition">Oriental Oud</Link>
              </li>
              <li>
                <Link href="/shop?family=Floral+Bouquet" className="hover:text-[#d8c38c] transition">Floral Bouquet</Link>
              </li>
              <li>
                <Link href="/shop?family=Citrus+Leather" className="hover:text-[#d8c38c] transition">Citrus Leather</Link>
              </li>
              <li>
                <Link href="/shop?family=Woody+Amber" className="hover:text-[#d8c38c] transition">Woody Amber</Link>
              </li>
            </ul>
          </div>

          {/* Client Concierge */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-[#d8c38c]">Client Care</h3>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li>
                <Link href="/track" className="hover:text-[#d8c38c] transition">Track Your Parcel</Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-[#d8c38c] transition">Your Shopping Bag</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#d8c38c] transition">Order Assistance & Returns</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#d8c38c] transition">Bank Transfer Verification</Link>
              </li>
              <li>
                <Link href="/admin" className="text-xs text-[#b39b66]/80 hover:text-[#d8c38c] transition">Admin Portal</Link>
              </li>
            </ul>
          </div>

          {/* Showroom & Newsletter */}
          <div className="md:col-span-3 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-[#d8c38c]">Karachi Showroom</h3>
            <div className="space-y-2 text-sm text-neutral-300">
              <p className="flex items-start gap-2">
                <MapPin size={16} className="text-[#d8c38c] shrink-0 mt-0.5" />
                <span>Phase 6, DHA, Karachi, Sindh, Pakistan</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone size={16} className="text-[#d8c38c] shrink-0" />
                <span>+92 300 1234567</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail size={16} className="text-[#d8c38c] shrink-0" />
                <span>concierge@safafragrance.com</span>
              </p>
            </div>

            <div className="pt-2">
              <p className="text-xs text-neutral-400 mb-2">Subscribe for Private Reserve drops:</p>
              <form onSubmit={(e) => { e.preventDefault(); alert("Welcome to the Safa Fragrance VIP Circle!"); }} className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="bg-[#1b4431]/60 border border-[#255840] text-xs px-3 py-2 rounded-lg text-white placeholder-neutral-400 focus:outline-hidden focus:border-[#d8c38c] flex-1"
                />
                <button
                  type="submit"
                  className="bg-[#b39b66] hover:bg-[#d8c38c] text-[#0d2218] px-3.5 py-2 text-xs font-bold rounded-lg uppercase tracking-wider transition"
                >
                  Join
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#1b4431] mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-neutral-400">
          <p>© 2026 Safa Fragrance. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Cash on Delivery (Karachi)</span>
            <span>•</span>
            <span>Direct Bank Transfer Nationwide</span>
            <span>•</span>
            <span>100% Quality Assurance</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
