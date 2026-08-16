"use client";

import { useState, type FormEvent } from "react";
import type { CollectionDraft } from "@/lib/actions/admin-collections";
import { slugify } from "@/lib/slug";

type Draft = CollectionDraft;

export default function CollectionForm({
  initial,
  existingSlugs,
  onSubmit,
  submitLabel,
  lockSlug = false,
}: {
  initial?: Draft;
  existingSlugs: string[];
  onSubmit: (draft: Draft) => void | Promise<void>;
  submitLabel: string;
  lockSlug?: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initial?.slug);
  const [season, setSeason] = useState(initial?.season ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [image, setImage] = useState(initial?.image ?? "");
  const [status, setStatus] = useState<CollectionDraft["status"]>(
    initial?.status ?? "coming-soon"
  );
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (v: string) => {
    setName(v);
    if (!slugTouched) setSlug(slugify(v));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Collection name is required.");
    const finalSlug = slugify(slug);
    if (!finalSlug) return setError("Slug is required.");
    if (
      !lockSlug &&
      existingSlugs.includes(finalSlug) &&
      finalSlug !== initial?.slug
    ) {
      return setError("That slug is already in use — pick another.");
    }
    if (!season.trim()) return setError("Season is required.");

    setError(null);
    onSubmit({
      name: name.trim(),
      slug: finalSlug,
      season: season.trim(),
      description: description.trim(),
      image:
        image.trim() ||
        "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=900&q=80",
      status,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl">
      <div className="grid gap-5">
        <div>
          <label className="block text-[12px] tracking-wide uppercase text-ink-soft mb-2">
            Collection Name
          </label>
          <input
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full border border-ink/20 px-3 py-2.5 text-sm outline-none focus:border-clay transition-colors"
            placeholder="e.g. Resort '25"
          />
        </div>

        <div>
          <label className="block text-[12px] tracking-wide uppercase text-ink-soft mb-2">
            Slug (URL)
          </label>
          <input
            value={slug}
            disabled={lockSlug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            className="w-full border border-ink/20 px-3 py-2.5 text-sm font-mono outline-none focus:border-clay transition-colors disabled:bg-sand/30 disabled:text-ink-soft"
            placeholder="resort-25"
          />
          <p className="text-[11px] text-ink-soft mt-1.5">
            /collections/{slugify(slug) || "your-slug"}
            {lockSlug && " — locked, this collection already has products linked to it"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-[12px] tracking-wide uppercase text-ink-soft mb-2">
              Season
            </label>
            <input
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="w-full border border-ink/20 px-3 py-2.5 text-sm outline-none focus:border-clay transition-colors"
              placeholder="Resort 2025"
            />
          </div>
          <div>
            <label className="block text-[12px] tracking-wide uppercase text-ink-soft mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as CollectionDraft["status"])
              }
              className="w-full border border-ink/20 px-3 py-2.5 text-sm outline-none focus:border-clay transition-colors bg-white"
            >
              <option value="available">Available</option>
              <option value="coming-soon">Coming Soon</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[12px] tracking-wide uppercase text-ink-soft mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full border border-ink/20 px-3 py-2.5 text-sm outline-none focus:border-clay transition-colors resize-none"
            placeholder="A short line about this collection..."
          />
        </div>

        <div>
          <label className="block text-[12px] tracking-wide uppercase text-ink-soft mb-2">
            Cover Image URL
          </label>
          <input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="w-full border border-ink/20 px-3 py-2.5 text-sm outline-none focus:border-clay transition-colors"
            placeholder="https://..."
          />
          <p className="text-[11px] text-ink-soft mt-1.5">
            Leave blank to use a placeholder image.
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
