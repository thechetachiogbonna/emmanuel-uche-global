"use client";

import Link from "next/link";
import { useState } from "react";
import EditCollectionForm from "@/components/admin/EditCollectionForm";
import DeleteProductButton from "@/components/admin/DeleteProductButton";

type Product = { id: string; name: string; price: string; img1: string; img2: string };
type Collection = {
  slug: string;
  name: string;
  season: string;
  description: string;
  image: string;
  status: "available" | "coming-soon";
  products: Product[];
};

export default function CollectionTabs({ collection }: { collection: Collection }) {
  const [tab, setTab] = useState<"products" | "details">("products");

  return (
    <div>
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

      {tab === "details" && <EditCollectionForm collection={collection} />}

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
                        <DeleteProductButton
                          productId={p.id}
                          collectionSlug={collection.slug}
                        />
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
    </div>
  );
}
