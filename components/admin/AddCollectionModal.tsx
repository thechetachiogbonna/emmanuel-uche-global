"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import CollectionForm from "@/components/admin/CollectionForm";
import { createCollectionAction } from "@/lib/actions/admin-collections";

export default function AddCollectionModal({
  existingSlugs,
}: {
  existingSlugs: string[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const close = () => {
    setOpen(false);
    setError(null);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-ink text-ivory text-[12px] tracking-[0.12em] uppercase px-4 py-2.5 hover:bg-clay transition-colors"
      >
        + Add Collection
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-collection-title"
            className="relative w-full max-w-lg bg-white p-6 md:p-8"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close add collection dialog"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center text-2xl text-ink-soft hover:text-ink"
            >
              ×
            </button>

            <h2
              id="add-collection-title"
              className="mb-6 pr-10 font-display text-2xl"
            >
              Add Collection
            </h2>
            {error && <p className="mb-4 text-[13px] text-red-700">{error}</p>}
            <CollectionForm
              submitLabel={submitting ? "Creating…" : "Create Collection"}
              existingSlugs={existingSlugs}
              disabled={submitting}
              onSubmit={async (draft) => {
                setSubmitting(true);
                setError(null);
                try {
                  const result = await createCollectionAction(draft);
                  if (!result.ok) {
                    setError(result.error);
                    return;
                  }
                  close();
                  router.push(`/admin/collections/${result.data.slug}`);
                  router.refresh();
                } finally {
                  setSubmitting(false);
                }
              }}
            />
          </section>
        </div>
      )}
    </>
  );
}
