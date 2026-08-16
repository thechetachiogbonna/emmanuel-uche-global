"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import ProductForm from "@/components/admin/ProductForm";
import { createProductAction } from "@/lib/actions/admin-collections";

export default function NewProductPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <Link
        href={`/admin/collections/${params.slug}`}
        className="text-[12px] tracking-wide uppercase text-ink-soft hover:text-ink"
      >
        ← Back to Collection
      </Link>
      <h1 className="font-display text-2xl md:text-3xl mt-3 mb-6">
        Add Product
      </h1>
      {error && <p className="text-[13px] text-red-700 mb-4">{error}</p>}
      <ProductForm
        submitLabel="Create Product"
        onSubmit={async (draft) => {
          setError(null);
          const result = await createProductAction(params.slug, draft);
          if (!result.ok) {
            setError(result.error);
            return;
          }
          router.push(`/admin/collections/${params.slug}`);
          router.refresh();
        }}
      />
    </div>
  );
}
