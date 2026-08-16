"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import CollectionForm from "@/components/admin/CollectionForm";
import { updateCollectionAction, type CollectionDraft } from "@/lib/actions/admin-collections";

export default function EditCollectionForm({
  collection,
}: {
  collection: CollectionDraft;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  return (
    <div>
      {error && <p className="text-[13px] text-red-700 mb-4">{error}</p>}
      {saved && <p className="text-[13px] text-green-800 mb-4">Saved ✓</p>}
      <CollectionForm
        initial={collection}
        existingSlugs={[]}
        lockSlug
        submitLabel="Save Changes"
        onSubmit={async (draft) => {
          setError(null);
          setSaved(false);
          const result = await updateCollectionAction(collection.slug, draft);
          if (!result.ok) {
            setError(result.error);
            return;
          }
          setSaved(true);
          router.refresh();
          setTimeout(() => setSaved(false), 2000);
        }}
      />
    </div>
  );
}
