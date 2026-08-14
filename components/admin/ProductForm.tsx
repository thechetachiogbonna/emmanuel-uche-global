"use client";

import { useState, type FormEvent } from "react";
import type { AdminProduct } from "@/lib/admin/types";

type Draft = Omit<AdminProduct, "id">;

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=700&q=80";

export default function ProductForm({
  initial,
  onSubmit,
  submitLabel,
}: {
  initial?: Draft;
  onSubmit: (draft: Draft) => void;
  submitLabel: string;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [price, setPrice] = useState(initial?.price ?? "");
  const [img1, setImg1] = useState(initial?.img1 ?? "");
  const [img2, setImg2] = useState(initial?.img2 ?? "");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Product name is required.");
    if (!price.trim()) return setError("Price is required.");
    if (!/^₦[\d,]+$/.test(price.trim())) {
      return setError('Price should look like "₦165,000" — include the ₦ symbol.');
    }

    setError(null);
    onSubmit({
      name: name.trim(),
      price: price.trim(),
      img1: img1.trim() || PLACEHOLDER,
      img2: img2.trim() || img1.trim() || PLACEHOLDER,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl">
      <div className="grid gap-5">
        <div>
          <label className="block text-[12px] tracking-wide uppercase text-ink-soft mb-2">
            Product Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-ink/20 px-3 py-2.5 text-sm outline-none focus:border-clay transition-colors"
            placeholder="e.g. Àdìrẹ́ Wrap Dress"
          />
        </div>

        <div>
          <label className="block text-[12px] tracking-wide uppercase text-ink-soft mb-2">
            Price
          </label>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full border border-ink/20 px-3 py-2.5 text-sm outline-none focus:border-clay transition-colors"
            placeholder="₦165,000"
          />
          <p className="text-[11px] text-ink-soft mt-1.5">
            Matches how it&apos;ll display on the site — include the ₦ and
            commas.
          </p>
        </div>

        <div>
          <label className="block text-[12px] tracking-wide uppercase text-ink-soft mb-2">
            Primary Image URL
          </label>
          <input
            value={img1}
            onChange={(e) => setImg1(e.target.value)}
            className="w-full border border-ink/20 px-3 py-2.5 text-sm outline-none focus:border-clay transition-colors"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="block text-[12px] tracking-wide uppercase text-ink-soft mb-2">
            Hover / Detail Image URL
          </label>
          <input
            value={img2}
            onChange={(e) => setImg2(e.target.value)}
            className="w-full border border-ink/20 px-3 py-2.5 text-sm outline-none focus:border-clay transition-colors"
            placeholder="https://..."
          />
          <p className="text-[11px] text-ink-soft mt-1.5">
            Shown on hover in the product grid. Leave blank to reuse the
            primary image.
          </p>
        </div>

        {error && <p className="text-[13px] text-red-700">{error}</p>}

        <button
          type="submit"
          className="mt-2 bg-ink text-ivory text-[12px] tracking-[0.14em] uppercase py-3 hover:bg-clay transition-colors"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
