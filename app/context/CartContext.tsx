'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { CartItem } from "../lib/types";

const CART_STORAGE_KEY = "safa-fragrance-cart";

type AddProductInput = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  category: string;
  variantLabel?: string;
};

type CartContextValue = {
  cart: CartItem[];
  addToCart: (product: AddProductInput, variantLabel?: string, quantity?: number) => void;
  decreaseQuantity: (id: number, variantLabel?: string) => void;
  removeFromCart: (id: number, variantLabel?: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalItems: number;
  subtotal: number;
  hasHydrated: boolean;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
    try {
      const stored = window.localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      }
    } catch (e) {
      console.error("Cart hydration error", e);
    } finally {
      setHasHydrated(true);
    }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hasHydrated) {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart, hasHydrated]);

  const addToCart = (product: AddProductInput, variantLabel?: string, qtyToAdd: number = 1) => {
    // Do not add items that are out of stock
    if (product.stock <= 0) {
      console.warn(`Attempted to add out‑of‑stock product (id: ${product.id}) to cart`);
      return;
    }
    const finalVariant = variantLabel || product.variantLabel;
    setCart((current) => {
      const existingIndex = current.findIndex(
        (item) => item.id === product.id && item.variantLabel === finalVariant
      );

      if (existingIndex > -1) {
        const existing = current[existingIndex];
        const newQty = Math.min(product.stock, existing.quantity + qtyToAdd);
        const updated = [...current];
        updated[existingIndex] = { ...existing, quantity: newQty };
        return updated;
      }

      return [
        ...current,
        {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.image,
          stock: product.stock,
          category: product.category,
          variantLabel: finalVariant,
          quantity: Math.min(product.stock, qtyToAdd)
        }
      ];
    });

    // Auto open drawer to delight user
    setIsCartOpen(true);
  };

  const decreaseQuantity = (id: number, variantLabel?: string) => {
    setCart((current) =>
      current
        .map((item) => {
          if (item.id === id && item.variantLabel === variantLabel) {
            return { ...item, quantity: item.quantity - 1 };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id: number, variantLabel?: string) => {
    setCart((current) =>
      current.filter((item) => !(item.id === id && item.variantLabel === variantLabel))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        totalItems,
        subtotal,
        hasHydrated
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}
