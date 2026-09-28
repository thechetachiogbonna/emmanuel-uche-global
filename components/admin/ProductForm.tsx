"use client";

import { useState, type FormEvent } from "react";
import MediaCarousel, { type MediaItem } from "@/components/MediaCarousel";
import type { ProductDraft } from "@/lib/actions/admin-collections";
import type { ProductMediaItem } from "@/lib/product-media";

type Draft = ProductDraft;

export default function ProductForm({
  initial,
  onSubmit,
  submitLabel,
}: {
  initial?: Draft;
  onSubmit: (draft: Draft) => void | Promise<void>;
  submitLabel: string;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [price, setPrice] = useState(initial?.price ?? "");
  const [media, setMedia] = useState<ProductMediaItem[]>(() => {
    const savedMedia = initial?.media ?? [];
    return savedMedia.length ? savedMedia : [{ src: "", type: "image" }];
  });
  const [error, setError] = useState<string | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const videoCount = media.filter((item) => item.type === "video").length;
  const previewMedia: MediaItem[] = media
    .filter((item) => item.src.trim())
    .map((item, index) => ({
      ...item,
      alt: `${name.trim() || "Product preview"} image ${index + 1}`,
    }));

  const updateMedia = (index: number, update: Partial<ProductMediaItem>) => {
    setMedia((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...update } : item
      )
    );
  };

  const moveMedia = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= media.length) return;
    setMedia((current) => {
      const reordered = [...current];
      [reordered[index], reordered[targetIndex]] = [
        reordered[targetIndex],
        reordered[index],
      ];
      return reordered;
    });
  };

  const uploadMedia = async (index: number, file: File) => {
    setError(null);
    setUploadingIndex(index);
    try {
      let response: Response;
      try {
        response = await fetch("/api/admin/media-upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contentType: file.type,
            size: file.size,
            mediaType: media[index].type,
          }),
        });
      } catch {
        throw new Error("Could not reach the app upload endpoint. Check your connection and sign-in, then try again.");
      }
      const signedUpload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(signedUpload.error ?? "Could not prepare upload.");

      let uploadResponse: Response;
      try {
        uploadResponse = await fetch(signedUpload.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });
      } catch {
        throw new Error("Could not reach R2. Check bucket CORS allows this site origin, PUT, and the Content-Type header.");
      }
      if (!uploadResponse.ok) {
        throw new Error(`R2 rejected the upload (${uploadResponse.status}). Check the bucket, token permissions, and signed upload settings.`);
      }

      updateMedia(index, { src: signedUpload.publicUrl });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Product name is required.");
    if (!price.trim()) return setError("Price is required.");
    if (!/^₦[\d,]+$/.test(price.trim())) {
      return setError('Price should look like "₦165,000" — include the ₦ symbol.');
    }

    const cleanMedia = media.filter((item) => item.src.trim());
    const images = cleanMedia.filter((item) => item.type === "image");
    if (images.length === 0) return setError("Add at least one product image.");
    if (cleanMedia.filter((item) => item.type === "video").length > 2) {
      return setError("A product can have no more than two videos.");
    }

    setError(null);
    onSubmit({
      name: name.trim(),
      price: price.trim(),
      media: cleanMedia.map((item) => ({ ...item, src: item.src.trim() })),
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
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-[12px] tracking-wide uppercase text-ink-soft">
                Product Media
              </h2>
              <p className="mt-1 text-[11px] text-ink-soft">
                Add images or videos and arrange their display order.
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              {(["image", "video"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setMedia((current) => [...current, { src: "", type }])}
                  disabled={type === "video" && videoCount >= 2}
                  className="border border-ink/20 px-2.5 py-2 text-[10px] uppercase tracking-wide hover:border-ink disabled:cursor-not-allowed disabled:opacity-40"
                >
                  + {type}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3">
            {media.map((item, index) => (
              <div key={`${index}-${item.type}`} className="border border-ink/10 bg-white p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.12em] text-ink-soft">
                    {item.type} {index + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveMedia(index, -1)}
                      disabled={index === 0 || uploadingIndex !== null}
                      aria-label={`Move media ${index + 1} up`}
                      className="h-7 w-7 text-ink-soft hover:text-ink disabled:opacity-30"
                    >
                      &#8593;
                    </button>
                    <button
                      type="button"
                      onClick={() => moveMedia(index, 1)}
                      disabled={index === media.length - 1 || uploadingIndex !== null}
                      aria-label={`Move media ${index + 1} down`}
                      className="h-7 w-7 text-ink-soft hover:text-ink disabled:opacity-30"
                    >
                      &#8595;
                    </button>
                    <button
                      type="button"
                      onClick={() => setMedia((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                      disabled={uploadingIndex !== null}
                      aria-label={`Remove media ${index + 1}`}
                      className="h-7 w-7 text-ink-soft hover:text-red-700"
                    >
                      &times;
                    </button>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-[110px_1fr]">
                  <div className="grid min-w-0 gap-2">
                    <div className="grid gap-2 sm:grid-cols-[110px_1fr]">
                      <select
                        aria-label={`Media type ${index + 1}`}
                        value={item.type}
                        disabled={uploadingIndex !== null}
                        onChange={(event) => updateMedia(index, { type: event.target.value as ProductMediaItem["type"], src: "" })}
                        className="border border-ink/20 bg-white px-2.5 py-2 text-xs outline-none focus:border-clay"
                      >
                        <option value="image">Image</option>
                        <option value="video" disabled={item.type !== "video" && videoCount >= 2}>Video</option>
                      </select>
                      <input
                        value={item.src}
                        onChange={(event) => updateMedia(index, { src: event.target.value })}
                        disabled={uploadingIndex !== null}
                        className="min-w-0 border border-ink/20 px-3 py-2 text-sm outline-none focus:border-clay"
                        placeholder={item.type === "video" ? "Paste a video URL or upload a file" : "Paste an image URL or upload a file"}
                        aria-label={`${item.type} URL ${index + 1}`}
                      />
                    </div>
                    <label className={`flex cursor-pointer items-center gap-2 text-[11px] text-ink-soft hover:text-ink ${uploadingIndex !== null ? "pointer-events-none opacity-50" : ""}`}>
                      <input
                        type="file"
                        accept={item.type === "video" ? "video/mp4,video/webm,video/quicktime" : "image/jpeg,image/png,image/webp,image/avif"}
                        className="sr-only"
                        disabled={uploadingIndex !== null}
                        onChange={(event) => {
                          const file = event.currentTarget.files?.[0];
                          if (file) void uploadMedia(index, file);
                          event.currentTarget.value = "";
                        }}
                      />
                      <span className="border border-ink/20 px-2.5 py-1.5 uppercase tracking-wide">
                        {uploadingIndex === index ? "Uploading..." : `Upload ${item.type}`}
                      </span>
                      <span>{item.src.startsWith("http") ? "File ready" : "Max 20 MB image / 100 MB video"}</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-ink/10 pt-5">
            <h3 className="mb-3 text-[11px] uppercase tracking-[0.14em] text-ink-soft">
              Live Preview
            </h3>
            <div className="w-full max-w-70">
              <div className="relative aspect-10/13 overflow-hidden bg-sand">
                {previewMedia.length ? (
                  <MediaCarousel
                    items={previewMedia}
                    label={`${name.trim() || "Product"} live preview`}
                    variant="product"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-6 text-center text-xs text-ink-soft">
                    Add media to preview the product card.
                  </div>
                )}
              </div>
              <div className="mt-3 flex items-start justify-between gap-3">
                <span className="min-w-0 text-sm">
                  {name.trim() || "Product name"}
                </span>
                <span className="shrink-0 text-[13px] text-clay">
                  {price.trim() || "Price"}
                </span>
              </div>
            </div>
          </div>
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
