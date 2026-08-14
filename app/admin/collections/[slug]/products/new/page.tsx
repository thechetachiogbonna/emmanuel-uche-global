"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";
import { useAdminCollections } from "@/lib/admin/useAdminData";

export default function NewProductPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const { collections, addProduct, hydrated } = useAdminCollections();

  const collection = collections.find((c) => c.slug === params.slug);

  if (!hydrated) return null;

  return (
    <div>
      <Link
        href={`/admin/collections/${params.slug}`}
        className="text-[12px] tracking-wide uppercase text-ink-soft hover:text-ink"
      >
        ← Back to {collection?.name ?? "Collection"}
      </Link>
      <h1 className="font-display text-2xl md:text-3xl mt-3 mb-6">
        Add Product
      </h1>
      <ProductForm
        submitLabel="Create Product"
        onSubmit={(draft) => {
          addProduct(params.slug, draft);
          router.push(`/admin/collections/${params.slug}`);
        }}
      />
    </div>
  );
}
