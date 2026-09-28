"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { collections, products } from "@/lib/db/schema";
import { slugify } from "@/lib/slug";
import { requireAdmin } from "@/lib/auth";
import type { ProductMediaItem } from "@/lib/product-media";

type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function newId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function revalidateStorefront(slug?: string) {
  revalidatePath("/admin/collections");
  revalidatePath("/collections");
  revalidatePath("/");
  if (slug) revalidatePath(`/collections/${slug}`);
}

export type CollectionDraft = {
  name: string;
  slug: string;
  description: string;
  image: string;
};

export async function createCollectionAction(
  draft: CollectionDraft
): Promise<ActionResult<{ slug: string }>> {
  await requireAdmin();

  const slug = slugify(draft.slug || draft.name);
  if (!slug) return { ok: false, error: "Slug is required." };
  if (!draft.name.trim()) return { ok: false, error: "Name is required." };

  const existing = await db.query.collections.findFirst({
    where: eq(collections.slug, slug),
  });
  if (existing) return { ok: false, error: "That slug is already in use." };

  await db.insert(collections).values({
    id: newId("col"),
    slug,
    name: draft.name.trim(),
    description: draft.description.trim(),
    image: draft.image.trim(),
  });

  revalidateStorefront(slug);
  return { ok: true, data: { slug } };
}

export async function updateCollectionAction(
  currentSlug: string,
  draft: Omit<CollectionDraft, "slug">
): Promise<ActionResult> {
  await requireAdmin();

  if (!draft.name.trim()) return { ok: false, error: "Name is required." };

  await db
    .update(collections)
    .set({
      name: draft.name.trim(),
      description: draft.description.trim(),
      image: draft.image.trim(),
      updatedAt: new Date(),
    })
    .where(eq(collections.slug, currentSlug));

  revalidateStorefront(currentSlug);
  return { ok: true, data: undefined };
}

export async function deleteCollectionAction(slug: string): Promise<ActionResult> {
  await requireAdmin();
  await db.delete(collections).where(eq(collections.slug, slug));
  revalidateStorefront(slug);
  return { ok: true, data: undefined };
}

export type ProductDraft = {
  name: string;
  price: string; // "₦165,000" — parsed to an integer for storage
  media: ProductMediaItem[];
};

function parseNaira(price: string): number | null {
  const digits = price.replace(/[^\d]/g, "");
  if (!digits) return null;
  return parseInt(digits, 10);
}

function normalizeProductMedia(media: ProductMediaItem[]) {
  return media
    .filter((item) => item.src.trim())
    .map((item) => ({ src: item.src.trim(), type: item.type }));
}

function hasValidVideoCount(media: ProductMediaItem[]) {
  return media.filter((item) => item.type === "video").length <= 2;
}

function isValidMediaUrl(src: string) {
  return /^(https?:\/\/|\/(?!\/))/.test(src);
}

export async function createProductAction(
  collectionSlug: string,
  draft: ProductDraft
): Promise<ActionResult> {
  await requireAdmin();

  const collection = await db.query.collections.findFirst({
    where: eq(collections.slug, collectionSlug),
  });
  if (!collection) return { ok: false, error: "Collection not found." };

  if (!draft.name.trim()) return { ok: false, error: "Product name is required." };
  const priceNaira = parseNaira(draft.price);
  if (priceNaira === null) return { ok: false, error: "Enter a valid price." };
  const media = normalizeProductMedia(draft.media);
  if (!hasValidVideoCount(media)) {
    return { ok: false, error: "A product can have no more than two videos." };
  }
  if (!media.some((item) => item.type === "image")) {
    return { ok: false, error: "Add at least one product image." };
  }
  if (media.some((item) => !isValidMediaUrl(item.src))) {
    return { ok: false, error: "Media URLs must use http(s) or a site-relative path." };
  }
  await db.insert(products).values({
    id: newId("prod"),
    collectionId: collection.id,
    name: draft.name.trim(),
    priceNaira,
    media,
  });

  revalidateStorefront(collectionSlug);
  return { ok: true, data: undefined };
}

export async function updateProductAction(
  productId: string,
  collectionSlug: string,
  draft: ProductDraft
): Promise<ActionResult> {
  await requireAdmin();

  if (!draft.name.trim()) return { ok: false, error: "Product name is required." };
  const priceNaira = parseNaira(draft.price);
  if (priceNaira === null) return { ok: false, error: "Enter a valid price." };
  const media = normalizeProductMedia(draft.media);
  if (!hasValidVideoCount(media)) {
    return { ok: false, error: "A product can have no more than two videos." };
  }
  if (!media.some((item) => item.type === "image")) {
    return { ok: false, error: "Add at least one product image." };
  }
  if (media.some((item) => !isValidMediaUrl(item.src))) {
    return { ok: false, error: "Media URLs must use http(s) or a site-relative path." };
  }
  await db
    .update(products)
    .set({
      name: draft.name.trim(),
      priceNaira,
      media,
      updatedAt: new Date(),
    })
    .where(eq(products.id, productId));

  revalidateStorefront(collectionSlug);
  return { ok: true, data: undefined };
}

export async function deleteProductAction(
  productId: string,
  collectionSlug: string
): Promise<ActionResult> {
  await requireAdmin();
  await db.delete(products).where(eq(products.id, productId));
  revalidateStorefront(collectionSlug);
  return { ok: true, data: undefined };
}
