"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAdminProducts } from "@/lib/admin/useAdminData";
import { formatNaira } from "@/lib/admin/format";
import { ProductStatusBadge } from "@/components/admin/Badge";

export default function ProductsPage() {
  const { products, deleteProduct } = useAdminProducts();
  const [query, setQuery] = useState("");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [products, query]);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-2xl md:text-3xl">Products</h1>
        <Link
          href="/admin/products/new"
          className="bg-ink text-ivory text-[12px] tracking-[0.12em] uppercase px-4 py-2.5 hover:bg-clay transition-colors"
        >
          + Add Product
        </Link>
      </div>
      <p className="text-[13px] text-ink-soft mb-6">
        {products.length} product{products.length !== 1 ? "s" : ""} total
      </p>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
        className="w-full max-w-xs border border-ink/20 px-3 py-2 text-[13px] mb-5 outline-none focus:border-clay transition-colors"
      />

      <div className="border border-ink/10 bg-white overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-ink/10 text-left text-ink-soft">
              <th className="px-4 py-3 font-normal">Product</th>
              <th className="px-4 py-3 font-normal">Category</th>
              <th className="px-4 py-3 font-normal">Price</th>
              <th className="px-4 py-3 font-normal">Stock</th>
              <th className="px-4 py-3 font-normal">Status</th>
              <th className="px-4 py-3 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-ink/5 last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element -- admin tooling only, images are arbitrary external URLs a real image loader wouldn't be configured for */}
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-10 h-12 object-cover bg-sand"
                    />
                    <span>{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-ink-soft">{p.category}</td>
                <td className="px-4 py-3">{formatNaira(p.price)}</td>
                <td className="px-4 py-3">
                  <span className={p.stock <= 5 ? "text-clay font-medium" : ""}>
                    {p.stock}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <ProductStatusBadge status={p.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-4">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="text-[12px] tracking-wide uppercase text-ink-soft hover:text-ink"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => setPendingDelete(p.id)}
                      className="text-[12px] tracking-wide uppercase text-ink-soft hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-soft">
                  No products match &ldquo;{query}&rdquo;.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pendingDelete && (
        <div className="fixed inset-0 z-50 bg-ink/40 flex items-center justify-center px-6">
          <div className="bg-white max-w-sm w-full p-6">
            <h3 className="font-display text-xl mb-2">Delete product?</h3>
            <p className="text-[13px] text-ink-soft mb-6">
              This can&apos;t be undone. The product will be removed from
              the storefront immediately.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setPendingDelete(null)}
                className="flex-1 border border-ink/20 py-2.5 text-[12px] tracking-wide uppercase hover:border-ink transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteProduct(pendingDelete);
                  setPendingDelete(null);
                }}
                className="flex-1 bg-red-700 text-white py-2.5 text-[12px] tracking-wide uppercase hover:bg-red-800 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
