import type { Metadata } from "next";
import { Suspense } from "react";
import "../globals.css";
import Navbar from "./(components)/Navbar";
import Footer from "./(components)/Footer";
import CartDrawer from "./(components)/CartDrawer";
import FloatingWhatsApp from "./(components)/FloatingWhatsApp";
import { CartProvider } from "../context/CartContext";

export const metadata: Metadata = {
  title: {
    default: "Safa Fragrance | Concentrated Extrait de Parfum",
    template: "%s | Safa Fragrance",
  },
  description: "Discover Safa Fragrance: concentrated extrait de parfum composed with luminous openings, rich woods, and warm resins for a personal, lasting signature.",
  keywords: ["Safa Fragrance", "luxury perfume", "Extrait de Parfum", "Pakistan perfumes", "Oud", "Taif Rose", "Amber", "Haute Parfumerie"],
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-screen flex flex-col bg-[#faf7f2] text-neutral-900 selection:bg-[#1b4431] selection:text-[#d8c38c]">
        <CartProvider>
          <Suspense fallback={<div className="h-20 sm:h-24 lg:h-28 w-full bg-[#faf7f2]" />}>
            <Navbar />
          </Suspense>
          <CartDrawer />
          <FloatingWhatsApp />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
