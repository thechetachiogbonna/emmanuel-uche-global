"use client";

import Link from "next/link";
import { useState } from "react";
import { useAdminCollections } from "@/lib/admin/useAdminData";
import { CollectionStatusBadge } from "@/components/admin/Badge";

export default function CollectionsAdminPage() {
  const { collections, deleteCollection } = useAdminCollections();
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-2xl md:text-3xl">Collections</h1>
        <Link
          href="/admin/collections/new"
          className="bg-ink text-ivory text-[12px] tracking-[0.12em] uppercase px-4 py-2.5 hover:bg-clay transition-colors"
        >
          + Add Collection
        </Link>
      </div>
      <p className="text-[13px] text-ink-soft mb-6">
        {collections.length} collection{collections.length !== 1 ? "s" : ""}{" "}
        total
      </p>

      <div className="border border-ink/10 bg-white overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-ink/10 text-left text-ink-soft">
              <th className="px-4 py-3 font-normal">Collection</th>
              <th className="px-4 py-3 font-normal">Season</th>
              <th className="px-4 py-3 font-normal">Pieces</th>
              <th className="px-4 py-3 font-normal">Status</th>
              <th className="px-4 py-3 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {collections.map((c) => (
              <tr key={c.slug} className="border-b border-ink/5 last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element -- admin tooling only, arbitrary external URLs */}
                    <img
                      src={c.image}
                      alt={c.name}
                      className="w-10 h-12 object-cover bg-sand"
                    />
                    <div>
                      <div>{c.name}</div>
                      <div className="text-[11px] text-ink-soft font-mono">
                        /{c.slug}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-ink-soft">{c.season}</td>
                <td className="px-4 py-3">{c.products.length}</td>
                <td className="px-4 py-3">
                  <CollectionStatusBadge status={c.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-4">
                    <Link
                      href={`/admin/collections/${c.slug}`}
                      className="text-[12px] tracking-wide uppercase text-ink-soft hover:text-ink"
                    >
                      Manage
                    </Link>
                    <button
                      onClick={() => setPendingDelete(c.slug)}
                      className="text-[12px] tracking-wide uppercase text-ink-soft hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {collections.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink-soft">
                  No collections yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pendingDelete && (
        <div className="fixed inset-0 z-50 bg-ink/40 flex items-center justify-center px-6">
          <div className="bg-white max-w-sm w-full p-6">
            <h3 className="font-display text-xl mb-2">Delete collection?</h3>
            <p className="text-[13px] text-ink-soft mb-6">
              This removes the collection and all {" "}
              {collections.find((c) => c.slug === pendingDelete)?.products
                .length ?? 0}{" "}
              of its products. This can&apos;t be undone.
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
                  deleteCollection(pendingDelete);
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
