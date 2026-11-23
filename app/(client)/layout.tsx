import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/next";
import "../globals.css";
import Navbar from "./(components)/Navbar";
import Footer from "./(components)/Footer";
import CartDrawer from "./(components)/CartDrawer";
import FloatingWhatsApp from "./(components)/FloatingWhatsApp";
import PromoPopup from "./(components)/PromoPopup";
import { CartProvider } from "../context/CartContext";

export const metadata: Metadata = {
  title: {
    default: "Safa Fragrance | Concentrated Extrait de Parfum",
    template: "%s | Safa Fragrance",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.safafragnance.com"),
  description: "Shop Safa Fragrance luxury extrait de parfum in Pakistan. Discover long-lasting oud, amber, rose, and woody fragrances crafted for your signature scent.",
  keywords: [
    "Safa Fragrance",
    "Safa perfumes",
    "luxury perfumes Pakistan",
    "perfume online Pakistan",
    "long lasting perfume",
    "extrait de parfum",
    "oud perfume",
    "amber perfume",
    "Taif rose perfume",
    "Karachi perfume brand",
  ],
  authors: [{ name: "Safa Fragrance" }],
  creator: "Safa Fragrance",
  publisher: "Safa Fragrance",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: "https://www.safafragnance.com",
    siteName: "Safa Fragrance",
    title: "Safa Fragrance | Luxury Extrait de Parfum in Pakistan",
    description: "Discover long-lasting luxury extrait de parfum, composed with oud, amber, rose, woods, and warm resins.",
    images: [
      {
        url: "/images/banner.png",
        width: 1584,
        height: 396,
        alt: "Safa Fragrance luxury perfume collection",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Safa Fragrance | Luxury Extrait de Parfum",
    description: "Shop long-lasting luxury perfumes and concentrated extrait de parfum in Pakistan.",
    images: ["/images/banner.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
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
        <Script
          id="google-tag-manager"
          src="https://www.googletagmanager.com/gtm.js?id=GTM-NG675THX"
          strategy="beforeInteractive"
        />
        <Script
          id="google-tag-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://www.safafragnance.com/#organization",
                  name: "Safa Fragrance",
                  url: "https://www.safafragnance.com",
                  logo: "https://www.safafragnance.com/logo.png",
                  description: "Luxury extrait de parfum and long-lasting fragrances crafted in Pakistan.",
                  address: {
                    "@type": "PostalAddress",
                    addressLocality: "Karachi",
                    addressCountry: "PK",
                  },
                  contactPoint: {
                    "@type": "ContactPoint",
                    telephone: "+923453124310",
                    contactType: "customer service",
                    contactOption: "TollFree",
                    areaServed: "PK",
                    availableLanguage: ["English", "Urdu"],
                  },
                  sameAs: ["https://www.instagram.com/safa_frangrance/"],
                },
                {
                  "@type": "WebSite",
                  "@id": "https://www.safafragnance.com/#website",
                  url: "https://www.safafragnance.com",
                  name: "Safa Fragrance",
                  publisher: { "@id": "https://www.safafragnance.com/#organization" },
                  potentialAction: {
                    "@type": "SearchAction",
                    target: "https://www.safafragnance.com/shop?search={search_term_string}",
                    "query-input": "required name=search_term_string",
                  },
                },
              ],
            }),
          }}
        />
        <CartProvider>
          <Suspense fallback={<div className="h-20 sm:h-24 lg:h-28 w-full bg-[#faf7f2]" />}>
            <Navbar />
          </Suspense>
          <CartDrawer />
          <FloatingWhatsApp />
          <PromoPopup />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </CartProvider>
        <Analytics />
      </body>
    </html>
  );
}
