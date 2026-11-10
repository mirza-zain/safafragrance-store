import fs from "node:fs";
import path from "node:path";
import { Product, Order, DiscountCode, DeliveryCharge } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "store.json");

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Safa Royale Oud",
    tagline: "The crown jewel of oriental perfumery with aged Cambodian agarwood and royal amber.",
    description: "An opulent, commanding Extrait de Parfum crafted from 12-year aged Cambodian agarwood, velvety Taif rose petals, and warm Madagascar bourbon vanilla. Engineered for those whose presence commands the room without uttering a word.",
    category: "unisex",
    olfactoryFamily: "Oriental Oud",
    price: 4500,
    stock: 45,
    image: "/images/featurev1.png",
    concentration: "Extrait de Parfum • 35%",
    sillage: "Commanding",
    longevity: "16+ Hours",
    season: "Autumn / Winter / Evening",
    notes: {
      top: ["Saffron threads", "Italian Bergamot", "Cardamom"],
      heart: ["Royal Taif Rose", "Smoked Incense", "Nutmeg"],
      base: ["Cambodian Oud", "Amber Resin", "Bourbon Vanilla", "Leather"]
    },
    variants: [
      { label: "50ml Extrait", price: 4500, stock: 25 },
      { label: "100ml Extrait", price: 7800, stock: 20 }
    ],
    isFeatured: true,
    rating: 4.9,
    reviewCount: 38
  },
  {
    id: 2,
    name: "Safa Velvet Rose",
    tagline: "A luminous, hypnotic floral creation drenched in morning dew and soft pink peppercorns.",
    description: "Inspired by sun-drenched gardens of Grasse and eastern palatial terraces. Fresh Damask rose blooms alongside sparkling pink peppercorn and white peach, grounding into a sensual veil of cashmere musk and golden cedarwood.",
    category: "women",
    olfactoryFamily: "Floral Bouquet",
    price: 3900,
    stock: 35,
    image: "/images/featurev2.png",
    concentration: "Extrait de Parfum • 32%",
    sillage: "Moderate",
    longevity: "14+ Hours",
    season: "Spring / Summer / Day to Night",
    notes: {
      top: ["Pink Peppercorn", "White Peach", "Mandarin Zest"],
      heart: ["Grasse Damask Rose", "Sambac Jasmine", "Peony"],
      base: ["Cashmere Musk", "Golden Amber", "Cedarwood"]
    },
    variants: [
      { label: "50ml Extrait", price: 3900, stock: 20 },
      { label: "100ml Extrait", price: 6800, stock: 15 }
    ],
    isFeatured: true,
    rating: 4.8,
    reviewCount: 29
  },
  {
    id: 3,
    name: "Safa Imperial Leather",
    tagline: "Sharp, masculine elegance with Tuscan leather, smoky birch, and crisp bergamot.",
    description: "A tailored suit in an olfactory bottle. Imperial Leather unites bold notes of cured Tuscan leather, smoked birch, bitter almond, and fresh Calabrian bergamot. Unrivaled confidence for executive meetings and black-tie evenings.",
    category: "mens",
    olfactoryFamily: "Citrus Leather",
    price: 4200,
    stock: 50,
    image: "/images/featurev3.png",
    concentration: "Extrait de Parfum • 35%",
    sillage: "Commanding",
    longevity: "15+ Hours",
    season: "All Seasons • Formal",
    notes: {
      top: ["Calabrian Bergamot", "Thyme", "Clary Sage"],
      heart: ["Tuscan Leather", "Bitter Almond", "Orris Root"],
      base: ["Smoked Birch", "Ambergris", "Patchouli", "Tonka Bean"]
    },
    variants: [
      { label: "50ml Extrait", price: 4200, stock: 30 },
      { label: "100ml Extrait", price: 7200, stock: 20 }
    ],
    isFeatured: true,
    rating: 5.0,
    reviewCount: 44
  },
  {
    id: 4,
    name: "Safa Celestial Amber",
    tagline: "A warm, golden embrace of mystical spices, balsamic resins, and solar saffron.",
    description: "Rich, enveloping, and intimately magnetic. Celestial Amber weaves precious Kashmiri saffron with balsamic myrrh and warm benzoin, leaving an intoxicating trail that lingers intimately on knitwear and skin for days.",
    category: "unisex",
    olfactoryFamily: "Woody Amber",
    price: 4800,
    stock: 28,
    image: "/images/icon2.png",
    concentration: "Extrait de Parfum • 38%",
    sillage: "Enormous",
    longevity: "18+ Hours",
    season: "Winter / Cold Evenings",
    notes: {
      top: ["Kashmiri Saffron", "Coriander Seed", "Davana"],
      heart: ["Balsamic Myrrh", "Labdanum", "Cinnamon Bark"],
      base: ["Solar Amber", "Sandalwood Mysore", "Benzoin", "Gourmand Vanilla"]
    },
    variants: [
      { label: "50ml Extrait", price: 4800, stock: 16 },
      { label: "100ml Extrait", price: 8200, stock: 12 }
    ],
    isFeatured: true,
    rating: 4.9,
    reviewCount: 31
  },
  {
    id: 5,
    name: "Safa Emerald Vetiver",
    tagline: "Earthy, green sophistication infused with crisp pink grapefruit and smoky cedar.",
    description: "Clean, razor-sharp, and distinguished. Built around sustainable Haitian vetiver roots, sharpened by zesty grapefruit and pink pepper, softly cushioned on a bed of dry Atlas cedar and velvety oakmoss.",
    category: "mens",
    olfactoryFamily: "Woody Amber",
    price: 3800,
    stock: 40,
    image: "/images/featurev1.png",
    concentration: "Extrait de Parfum • 30%",
    sillage: "Moderate",
    longevity: "12+ Hours",
    season: "Spring / Summer / Office",
    notes: {
      top: ["Pink Grapefruit", "Neroli", "Green Apple"],
      heart: ["Haitian Vetiver", "Geranium", "Cardamom"],
      base: ["Atlas Cedar", "Oakmoss", "White Musk"]
    },
    variants: [
      { label: "50ml Extrait", price: 3800, stock: 25 },
      { label: "100ml Extrait", price: 6500, stock: 15 }
    ],
    isFeatured: false,
    rating: 4.7,
    reviewCount: 19
  },
  {
    id: 6,
    name: "Safa Blanc Musc",
    tagline: "Pure, pristine white musk entwined with luminous freesia and sheer pear blossom.",
    description: "The definition of understated luxury and intimacy. Blanc Musc mimics the scent of fresh silk and warm skin, radiating comfort with clean aldehydes, delicate freesia petals, and crystalline musk.",
    category: "women",
    olfactoryFamily: "Floral Bouquet",
    price: 3600,
    stock: 32,
    image: "/images/featurev2.png",
    concentration: "Extrait de Parfum • 30%",
    sillage: "Intimate",
    longevity: "13+ Hours",
    season: "All Year Everyday",
    notes: {
      top: ["Sheer Pear", "Crisp Aldehydes", "Water Lily"],
      heart: ["Freesia", "Iris Powder", "Magnolia"],
      base: ["White Musk", "Ambrette Seeds", "Cedar Milk"]
    },
    variants: [
      { label: "50ml Extrait", price: 3600, stock: 20 },
      { label: "100ml Extrait", price: 6200, stock: 12 }
    ],
    isFeatured: false,
    rating: 4.8,
    reviewCount: 22
  },
  {
    id: 7,
    name: "Safa Aqua Solaris",
    tagline: "Sun-drenched Mediterranean sea spray with sparkling citrus and ocean driftwood.",
    description: "An invigorating splash of turquoise ocean waves against sun-warmed cliffs. Zesty Amalfi lemons and salty marine air blend effortlessly with mineral ambergris and sun-bleached driftwood.",
    category: "unisex",
    olfactoryFamily: "Fresh Aquatic",
    price: 3900,
    stock: 30,
    image: "/images/featurev3.png",
    concentration: "Extrait de Parfum • 32%",
    sillage: "Moderate",
    longevity: "12+ Hours",
    season: "Summer / Hot Weather",
    notes: {
      top: ["Amalfi Lemon", "Marine Accord", "Mint Leaves"],
      heart: ["Sea Salt", "Rosemary", "Lotus Blossom"],
      base: ["Ocean Driftwood", "Ambergris", "Clean Vetiver"]
    },
    variants: [
      { label: "50ml Extrait", price: 3900, stock: 18 },
      { label: "100ml Extrait", price: 6900, stock: 12 }
    ],
    isFeatured: false,
    rating: 4.9,
    reviewCount: 26
  },
  {
    id: 8,
    name: "Safa Midnight Saffron",
    tagline: "Dark, mysterious, and unforgettable with spiced plum, Bulgarian rose, and midnight incense.",
    description: "Created for twilight encounters and midnight allure. Midnight Saffron opens with luscious dark plum and rare saffron, cascading into velvety Bulgarian rose and mysterious frankincense.",
    category: "unisex",
    olfactoryFamily: "Oriental Oud",
    price: 5200,
    stock: 22,
    image: "/images/icon2.png",
    concentration: "Extrait de Parfum • 36%",
    sillage: "Commanding",
    longevity: "16+ Hours",
    season: "Winter / Evening Black-Tie",
    notes: {
      top: ["Dark Plum", "Persian Saffron", "Black Pepper"],
      heart: ["Bulgarian Rose", "Frankincense", "Osmanthus"],
      base: ["Smoked Agarwood", "Patchouli Coeur", "Castoreum Accord"]
    },
    variants: [
      { label: "50ml Extrait", price: 5200, stock: 12 },
      { label: "100ml Extrait", price: 8900, stock: 10 }
    ],
    isFeatured: true,
    rating: 5.0,
    reviewCount: 37
  }
];

const INITIAL_DISCOUNTS: DiscountCode[] = [
  {
    id: 1,
    code: "SAFA10",
    type: "percentage",
    value: 10,
    minAmount: 3000,
    maxUses: 500,
    usedCount: 24,
    expiresAt: null,
    active: true
  },
  {
    id: 2,
    code: "WELCOME15",
    type: "percentage",
    value: 15,
    minAmount: 4000,
    maxUses: 200,
    usedCount: 52,
    expiresAt: null,
    active: true
  },
  {
    id: 3,
    code: "EIDLUXE",
    type: "fixed",
    value: 500,
    minAmount: 5000,
    maxUses: 100,
    usedCount: 18,
    expiresAt: null,
    active: true
  }
];

const INITIAL_DELIVERY: DeliveryCharge[] = [
  { id: 1, city: "Karachi", amount: 0, active: true },
  { id: 2, city: "Lahore", amount: 250, active: true },
  { id: 3, city: "Islamabad", amount: 250, active: true },
  { id: 4, city: "Rawalpindi", amount: 250, active: true },
  { id: 5, city: "Faisalabad", amount: 250, active: true },
  { id: 6, city: "Multan", amount: 250, active: true },
  { id: 7, city: "Peshawar", amount: 300, active: true },
  { id: 8, city: "Quetta", amount: 350, active: true },
  { id: 9, city: "Other Cities (Nationwide)", amount: 250, active: true }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 1001,
    trackingId: "SAFA-9A4B8C1D",
    firstName: "Zubair",
    lastName: "Ahmed",
    email: "zubair.ahmed@example.com",
    phoneCountryCode: "+92",
    phoneNum: "3001234567",
    address: "House 45, Street 8, Phase 6 DHA",
    city: "Karachi",
    country: "Pakistan",
    paymentMethod: "cod",
    paymentStatus: "paid",
    status: "delivered",
    items: [
      {
        productId: 1,
        productName: "Safa Royale Oud",
        variantLabel: "50ml Extrait",
        quantity: 1,
        price: 4500,
        image: "/images/featurev1.png"
      }
    ],
    subTotal: 4500,
    discountAmount: 0,
    deliveryAmount: 0,
    totalAmount: 4500,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    carrier: "TCS Express"
  },
  {
    id: 1002,
    trackingId: "SAFA-3E7F2A6C",
    firstName: "Ayesha",
    lastName: "Malik",
    email: "ayesha.malik@example.com",
    phoneCountryCode: "+92",
    phoneNum: "3219876543",
    address: "Apartment 302, Gulberg Greens",
    city: "Lahore",
    country: "Pakistan",
    paymentMethod: "bank_transfer",
    paymentStatus: "paid",
    paymentReceipt: "/images/featurev2.png",
    status: "shipped",
    items: [
      {
        productId: 2,
        productName: "Safa Velvet Rose",
        variantLabel: "100ml Extrait",
        quantity: 1,
        price: 6800,
        image: "/images/featurev2.png"
      }
    ],
    subTotal: 6800,
    discountCode: "SAFA10",
    discountAmount: 680,
    deliveryAmount: 250,
    totalAmount: 6370,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    carrier: "Trax Logistics"
  },
  {
    id: 1003,
    trackingId: "SAFA-7D1E9B4A",
    firstName: "Hamza",
    lastName: "Khan",
    email: "hamza.khan@example.com",
    phoneCountryCode: "+92",
    phoneNum: "3335558899",
    address: "Villa 12, Sector F-7/2",
    city: "Islamabad",
    country: "Pakistan",
    paymentMethod: "bank_transfer",
    paymentStatus: "pending_verification",
    paymentReceipt: "/images/Mashreq-Bank-Logo.png",
    status: "processing",
    items: [
      {
        productId: 3,
        productName: "Safa Imperial Leather",
        variantLabel: "50ml Extrait",
        quantity: 1,
        price: 4200,
        image: "/images/featurev3.png"
      },
      {
        productId: 4,
        productName: "Safa Celestial Amber",
        variantLabel: "50ml Extrait",
        quantity: 1,
        price: 4800,
        image: "/images/icon2.png"
      }
    ],
    subTotal: 9000,
    discountCode: "WELCOME15",
    discountAmount: 1350,
    deliveryAmount: 250,
    totalAmount: 7900,
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    carrier: "Leopards Courier"
  }
];

type StoreData = {
  products: Product[];
  orders: Order[];
  discounts: DiscountCode[];
  delivery: DeliveryCharge[];
};

// Global memory cache to retain mutations in Node runtime
declare global {
  // eslint-disable-next-line no-var
  var __safaStore: StoreData | undefined;
}

function loadStoreData(): StoreData {
  if (globalThis.__safaStore) {
    return globalThis.__safaStore;
  }

  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.products) && parsed.products.length > 0) {
        globalThis.__safaStore = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.error("Failed to read store.json, falling back to defaults", err);
  }

  const initial: StoreData = {
    products: INITIAL_PRODUCTS,
    orders: INITIAL_ORDERS,
    discounts: INITIAL_DISCOUNTS,
    delivery: INITIAL_DELIVERY
  };

  saveStoreData(initial);
  globalThis.__safaStore = initial;
  return initial;
}

function saveStoreData(data: StoreData) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write store.json", err);
  }
}

export function getStore() {
  const data = loadStoreData();
  return {
    getProducts: (params?: { category?: string; family?: string; search?: string; sort?: string; page?: number; pageSize?: number }) => {
      let filtered = [...data.products];

      if (params?.category && params.category !== "all") {
        filtered = filtered.filter((p) => p.category === params.category);
      }

      if (params?.family && params.family !== "all") {
        filtered = filtered.filter((p) => p.olfactoryFamily === params.family);
      }

      if (params?.search && params.search.trim() !== "") {
        const query = params.search.toLowerCase().trim();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query) ||
            p.tagline.toLowerCase().includes(query) ||
            p.notes.top.some((n) => n.toLowerCase().includes(query)) ||
            p.notes.heart.some((n) => n.toLowerCase().includes(query)) ||
            p.notes.base.some((n) => n.toLowerCase().includes(query))
        );
      }

      if (params?.sort) {
        if (params.sort === "price-low") {
          filtered.sort((a, b) => a.price - b.price);
        } else if (params.sort === "price-high") {
          filtered.sort((a, b) => b.price - a.price);
        } else if (params.sort === "rating") {
          filtered.sort((a, b) => b.rating - a.rating);
        } else if (params.sort === "name") {
          filtered.sort((a, b) => a.name.localeCompare(b.name));
        }
      }

      const total = filtered.length;
      const pageSize = params?.pageSize || 8;
      const page = params?.page || 1;
      const totalPages = Math.ceil(total / pageSize);
      const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

      return {
        products: paginated,
        total,
        page,
        pageSize,
        totalPages
      };
    },

    getAllProducts: () => {
      return data.products;
    },

    getProductById: (id: number) => {
      return data.products.find((p) => p.id === id) || null;
    },

    getFeaturedProducts: () => {
      return data.products.filter((p) => p.isFeatured);
    },

    addProduct: (newProd: Omit<Product, "id">) => {
      const nextId = data.products.length > 0 ? Math.max(...data.products.map((p) => p.id)) + 1 : 1;
      const product: Product = {
        ...newProd,
        id: nextId,
        rating: 5.0,
        reviewCount: 1
      };
      data.products.push(product);
      saveStoreData(data);
      return product;
    },

    updateProduct: (id: number, updates: Partial<Product>) => {
      const index = data.products.findIndex((p) => p.id === id);
      if (index === -1) return null;
      data.products[index] = { ...data.products[index], ...updates };
      saveStoreData(data);
      return data.products[index];
    },

    deleteProduct: (id: number) => {
      const index = data.products.findIndex((p) => p.id === id);
      if (index === -1) return false;
      data.products.splice(index, 1);
      saveStoreData(data);
      return true;
    },

    // Orders
    getOrders: () => {
      return [...data.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },

    getOrderById: (id: number) => {
      return data.orders.find((o) => o.id === id) || null;
    },

    getOrderByTrackingId: (trackingId: string) => {
      const clean = trackingId.trim().toUpperCase();
      return data.orders.find((o) => o.trackingId.toUpperCase() === clean) || null;
    },

    createOrder: (orderInput: Omit<Order, "id" | "trackingId" | "createdAt" | "status" | "paymentStatus"> & { paymentStatus?: Order["paymentStatus"] }) => {
      const nextId = data.orders.length > 0 ? Math.max(...data.orders.map((o) => o.id)) + 1 : 1001;
      const randomHex = Math.random().toString(16).substring(2, 10).toUpperCase();
      const trackingId = `SAFA-${randomHex}`;

      const newOrder: Order = {
        ...orderInput,
        id: nextId,
        trackingId,
        status: "pending",
        paymentStatus: orderInput.paymentStatus || (orderInput.paymentMethod === "bank_transfer" ? "pending_verification" : "unpaid"),
        createdAt: new Date().toISOString()
      };

      // Deduct product stock
      for (const item of newOrder.items) {
        const product = data.products.find((p) => p.id === item.productId);
        if (product) {
          if (item.variantLabel && product.variants?.length) {
            const vIndex = product.variants.findIndex((v) => v.label === item.variantLabel);
            if (vIndex !== -1) {
              product.variants[vIndex].stock = Math.max(0, product.variants[vIndex].stock - item.quantity);
              product.stock = product.variants.reduce((acc, curr) => acc + curr.stock, 0);
            }
          } else {
            product.stock = Math.max(0, product.stock - item.quantity);
          }
        }
      }

      // If discount used, increment usage
      if (newOrder.discountCode) {
        const discount = data.discounts.find((d) => d.code.toUpperCase() === newOrder.discountCode?.toUpperCase());
        if (discount) {
          discount.usedCount += 1;
        }
      }

      data.orders.unshift(newOrder);
      saveStoreData(data);
      return newOrder;
    },

    updateOrderStatus: (id: number, updates: Partial<Order>) => {
      const index = data.orders.findIndex((o) => o.id === id);
      if (index === -1) return null;
      data.orders[index] = { ...data.orders[index], ...updates };
      saveStoreData(data);
      return data.orders[index];
    },

    deleteOrder: (id: number) => {
      const index = data.orders.findIndex((o) => o.id === id);
      if (index === -1) return false;
      const order = data.orders[index];
      // Restore inventory
      for (const item of order.items) {
        const prod = data.products.find((p) => p.id === item.productId);
        if (prod) {
          prod.stock += item.quantity;
          if (prod.variants && item.variantLabel) {
            const v = prod.variants.find((vr) => vr.label === item.variantLabel);
            if (v) v.stock += item.quantity;
          }
        }
      }
      data.orders.splice(index, 1);
      saveStoreData(data);
      return true;
    },

    // Discounts
    getDiscounts: () => {
      return data.discounts;
    },

    getDiscountByCode: (code: string) => {
      const clean = code.trim().toUpperCase();
      return data.discounts.find((d) => d.code.toUpperCase() === clean && d.active) || null;
    },

    addDiscount: (discount: Omit<DiscountCode, "id" | "usedCount">) => {
      const nextId = data.discounts.length > 0 ? Math.max(...data.discounts.map((d) => d.id)) + 1 : 1;
      const newD: DiscountCode = { ...discount, id: nextId, usedCount: 0 };
      data.discounts.push(newD);
      saveStoreData(data);
      return newD;
    },

    toggleDiscount: (id: number, active?: boolean) => {
      const index = data.discounts.findIndex((d) => d.id === id);
      if (index === -1) return null;
      data.discounts[index].active = active !== undefined ? active : !data.discounts[index].active;
      saveStoreData(data);
      return data.discounts[index];
    },

    deleteDiscount: (id: number) => {
      const index = data.discounts.findIndex((d) => d.id === id);
      if (index === -1) return false;
      data.discounts.splice(index, 1);
      saveStoreData(data);
      return true;
    },

    // Delivery charges
    getDeliveryCharges: () => {
      return data.delivery;
    },

    addDeliveryCharge: (charge: Omit<DeliveryCharge, "id">) => {
      const nextId = data.delivery.length > 0 ? Math.max(...data.delivery.map((d) => d.id)) + 1 : 1;
      const newC: DeliveryCharge = { ...charge, id: nextId };
      data.delivery.push(newC);
      saveStoreData(data);
      return newC;
    },

    toggleDeliveryCharge: (id: number, active?: boolean) => {
      const index = data.delivery.findIndex((d) => d.id === id);
      if (index === -1) return null;
      data.delivery[index].active = active !== undefined ? active : !data.delivery[index].active;
      saveStoreData(data);
      return data.delivery[index];
    },

    deleteDeliveryCharge: (id: number) => {
      const index = data.delivery.findIndex((d) => d.id === id);
      if (index === -1) return false;
      data.delivery.splice(index, 1);
      saveStoreData(data);
      return true;
    },

    calculateDelivery: (city: string, subtotal: number) => {
      if (subtotal >= 6000) return 0; // Free nationwide shipping on orders over Rs. 6000!
      const target = city.trim().toLowerCase();
      const match = data.delivery.find((d) => d.city.toLowerCase() === target && d.active);
      if (match) return match.amount;
      const fallback = data.delivery.find((d) => d.city.includes("Other") || d.city.includes("Nationwide"));
      return fallback ? fallback.amount : 250;
    }
  };
}

