import Link from "next/link";
import { getAdminCollections } from "@/lib/admin/queries";
import { CollectionStatusBadge } from "@/components/admin/Badge";
import DeleteCollectionButton from "@/components/admin/DeleteCollectionButton";
import AddCollectionModal from "@/components/admin/AddCollectionModal";

export default async function CollectionsAdminPage() {
  const collections = await getAdminCollections();

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-2xl md:text-3xl">Collections</h1>
        <AddCollectionModal existingSlugs={collections.map((c) => c.slug)} />
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
                    <DeleteCollectionButton
                      slug={c.slug}
                      productCount={c.products.length}
                    />
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
    </div>
  );
}
