import type { Metadata } from "next";
import Script from "next/script";
import React, { Suspense } from "react";
import Navbar from "./(component)/Navbar";
import "../globals.css";

export const metadata: Metadata = {
  title: "Admin Dashboard | Safa Fragrance",
  description: "Safa Fragrance store operations console.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-neutral-900 antialiased selection:bg-black selection:text-white">
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
        <div className="flex min-h-screen flex-col md:flex-row">
          <Suspense fallback={<div className="w-full md:w-64 md:min-h-screen bg-white border-r border-neutral-200" />}>
            <Navbar />
          </Suspense>
          <div className="flex-1 min-w-0">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}

