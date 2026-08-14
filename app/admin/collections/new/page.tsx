"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import CollectionForm from "@/components/admin/CollectionForm";
import { useAdminCollections } from "@/lib/admin/useAdminData";

export default function NewCollectionPage() {
  const router = useRouter();
  const { collections, addCollection } = useAdminCollections();

  return (
    <div>
      <Link
        href="/admin/collections"
        className="text-[12px] tracking-wide uppercase text-ink-soft hover:text-ink"
      >
        ← Back to Collections
      </Link>
      <h1 className="font-display text-2xl md:text-3xl mt-3 mb-6">
        Add Collection
      </h1>
      <CollectionForm
        submitLabel="Create Collection"
        existingSlugs={collections.map((c) => c.slug)}
        onSubmit={(draft) => {
          addCollection({ ...draft, products: [] });
          router.push(`/admin/collections/${draft.slug}`);
        }}
      />
    </div>
  );
}
