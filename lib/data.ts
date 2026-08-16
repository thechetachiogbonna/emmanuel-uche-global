import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { collections as collectionsTable, products as productsTable } from "@/lib/db/schema";

export type Product = {
  name: string;
  price: string;
  img1: string;
  img2: string;
};

export type Collection = {
  slug: string;
  season: string;
  name: string;
  description: string;
  image: string;
  pieceCount: number;
  status: "available" | "coming-soon";
  products: Product[];
};

function formatNaira(amount: number) {
  return `\u20A6${amount.toLocaleString("en-NG")}`;
}

/**
 * Fetches every collection with its products, shaped exactly like the old
 * static lib/data.ts export so none of the display components had to
 * change. Reads happen straight from Postgres on each request — see
 * app/(site)/collections/[slug]/page.tsx for why these routes are dynamic
 * rather than statically generated now that content is admin-editable.
 */
export async function getCollections(): Promise<Collection[]> {
  const rows = await db.query.collections.findMany({
    orderBy: [asc(collectionsTable.createdAt)],
    with: {
      products: {
        orderBy: [asc(productsTable.createdAt)],
      },
    },
  });

  return rows.map((c) => ({
    slug: c.slug,
    season: c.season,
    name: c.name,
    description: c.description,
    image: c.image,
    pieceCount: c.products.length,
    status: c.status,
    products: c.products.map((p) => ({
      name: p.name,
      price: formatNaira(p.priceNaira),
      img1: p.img1,
      img2: p.img2,
    })),
  }));
}

export async function getCollection(slug: string): Promise<Collection | undefined> {
  const row = await db.query.collections.findFirst({
    where: eq(collectionsTable.slug, slug),
    with: {
      products: {
        orderBy: [asc(productsTable.createdAt)],
      },
    },
  });

  if (!row) return undefined;

  return {
    slug: row.slug,
    season: row.season,
    name: row.name,
    description: row.description,
    image: row.image,
    pieceCount: row.products.length,
    status: row.status,
    products: row.products.map((p) => ({
      name: p.name,
      price: formatNaira(p.priceNaira),
      img1: p.img1,
      img2: p.img2,
    })),
  };
}
