import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { collections as collectionsTable, products as productsTable } from "@/lib/db/schema";
import { getProductMedia, type ProductMediaItem } from "@/lib/product-media";

export type Product = {
  id: string;
  name: string;
  price: string;
  media: ProductMediaItem[];
};

export type Collection = {
  slug: string;
  season: string;
  name: string;
  pieceCount: number;
  status: "available" | "coming-soon";
  products: Product[];
};

export type CollectionLink = Pick<Collection, "slug" | "name" | "status">;

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
    pieceCount: c.products.length,
    status: c.status,
    products: c.products.map((p) => ({
      id: p.id,
      name: p.name,
      price: formatNaira(p.priceNaira),
      media: getProductMedia(p.media),
    })),
  }));
}

export async function getCollectionLinks(): Promise<CollectionLink[]> {
  return db
    .select({
      slug: collectionsTable.slug,
      name: collectionsTable.name,
      status: collectionsTable.status,
    })
    .from(collectionsTable)
    .orderBy(asc(collectionsTable.createdAt));
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
    pieceCount: row.products.length,
    status: row.status,
    products: row.products.map((p) => ({
      id: p.id,
      name: p.name,
      price: formatNaira(p.priceNaira),
      media: getProductMedia(p.media),
    })),
  };
}

export async function getRandomAvailableProducts(limit = 6): Promise<Product[]> {
  const rows = await db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      priceNaira: productsTable.priceNaira,
      media: productsTable.media,
    })
    .from(productsTable)
    .innerJoin(
      collectionsTable,
      eq(productsTable.collectionId, collectionsTable.id)
    )
    .where(eq(collectionsTable.status, "available"))
    .orderBy(sql`random()`)
    .limit(limit);

  return rows.map((product) => ({
    id: product.id,
    name: product.name,
    price: formatNaira(product.priceNaira),
    media: getProductMedia(product.media),
  }));
}

/**
 * Used by checkout — looks up current name/price/image directly from
 * Postgres by product id. Never trust a price the client sends; this is
 * the server's own source of truth at the moment of purchase.
 */
export async function getProductsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  const rows = await db.query.products.findMany({
    where: (p, { inArray }) => inArray(p.id, ids),
  });
  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    priceNaira: p.priceNaira,
    img1: p.media.find((item) => item.type === "image")?.src ?? "",
  }));
}
