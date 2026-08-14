"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useAdminCollections } from "@/lib/admin/useAdminData";
import CollectionForm from "@/components/admin/CollectionForm";

export default function CollectionDetailPage() {
  const params = useParams<{ slug: string }>();
  const {
    collections,
    hydrated,
    updateCollection,
    deleteProduct,
  } = useAdminCollections();
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [tab, setTab] = useState<"products" | "details">("products");

  const collection = collections.find((c) => c.slug === params.slug);

  if (!hydrated) return null;

  if (!collection) {
    return (
      <div>
        <Link
          href="/admin/collections"
          className="text-[12px] tracking-wide uppercase text-ink-soft hover:text-ink"
        >
          ← Back to Collections
        </Link>
        <p className="mt-6 text-[14px] text-ink-soft">
          That collection doesn&apos;t exist — it may have been deleted or
          its slug changed.
        </p>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/admin/collections"
        className="text-[12px] tracking-wide uppercase text-ink-soft hover:text-ink"
      >
        ← Back to Collections
      </Link>
      <div className="flex items-center justify-between mt-3 mb-1">
        <h1 className="font-display text-2xl md:text-3xl">{collection.name}</h1>
        <Link
          href={`/collections/${collection.slug}`}
          target="_blank"
          className="text-[12px] tracking-wide uppercase text-clay hover:underline"
        >
          View Live ↗
        </Link>
      </div>
      <p className="text-[13px] text-ink-soft mb-6">
        {collection.season} · {collection.products.length} piece
        {collection.products.length !== 1 ? "s" : ""}
      </p>

      <div className="flex gap-2 mb-6 border-b border-ink/10">
        <button
          onClick={() => setTab("products")}
          className={`px-3 py-2.5 text-[12px] tracking-[0.1em] uppercase border-b-2 -mb-px transition-colors ${
            tab === "products"
              ? "border-clay text-ink"
              : "border-transparent text-ink-soft hover:text-ink"
          }`}
        >
          Products
        </button>
        <button
          onClick={() => setTab("details")}
          className={`px-3 py-2.5 text-[12px] tracking-[0.1em] uppercase border-b-2 -mb-px transition-colors ${
            tab === "details"
              ? "border-clay text-ink"
              : "border-transparent text-ink-soft hover:text-ink"
          }`}
        >
          Collection Details
        </button>
      </div>

      {tab === "details" && (
        <CollectionForm
          initial={collection}
          existingSlugs={collections.map((c) => c.slug)}
          lockSlug
          submitLabel="Save Changes"
          onSubmit={(draft) => {
            updateCollection(collection.slug, draft);
          }}
        />
      )}

      {tab === "products" && (
        <div>
          <div className="flex justify-end mb-4">
            <Link
              href={`/admin/collections/${collection.slug}/products/new`}
              className="bg-ink text-ivory text-[12px] tracking-[0.12em] uppercase px-4 py-2.5 hover:bg-clay transition-colors"
            >
              + Add Product
            </Link>
          </div>

          <div className="border border-ink/10 bg-white overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-ink/10 text-left text-ink-soft">
                  <th className="px-4 py-3 font-normal">Product</th>
                  <th className="px-4 py-3 font-normal">Price</th>
                  <th className="px-4 py-3 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {collection.products.map((p) => (
                  <tr key={p.id} className="border-b border-ink/5 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element -- admin tooling only, arbitrary external URLs */}
                        <img
                          src={p.img1}
                          alt={p.name}
                          className="w-10 h-12 object-cover bg-sand"
                        />
                        <span>{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{p.price}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-4">
                        <Link
                          href={`/admin/collections/${collection.slug}/products/${p.id}`}
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
                {collection.products.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-ink-soft">
                      No products in this collection yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pendingDelete && (
        <div className="fixed inset-0 z-50 bg-ink/40 flex items-center justify-center px-6">
          <div className="bg-white max-w-sm w-full p-6">
            <h3 className="font-display text-xl mb-2">Delete product?</h3>
            <p className="text-[13px] text-ink-soft mb-6">
              This can&apos;t be undone.
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
                  deleteProduct(collection.slug, pendingDelete);
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
