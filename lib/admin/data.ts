import { collections as siteCollections } from "@/lib/data";
import type {
  AdminCollection,
  Customer,
  Order,
  StoreSettings,
} from "./types";

// Seeded directly from the live site's lib/data.ts, so the admin console
// starts out mirroring what's actually published. Each product gets a
// stable id (site data has none — products are keyed by name there).
export const SEED_COLLECTIONS: AdminCollection[] = siteCollections.map(
  (c) => ({
    slug: c.slug,
    season: c.season,
    name: c.name,
    description: c.description,
    image: c.image,
    status: c.status,
    products: c.products.map((p, i) => ({
      id: `${c.slug}-p${i + 1}`,
      name: p.name,
      price: p.price,
      img1: p.img1,
      img2: p.img2,
    })),
  })
);

export const SEED_ORDERS: Order[] = [
  {
    id: "UF-1042",
    customer: "Ifeoma Chukwu",
    email: "ifeoma.c@example.com",
    date: "2026-08-10",
    items: 2,
    total: "₦363,000",
    status: "Processing",
  },
  {
    id: "UF-1041",
    customer: "Tayo Adeyemi",
    email: "tayo.a@example.com",
    date: "2026-08-09",
    items: 1,
    total: "₦245,000",
    status: "Shipped",
  },
  {
    id: "UF-1040",
    customer: "Chiamaka Obi",
    email: "chiamaka.o@example.com",
    date: "2026-08-08",
    items: 3,
    total: "₦461,000",
    status: "Delivered",
  },
  {
    id: "UF-1039",
    customer: "Bola Fashola",
    email: "bola.f@example.com",
    date: "2026-08-07",
    items: 1,
    total: "₦98,000",
    status: "Pending",
  },
  {
    id: "UF-1038",
    customer: "Ngozi Umeh",
    email: "ngozi.u@example.com",
    date: "2026-08-05",
    items: 1,
    total: "₦165,000",
    status: "Cancelled",
  },
];

export const SEED_CUSTOMERS: Customer[] = [
  {
    id: "c1",
    name: "Ifeoma Chukwu",
    email: "ifeoma.c@example.com",
    joined: "2026-02-14",
    orders: 4,
    totalSpent: "₦892,000",
  },
  {
    id: "c2",
    name: "Tayo Adeyemi",
    email: "tayo.a@example.com",
    joined: "2026-04-02",
    orders: 2,
    totalSpent: "₦445,000",
  },
  {
    id: "c3",
    name: "Chiamaka Obi",
    email: "chiamaka.o@example.com",
    joined: "2025-11-20",
    orders: 6,
    totalSpent: "₦1,340,000",
  },
  {
    id: "c4",
    name: "Bola Fashola",
    email: "bola.f@example.com",
    joined: "2026-06-30",
    orders: 1,
    totalSpent: "₦98,000",
  },
];

// Matches ContactSection.tsx's current hardcoded details.
export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "Uche Fashion International",
  studioLocation: "Aba, Nigeria",
  supportEmail: "hello@uchefashion.com",
  supportPhone: "+234 801 234 5678",
  hours: "Mon–Fri, 9am–6pm WAT",
};
