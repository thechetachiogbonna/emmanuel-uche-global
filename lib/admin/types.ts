export type AdminProduct = {
  id: string;
  name: string;
  price: string; // formatted, matches site convention e.g. "₦165,000"
  img1: string;
  img2: string;
};

export type CollectionStatus = "available" | "coming-soon";

export type AdminCollection = {
  slug: string;
  season: string;
  name: string;
  description: string;
  image: string;
  status: CollectionStatus;
  products: AdminProduct[];
};

export type OrderStatus =
  | "Pending"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export type Order = {
  id: string;
  customer: string;
  email: string;
  date: string;
  items: number;
  total: string; // formatted, matches site's price convention
  status: OrderStatus;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  joined: string;
  orders: number;
  totalSpent: string;
};

export type StoreSettings = {
  storeName: string;
  studioLocation: string;
  supportEmail: string;
  supportPhone: string;
  hours: string;
};
