'use client';

import Image from "next/image";
import Link from "next/link";

export default function Blog() {
  return (
    <section className="w-full py-20 sm:py-28 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-12 lg:gap-20">
      <div className="w-full lg:w-1/2 space-y-5">
        <p className="text-xs uppercase tracking-[0.3em] font-semibold text-[#b39b66]">
          The Safa Standard
        </p>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-wider text-[#0e281d] font-[Gebuk] leading-tight">
          Premium Fragrance Without Compromise
        </h2>

        <p className="text-sm sm:text-base font-normal leading-relaxed text-neutral-700 max-w-xl">
          At Safa Fragrance, we don&apos;t design scents to simply blend into the background. Every bottle is formulated with concentrated perfume oils and rich, grounding notes engineered to project confidence from morning boardroom to late evening. It is subtle up close, commanding from a distance, and unforgettable once you leave.
        </p>

        <div className="pt-2">
          <ul className="flex gap-5 items-center">
            <li>
              <Link
                href="https://www.instagram.com"
                target="_blank"
                rel="noreferrer"
                className="text-[#1b4431] hover:text-[#b39b66] transition hover:scale-110 block p-1"
                aria-label="Safa Fragrance Instagram"
              >
                <svg className="size-6 sm:size-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.79-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </Link>
            </li>
            <li>
              <Link
                href="https://www.tiktok.com"
                target="_blank"
                rel="noreferrer"
                className="text-[#1b4431] hover:text-[#b39b66] transition hover:scale-110 block p-1"
                aria-label="Safa Fragrance TikTok"
              >
                <svg className="size-6 sm:size-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.48 6.27 6.27 0 0 0 1.96-4.52V8.97a8.27 8.27 0 0 0 4.81 1.54V7.07c-.33 0-.67-.12-1-.38z" />
                </svg>
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center">
        <div className="relative w-full max-h-[460px] lg:max-h-[520px] aspect-4/3 overflow-hidden rounded-3xl shadow-lg border border-[#e7decb]">
          <Image
            src="/images/aboutscent.png"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-top"
            alt="The Safa Standard craft and heritage"
          />
        </div>
      </div>
    </section>
  );
}
