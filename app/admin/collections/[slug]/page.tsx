import Link from "next/link";
import { getAdminCollections } from "@/lib/admin/queries";
import CollectionTabs from "@/components/admin/CollectionTabs";

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collections = await getAdminCollections();
  const collection = collections.find((c) => c.slug === slug);

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

      <CollectionTabs collection={collection} />
    </div>
  );
}
