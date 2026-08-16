"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProductAction } from "@/lib/actions/admin-collections";

export default function DeleteProductButton({
  productId,
  collectionSlug,
}: {
  productId: string;
  collectionSlug: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await deleteProductAction(productId, collectionSlug);
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-[12px] tracking-wide uppercase text-ink-soft hover:text-red-700"
      >
        Delete
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-ink/40 flex items-center justify-center px-6"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white max-w-sm w-full p-6"
          >
            <h3 className="font-display text-xl mb-2">Delete product?</h3>
            <p className="text-[13px] text-ink-soft mb-6">
              This can&apos;t be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 border border-ink/20 py-2.5 text-[12px] tracking-wide uppercase hover:border-ink transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={pending}
                className="flex-1 bg-red-700 text-white py-2.5 text-[12px] tracking-wide uppercase hover:bg-red-800 transition-colors disabled:opacity-60"
              >
                {pending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
