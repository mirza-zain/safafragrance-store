'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X, Shield, Sparkles, Search } from "lucide-react";
import { useCart } from "@/app/context/CartContext";

export default function Navbar() {
  const { totalItems, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Fragrances", href: "/shop" },
    { name: "Private Reserve", href: "/#reserve" },
    { name: "Our Story", href: "/#story" },
    { name: "Track Order", href: "/track" },
    { name: "Contact", href: "/contact" }
  ];

  return (
    <>
      {/* Main Navbar */}
      <header
        className={`w-full sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-[#faf7f2]/95 backdrop-blur-md shadow-xs border-b border-[#e7decb] py-2"
            : "bg-[#faf7f2] border-b border-[#eee6d7] py-2 sm:py-3.5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div
              className={`relative transition-all duration-300 group-hover:scale-105 ${
                scrolled
                  ? "h-16 w-40 sm:h-20 sm:w-48 lg:h-24 lg:w-60"
                  : "h-20 w-48 sm:h-24 sm:w-60 lg:h-28 lg:w-72"
              }`}
            >
              <Image
                src="/logo.png"
                alt="Safa Fragrance"
                fill
                priority
                className="object-contain object-left"
              />
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-xs uppercase font-semibold tracking-widest transition-colors duration-200 py-1 border-b-2 ${
                    isActive
                      ? "text-[#1b4431] border-[#1b4431]"
                      : "text-neutral-700 hover:text-[#1b4431] border-transparent hover:border-[#b39b66]"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3 sm:gap-5">
            <Link
              href="/shop"
              className="hidden sm:flex items-center gap-1.5 text-xs uppercase font-bold tracking-wider text-neutral-600 hover:text-[#1b4431] transition px-3 py-1.5 rounded-full hover:bg-neutral-100"
              title="Search Fragrances"
            >
              <Search size={16} />
              <span className="hidden md:inline">Catalog</span>
            </Link>

            {/* Shopping Bag Trigger for Drawer */}
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label="Open Cart"
              className="relative p-2.5 rounded-full hover:bg-[#eee6d7] text-neutral-900 transition flex items-center justify-center group"
            >
              <ShoppingBag size={22} className="group-hover:text-[#1b4431] transition-transform group-hover:scale-105" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#1b4431] text-[#f2ece2] text-[10px] font-bold rounded-full min-w-5 h-5 px-1 flex items-center justify-center border-2 border-white shadow-xs animate-in zoom-in">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-neutral-800 hover:bg-neutral-100 transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-4/5 max-w-sm h-full bg-[#faf7f2] p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300 border-l border-[#e7decb]">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[#e7decb]">
                <div className="relative h-18 w-44 sm:h-20 sm:w-48">
                  <Image src="/logo.png" alt="Safa Fragrance" fill className="object-contain object-left" />
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-neutral-200 text-neutral-700 transition"
                >
                  <X size={22} />
                </button>
              </div>

              <nav className="flex flex-col gap-5 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-base uppercase font-bold tracking-widest text-neutral-800 hover:text-[#1b4431] transition py-1"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="pt-6 border-t border-[#e7decb] space-y-3">
              <div className="flex items-center gap-2 text-xs text-neutral-600">
                <Shield size={14} className="text-[#1b4431]" />
                <span>Karachi Concierge & Nationwide Express</span>
              </div>
              <p className="text-[11px] text-neutral-400">© 2026 Safa Fragrance Haute Parfumerie</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
