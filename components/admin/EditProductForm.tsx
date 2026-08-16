"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ProductForm from "@/components/admin/ProductForm";
import { updateProductAction, type ProductDraft } from "@/lib/actions/admin-collections";

export default function EditProductForm({
  productId,
  collectionSlug,
  initial,
}: {
  productId: string;
  collectionSlug: string;
  initial: ProductDraft;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      {error && <p className="text-[13px] text-red-700 mb-4">{error}</p>}
      <ProductForm
        initial={initial}
        submitLabel="Save Changes"
        onSubmit={async (draft) => {
          setError(null);
          const result = await updateProductAction(productId, collectionSlug, draft);
          if (!result.ok) {
            setError(result.error);
            return;
          }
          router.push(`/admin/collections/${collectionSlug}`);
          router.refresh();
        }}
      />
    </div>
  );
}
