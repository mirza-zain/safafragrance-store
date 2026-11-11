import fs from "node:fs";
import path from "node:path";
import { Product, Order, DiscountCode, DeliveryCharge } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "store.json");

const INITIAL_PRODUCTS: Product[] = [];

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

const INITIAL_ORDERS: Order[] = [];

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
      if (parsed && Array.isArray(parsed.products)) {
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
            (p.tagline && p.tagline.toLowerCase().includes(query)) ||
            (Array.isArray(p.notes?.top) && p.notes.top.some((n) => n.toLowerCase().includes(query))) ||
            (Array.isArray(p.notes?.heart) && p.notes.heart.some((n) => n.toLowerCase().includes(query))) ||
            (Array.isArray(p.notes?.base) && p.notes.base.some((n) => n.toLowerCase().includes(query))) ||
            (typeof p.notes === "string" && (p.notes as unknown as string).toLowerCase().includes(query))
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

    getProductById: (idOrSlug: number | string) => {
      const numId = Number(idOrSlug);
      if (!Number.isNaN(numId) && numId > 0) {
        const found = data.products.find((p) => p.id === numId);
        if (found) return found;
      }
      const query = String(idOrSlug).toLowerCase().trim();
      return (
        data.products.find(
          (p) =>
            String(p.id) === query ||
            p.name.toLowerCase() === query ||
            p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === query ||
            (p.tagline && p.tagline.toLowerCase().includes(query))
        ) || null
      );
    },

    getFeaturedProducts: () => {
      const featured = data.products.filter((p) => p.isFeatured);
      if (featured.length > 0) return featured.slice(0, 4);
      // Fallback: return up to 4 products from the catalog
      return data.products.slice(0, 4);
    },

    setFeaturedProducts: (featuredIds: number[]) => {
      data.products.forEach((p) => {
        p.isFeatured = featuredIds.includes(p.id);
      });
      saveStoreData(data);
      return featuredIds
        .map((id) => data.products.find((p) => p.id === id))
        .filter(Boolean);
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

