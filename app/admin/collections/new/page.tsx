"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import CollectionForm from "@/components/admin/CollectionForm";
import { createCollectionAction } from "@/lib/actions/admin-collections";

export default function NewCollectionPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
      {error && <p className="text-[13px] text-red-700 mb-4">{error}</p>}
      <CollectionForm
        submitLabel={submitting ? "Creating…" : "Create Collection"}
        existingSlugs={[]}
        onSubmit={async (draft) => {
          setSubmitting(true);
          setError(null);
          const result = await createCollectionAction(draft);
          setSubmitting(false);
          if (!result.ok) {
            setError(result.error);
            return;
          }
          router.push(`/admin/collections/${result.data.slug}`);
          router.refresh();
        }}
      />
    </div>
  );
}
