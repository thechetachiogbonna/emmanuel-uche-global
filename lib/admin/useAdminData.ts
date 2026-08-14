"use client";

import { useLocalStore } from "@/lib/useLocalStore";
import {
  DEFAULT_SETTINGS,
  SEED_COLLECTIONS,
  SEED_CUSTOMERS,
  SEED_ORDERS,
} from "./data";
import type {
  AdminCollection,
  AdminProduct,
  Order,
  OrderStatus,
  StoreSettings,
} from "./types";

export function useAdminCollections() {
  const { value, setValue, hydrated } = useLocalStore<AdminCollection[]>(
    "uche_admin_collections",
    SEED_COLLECTIONS
  );

  const addCollection = (c: AdminCollection) => {
    setValue((prev) => [c, ...prev]);
  };

  const updateCollection = (
    slug: string,
    patch: Partial<Omit<AdminCollection, "products">>
  ) => {
    setValue((prev) =>
      prev.map((c) => (c.slug === slug ? { ...c, ...patch } : c))
    );
  };

  const deleteCollection = (slug: string) => {
    setValue((prev) => prev.filter((c) => c.slug !== slug));
  };

  const addProduct = (slug: string, product: Omit<AdminProduct, "id">) => {
    const id = `${slug}-p${Date.now().toString(36)}`;
    setValue((prev) =>
      prev.map((c) =>
        c.slug === slug
          ? { ...c, products: [{ ...product, id }, ...c.products] }
          : c
      )
    );
    return id;
  };

  const updateProduct = (
    slug: string,
    productId: string,
    patch: Partial<AdminProduct>
  ) => {
    setValue((prev) =>
      prev.map((c) =>
        c.slug === slug
          ? {
              ...c,
              products: c.products.map((p) =>
                p.id === productId ? { ...p, ...patch } : p
              ),
            }
          : c
      )
    );
  };

  const deleteProduct = (slug: string, productId: string) => {
    setValue((prev) =>
      prev.map((c) =>
        c.slug === slug
          ? { ...c, products: c.products.filter((p) => p.id !== productId) }
          : c
      )
    );
  };

  return {
    collections: value,
    hydrated,
    addCollection,
    updateCollection,
    deleteCollection,
    addProduct,
    updateProduct,
    deleteProduct,
  };
}

export function useAdminOrders() {
  const { value, setValue, hydrated } = useLocalStore<Order[]>(
    "uche_admin_orders",
    SEED_ORDERS
  );

  const setStatus = (id: string, status: OrderStatus) => {
    setValue((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  return { orders: value, hydrated, setStatus };
}

export function useAdminCustomers() {
  const { value, hydrated } = useLocalStore(
    "uche_admin_customers",
    SEED_CUSTOMERS
  );
  return { customers: value, hydrated };
}

export function useAdminSettings() {
  const { value, setValue, hydrated } = useLocalStore<StoreSettings>(
    "uche_admin_settings",
    DEFAULT_SETTINGS
  );
  return { settings: value, setSettings: setValue, hydrated };
}
