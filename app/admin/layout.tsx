import Image from "next/image";
import Link from "next/link";
import "../globals.css";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  TrendingUp,
  Tag,
  ExternalLink,
  ShieldAlert
} from "lucide-react";

export const metadata = {
  title: "Admin Executive Portal | Safa Fragrance",
  description: "Executive management for Safa Fragrance orders, catalog, pricing, and sales."
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen flex flex-col bg-[#f5efe3] text-neutral-900 selection:bg-[#1b4431] selection:text-[#d8c38c]">
        {/* Top Admin Navbar */}
        <header className="sticky top-0 z-40 bg-[#0d2218] text-[#f2ece2] border-b border-[#1b4431] shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/admin" className="flex items-center gap-3">
                <div className="bg-white/95 rounded-xl px-2.5 py-1 shadow-xs">
                  <div className="relative h-7 w-24 sm:w-28">
                    <Image src="/logo.png" alt="Safa Fragrance" fill className="object-contain" />
                  </div>
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#d8c38c] hidden sm:inline">
                  Executive Portal
                </span>
              </Link>

              {/* Main Admin Navigation */}
              <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
                <Link
                  href="/admin"
                  className="px-3 py-1.5 rounded-lg hover:bg-[#1b4431] text-neutral-300 hover:text-white transition"
                >
                  Overview
                </Link>
                <Link
                  href="/admin/manageProducts"
                  className="px-3 py-1.5 rounded-lg hover:bg-[#1b4431] text-neutral-300 hover:text-white transition"
                >
                  Products
                </Link>
                <Link
                  href="/admin/manageOrders"
                  className="px-3 py-1.5 rounded-lg hover:bg-[#1b4431] text-neutral-300 hover:text-white transition"
                >
                  Orders
                </Link>
                <Link
                  href="/admin/sales"
                  className="px-3 py-1.5 rounded-lg hover:bg-[#1b4431] text-neutral-300 hover:text-white transition"
                >
                  Sales & Channels
                </Link>
                <Link
                  href="/admin/pricing"
                  className="px-3 py-1.5 rounded-lg hover:bg-[#1b4431] text-neutral-300 hover:text-white transition"
                >
                  Discounts & Rates
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/"
                target="_blank"
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#d8c38c] hover:text-white transition px-3 py-1.5 rounded-lg border border-[#1b4431] hover:border-[#d8c38c]"
              >
                <span>Live Storefront</span>
                <ExternalLink size={13} />
              </Link>
            </div>
          </div>

          {/* Mobile Nav row */}
          <div className="md:hidden flex items-center justify-around py-2 border-t border-[#1b4431] text-[11px] font-bold uppercase tracking-wider overflow-x-auto px-2">
            <Link href="/admin" className="px-2 py-1 text-neutral-300">Overview</Link>
            <Link href="/admin/manageProducts" className="px-2 py-1 text-neutral-300">Products</Link>
            <Link href="/admin/manageOrders" className="px-2 py-1 text-neutral-300">Orders</Link>
            <Link href="/admin/sales" className="px-2 py-1 text-neutral-300">Sales</Link>
            <Link href="/admin/pricing" className="px-2 py-1 text-neutral-300">Pricing</Link>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
