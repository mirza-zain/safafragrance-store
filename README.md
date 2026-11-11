# Safa Fragrance | Haute Parfumerie

A luxury perfume e-commerce web platform and executive portal built for **Safa Fragrance**. Developed with Next.js 16 (Turbopack, Partial Prerendering, Cache Components), React 19, and Tailwind CSS v4, engineered with an Haute Parfumerie aesthetic (deep emerald green `#1b4431` and regal gold `#b39b66`).

---

## 💎 Haute Parfumerie Core Features

### 1. Customer Storefront
- **Haute Parfumerie Brand Identity**: Custom bespoke visual styling with brand logo (`/logo.png`), luxury typography (`Gebuk`, `Batica`, `Kugile`), and an emerald & gold palette.
- **Editorial Hero & Brand Value Proposition**: Extrait de Parfum accreditation (35%+ oil concentration), 14+ hour sillage guarantee, and nationwide insured delivery.
- **Interactive Scent Finder Quiz**: 30-second personal concierge recommending signature bottles based on occasion, mood, and olfactory preferences.
- **Private Reserve Signature Line**: 3-column interactive showcase with key accords, variant sizes (50ml / 100ml), and direct add to bag.
- **Fragrance Catalog & Shop (`/shop`)**:
  - Instant live search by name, olfactory notes, or ingredients
  - Multi-attribute filtering (Men, Women, Unisex) and Olfactory Families (Oriental Oud, Floral Bouquet, Citrus Leather, Woody Amber, Fresh Aquatic)
  - Sorting by price, ratings, and curation
  - Size variant switchers and stock status directly on cards
- **Dynamic Product Detail Page (`/productDetail/[id]`)**:
  - High-resolution perfume presentation
  - Complete **Olfactory Scent Pyramid** (Top Notes, Heart Core, Base Notes)
  - Performance meters: Longevity (14h+), Concentration (35% Extrait), Sillage, and Recommended Season
  - Size variants (50ml / 100ml) with dynamic pricing & stock synchronization
- **Interactive Slide-Over Cart Drawer (`CartDrawer`) & Full Cart (`/cart`)**:
  - Instant slide-over drawer accessible from any page
  - Free delivery progress tier (unlocked on orders over Rs. 6,000)
  - Real-time coupon code validation and subtotal computation
- **Streamlined Luxury Checkout (`/payment`)**:
  - Cash on Delivery (COD) for Karachi
  - Direct Bank Transfer & Raast for nationwide orders
  - 1-click Account Number & IBAN copy buttons
  - Payment proof / screenshot upload with live thumbnail preview
  - Real-time pricing validation via `/api/pricing`
- **Visual Order Tracking Portal (`/track`)**:
  - 4-step milestone courier timeline (Order Placed → Bottling & Sealing → Dispatched → Delivered)
  - Itemized order review and carrier logistics info
  - Direct 1-click WhatsApp concierge support button
- **Client Concierge & Showroom (`/contact`)**:
  - Direct inquiry form, Karachi studio address, business hours, and phone/email access

### 2. Executive Admin Dashboard (`/admin`)
- **Executive Overview (`/admin`)**:
  - KPI metric cards: Gross Revenue, Total Orders, Average Order Value, Active Formulations
  - Low inventory warning callouts
  - Recent orders feed with quick status pills
- **Manage Products (`/admin/manageProducts`)**:
  - Full product inventory catalog table with stock status
  - Modal form to create new Extrait de Parfum editions with notes, variants, images, and category
  - Delete / archive formulations
- **Manage Orders (`/admin/manageOrders`)**:
  - Orders table with status filtering (Pending, Processing, Shipped, Delivered, Cancelled)
  - In-row status update and payment verification review
  - Lightbox modal for customer payment screenshot proof
- **Printable Invoices & Packing Slips (`/admin/manageOrders/[id]`)**:
  - Dedicated printable tax invoice formatted for thermal or A4 printers
  - Status progression buttons (Verify Payment, Begin Bottling, Dispatch)
- **Sales & Multi-Channel Performance (`/admin/sales`)**:
  - Revenue breakdown by channel (Website Storefront, Instagram DM, WhatsApp Direct, Walk-In)
  - Best-selling fragrances ranked by revenue and bottle count
  - Manual Sale Recorder for logging direct phone/social media orders
- **Pricing & Delivery Rates (`/admin/pricing`)**:
  - Promo code management (Percentage % or Fixed Rs., minimum spend, max uses, active toggle)
  - City shipping rate management

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16.4 (App Router, Turbopack, Partial Prerendering)
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4 with custom `@theme` brand colors
- **Icons**: Lucide React
- **Data Layer**: Resilient store architecture (`app/lib/store.ts`) with persistent JSON state and clean REST API routes

---

## 🚀 Getting Started

1. **Install dependencies**:
```bash
npm install
```

2. **Run local development server**:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the storefront, or [http://localhost:3000/admin](http://localhost:3000/admin) for the admin portal.

3. **Build for production**:
```bash
npm run build
npm run start
```

---

## 🎨 Brand Palette

- **Brand Primary**: `#1b4431` (Deep Emerald Green)
- **Brand Dark**: `#0e281d` (Forest Charcoal)
- **Brand Gold**: `#b39b66` (Regal Gold)
- **Brand Gold Light**: `#d8c38c` (Champagne Gold)
- **Brand Cream**: `#faf7f2` (Warm Alabaster)
- **Brand Sand**: `#f2ece2`
