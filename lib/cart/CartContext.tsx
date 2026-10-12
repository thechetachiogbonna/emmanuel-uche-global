"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export type CartItem = {
  productId: string;
  name: string;
  price: string; // display string, e.g. "₦165,000"
  priceNaira: number; // parsed, used for subtotal math
  img1: string;
  size: string | null;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  hydrated: boolean;
  addItem: (product: { id: string; name: string; price: string; img1: string; size?: string | null }, quantity?: number) => void;
  removeItem: (productId: string, size?: string | null) => void;
  updateQuantity: (productId: string, quantity: number, size?: string | null) => void;
  clear: () => void;
  subtotalNaira: number;
  itemCount: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "uche_cart";

function parseNaira(price: string): number {
  const digits = price.replace(/[^\d]/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from storage on mount, not a cascading update
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore malformed storage
    }
    setHydrated(true);
  }, []);

  const persist = useCallback((next: CartItem[]) => {
    setItems(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // storage unavailable — cart still works for this tab, just won't persist
    }
  }, []);

  const addItem: CartContextValue["addItem"] = useCallback((product, quantity = 1) => {
    const size = product.size ?? null;
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.productId === product.id && (i.size ?? null) === size
      );
      const next = existing
        ? prev.map((i) =>
            i.productId === product.id && (i.size ?? null) === size
              ? { ...i, quantity: i.quantity + quantity }
              : i
          )
        : [
            ...prev,
            {
              productId: product.id,
              name: product.name,
              price: product.price,
              priceNaira: parseNaira(product.price),
              img1: product.img1,
              size,
              quantity,
            },
          ];
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // non-fatal
      }
      return next;
    });
  }, []);

  const removeItem = useCallback(
    (productId: string, size: string | null = null) => {
      persist(items.filter((i) => i.productId !== productId || (i.size ?? null) !== size));
    },
    [items, persist]
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number, size: string | null = null) => {
      if (quantity <= 0) {
        persist(items.filter((i) => i.productId !== productId || (i.size ?? null) !== size));
        return;
      }
      persist(
        items.map((i) =>
          i.productId === productId && (i.size ?? null) === size
            ? { ...i, quantity }
            : i
        )
      );
    },
    [items, persist]
  );

  const clear = useCallback(() => persist([]), [persist]);

  const subtotalNaira = items.reduce((sum, i) => sum + i.priceNaira * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, hydrated, addItem, removeItem, updateQuantity, clear, subtotalNaira, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
