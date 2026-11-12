export type FragranceNotes = {
  top: string[];
  heart: string[];
  base: string[];
};

export type ProductVariant = {
  label: string;
  price: number;
  stock: number;
};

export type Product = {
  id: number;
  name: string;
  tagline: string;
  description: string;
  category: "mens" | "women" | "unisex";
  olfactoryFamily?: "Oriental Oud" | "Woody Amber" | "Floral Bouquet" | "Fresh Aquatic" | "Citrus Leather" | string;
  price: number;
  stock: number;
  image: string;
  concentration: string;
  sillage: "Intimate" | "Moderate" | "Commanding" | "Enormous";
  longevity: string;
  season: string;
  notes: FragranceNotes;
  variants?: ProductVariant[];
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
};

export type CartItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  category: string;
  variantLabel?: string;
  quantity: number;
};

export type OrderItem = {
  productId: number;
  productName: string;
  variantLabel?: string;
  quantity: number;
  price: number;
  image?: string;
};

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentMethod = "cod" | "bank_transfer";
export type PaymentStatus = "unpaid" | "pending_verification" | "paid" | "rejected";

export type Order = {
  id: number;
  trackingId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneCountryCode: string;
  phoneNum: string;
  address: string;
  city: string;
  country: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentReceipt?: string;
  status: OrderStatus;
  items: OrderItem[];
  subTotal: number;
  discountCode?: string;
  discountAmount: number;
  deliveryAmount: number;
  totalAmount: number;
  createdAt: string;
  carrier?: string;
  notes?: string;
};

export type DiscountCode = {
  id: number;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minAmount: number;
  maxUses?: number | null;
  usedCount: number;
  expiresAt?: string | null;
  active: boolean;
};

export type DeliveryCharge = {
  id: number;
  city: string;
  amount: number;
  active: boolean;
};

