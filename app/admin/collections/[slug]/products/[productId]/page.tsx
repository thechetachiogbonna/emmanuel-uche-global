"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";
import { useAdminCollections } from "@/lib/admin/useAdminData";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ slug: string; productId: string }>();
  const { collections, updateProduct, hydrated } = useAdminCollections();

  const collection = collections.find((c) => c.slug === params.slug);
  const product = collection?.products.find((p) => p.id === params.productId);

  if (!hydrated) return null;

  if (!collection || !product) {
    return (
      <div>
        <Link
          href={`/admin/collections/${params.slug}`}
          className="text-[12px] tracking-wide uppercase text-ink-soft hover:text-ink"
        >
          ← Back
        </Link>
        <p className="mt-6 text-[14px] text-ink-soft">
          That product doesn&apos;t exist — it may have been deleted.
        </p>
      </div>
    );
  }

  return (
    <div>
      <Link
        href={`/admin/collections/${collection.slug}`}
        className="text-[12px] tracking-wide uppercase text-ink-soft hover:text-ink"
      >
        ← Back to {collection.name}
      </Link>
      <h1 className="font-display text-2xl md:text-3xl mt-3 mb-6">
        Edit Product
      </h1>
      <ProductForm
        initial={product}
        submitLabel="Save Changes"
        onSubmit={(draft) => {
          updateProduct(collection.slug, product.id, draft);
          router.push(`/admin/collections/${collection.slug}`);
        }}
      />
    </div>
  );
}
