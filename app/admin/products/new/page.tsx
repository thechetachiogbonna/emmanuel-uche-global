"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";
import { useAdminProducts } from "@/lib/admin/useAdminData";

export default function NewProductPage() {
  const router = useRouter();
  const { addProduct } = useAdminProducts();

  return (
    <div>
      <Link
        href="/admin/products"
        className="text-[12px] tracking-wide uppercase text-ink-soft hover:text-ink"
      >
        ← Back to Products
      </Link>
      <h1 className="font-display text-2xl md:text-3xl mt-3 mb-6">
        Add Product
      </h1>
      <ProductForm
        submitLabel="Create Product"
        onSubmit={(draft) => {
          addProduct(draft);
          router.push("/admin/products");
        }}
      />
    </div>
  );
}
