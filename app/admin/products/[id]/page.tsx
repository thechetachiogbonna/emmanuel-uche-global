"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";
import { useAdminProducts } from "@/lib/admin/useAdminData";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { products, updateProduct, hydrated } = useAdminProducts();

  const product = products.find((p) => p.id === params.id);

  if (!hydrated) {
    return null;
  }

  if (!product) {
    return (
      <div>
        <Link
          href="/admin/products"
          className="text-[12px] tracking-wide uppercase text-ink-soft hover:text-ink"
        >
          ← Back to Products
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
        href="/admin/products"
        className="text-[12px] tracking-wide uppercase text-ink-soft hover:text-ink"
      >
        ← Back to Products
      </Link>
      <h1 className="font-display text-2xl md:text-3xl mt-3 mb-6">
        Edit Product
      </h1>
      <ProductForm
        initial={product}
        submitLabel="Save Changes"
        onSubmit={(draft) => {
          updateProduct(product.id, draft);
          router.push("/admin/products");
        }}
      />
    </div>
  );
}
