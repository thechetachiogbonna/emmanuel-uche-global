"use client";

import {
  startTransition,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import MediaCarousel, { type MediaItem } from "@/components/MediaCarousel";
import type { ProductDraft } from "@/lib/actions/admin-collections";
import type { ProductMediaItem } from "@/lib/product-media";

type Draft = ProductDraft;
type SavedDraft = {
  version: 1;
  name: string;
  price: string;
  media: ProductMediaItem[];
  pendingDeletions: string[];
  uploadedMedia: string[];
};

function isSavedDraft(value: unknown): value is SavedDraft {
  if (!value || typeof value !== "object") return false;
  const draft = value as Record<string, unknown>;
  return (
    draft.version === 1 &&
    typeof draft.name === "string" &&
    typeof draft.price === "string" &&
    Array.isArray(draft.media) &&
    draft.media.every(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof item.src === "string" &&
        (item.type === "image" || item.type === "video")
    ) &&
    Array.isArray(draft.pendingDeletions) &&
    draft.pendingDeletions.every((src) => typeof src === "string") &&
    Array.isArray(draft.uploadedMedia) &&
    draft.uploadedMedia.every((src) => typeof src === "string")
  );
}

function getDefaultMedia(media: ProductMediaItem[] | undefined): ProductMediaItem[] {
  const savedMedia = Array.isArray(media) ? media.filter(Boolean) : [];
  return savedMedia.length ? savedMedia : [{ src: "", type: "image" }];
}

function getPriceDigits(value: string) {
  return value.replace(/\D/g, "");
}

function formatPriceDigits(digits: string) {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function ProductForm({
  initial,
  draftStorageKey,
  onSubmit,
  onSuccess,
  submitLabel,
}: {
  initial?: Draft;
  draftStorageKey: string;
  onSubmit: (draft: Draft) => boolean | Promise<boolean>;
  onSuccess?: () => void;
  submitLabel: string;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [price, setPrice] = useState(() =>
    getPriceDigits(initial?.price ?? "")
  );
  const [draftReady, setDraftReady] = useState(false);
  const [draftRestoreError, setDraftRestoreError] = useState<string | null>(null);
  const [draftSaveError, setDraftSaveError] = useState<string | null>(null);
  const [media, setMedia] = useState<ProductMediaItem[]>(() =>
    getDefaultMedia(initial?.media)
  );
  const [error, setError] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [pendingDeletions, setPendingDeletions] = useState<string[]>([]);
  const uploadedMedia = useRef(new Set<string>());
  const submissionSaved = useRef(false);
  const storageKey = `admin-product-draft:${draftStorageKey}`;
  const videoCount = media.filter((item) => item.type === "video").length;
  const previewMedia: MediaItem[] = media
    .filter((item) => item.src.trim())
    .map((item, index) => ({
      ...item,
      alt: `${name.trim() || "Product preview"} image ${index + 1}`,
    }));

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (!isSavedDraft(parsed)) {
          throw new Error("The saved product draft has an invalid format.");
        }

        startTransition(() => {
          setName(parsed.name);
          setPrice(getPriceDigits(parsed.price));
          setMedia(getDefaultMedia(parsed.media));
          setPendingDeletions(parsed.pendingDeletions);
          uploadedMedia.current = new Set(parsed.uploadedMedia);
        });
      }
    } catch {
      startTransition(() => {
        setDraftRestoreError(
          "The saved draft could not be restored. Your current changes will still be saved on this device."
        );
      });
    } finally {
      startTransition(() => setDraftReady(true));
    }
  }, [storageKey]);

  useEffect(() => {
    if (!draftReady || submissionSaved.current) return;

    try {
      const savedDraft: SavedDraft = {
        version: 1,
        name,
        price,
        media,
        pendingDeletions,
        uploadedMedia: [...uploadedMedia.current],
      };
      window.localStorage.setItem(storageKey, JSON.stringify(savedDraft));
      startTransition(() => setDraftSaveError(null));
    } catch {
      startTransition(() => {
        setDraftSaveError(
          "Could not save this draft on your device. Keep this page open until you create the product."
        );
      });
    }
  }, [draftReady, draftStorageKey, media, name, pendingDeletions, price, storageKey]);

  const updateMedia = (index: number, update: Partial<ProductMediaItem>) => {
    setMediaError(null);
    setMedia((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...update } : item
      )
    );
  };

  const addMedia = (type: ProductMediaItem["type"]) => {
    if (uploadingIndex !== null) {
      setMediaError("Wait for the current upload to finish before adding another media box.");
      return;
    }

    const emptyIndex = media.findIndex((item) => !item.src.trim());
    if (emptyIndex !== -1) {
      setMediaError(
        `Media box ${emptyIndex + 1} is empty. Upload a file or enter a media URL before adding another box.`
      );
      return;
    }

    setMediaError(null);
    setMedia((current) => [...current, { src: "", type }]);
  };

  const moveMedia = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= media.length) return;
    reorderMedia(index, targetIndex);
  };

  const reorderMedia = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setMedia((current) => {
      const reordered = [...current];
      const [movedItem] = reordered.splice(fromIndex, 1);
      reordered.splice(toIndex, 0, movedItem);
      return reordered;
    });
  };

  const deleteStoredMedia = async (src: string) => {
    let response: Response;
    try {
      response = await fetch("/api/admin/media-upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ src }),
      });
    } catch {
      throw new Error("Could not reach the app to remove media from storage. Check your connection and try again.");
    }

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result.error ?? "Could not remove media from storage.");
    }
    return result.deleted === true;
  };

  const removeMedia = async (index: number) => {
    const src = media[index].src.trim();
    setError(null);

    if (!src) {
      setMedia((current) => {
        const next = current.filter((_, itemIndex) => itemIndex !== index);
        return next.length ? next : [{ src: "", type: "image" }];
      });
      return;
    }

    setUploadingIndex(index);
    try {
      if (uploadedMedia.current.has(src)) {
        await deleteStoredMedia(src);
        uploadedMedia.current.delete(src);
      } else {
        setPendingDeletions((current) =>
          current.includes(src) ? current : [...current, src]
        );
      }
      setMedia((current) => {
        const next = current.filter((_, itemIndex) => itemIndex !== index);
        return next.length ? next : [{ src: "", type: "image" }];
      });
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : "Could not remove media."
      );
    } finally {
      setUploadingIndex(null);
    }
  };

  const uploadMedia = async (index: number, file: File) => {
    const previousSrc = media[index].src.trim();
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

      if (previousSrc && uploadedMedia.current.has(previousSrc)) {
        try {
          await deleteStoredMedia(previousSrc);
        } catch (deleteError) {
          let cleanupMessage = "";
          try {
            const deletedNewUpload = await deleteStoredMedia(signedUpload.publicUrl);
            if (!deletedNewUpload) {
              cleanupMessage = " The newly uploaded file could not be confirmed deleted.";
            }
          } catch (cleanupError) {
            cleanupMessage = ` The newly uploaded file could not be cleaned up: ${
              cleanupError instanceof Error ? cleanupError.message : "unknown storage error"
            }`;
          }
          throw new Error(
            `Could not replace the existing media: ${
              deleteError instanceof Error ? deleteError.message : "storage deletion failed"
            }${cleanupMessage}`
          );
        }
        uploadedMedia.current.delete(previousSrc);
      } else if (previousSrc) {
        setPendingDeletions((current) =>
          current.includes(previousSrc) ? current : [...current, previousSrc]
        );
      }

      uploadedMedia.current.add(signedUpload.publicUrl);
      updateMedia(index, { src: signedUpload.publicUrl });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Product name is required.");
    if (!price.trim()) return setError("Price is required.");
    if (!/^\d+$/.test(price)) {
      return setError("Enter the price using numbers only.");
    }
    if (Number(price) > 2_147_483_647) {
      return setError("Price must be less than ₦2,147,483,648.");
    }

    const cleanMedia = media.filter((item) => item.src.trim());
    const images = cleanMedia.filter((item) => item.type === "image");
    if (images.length === 0) return setError("Add at least one product image.");
    if (cleanMedia.filter((item) => item.type === "video").length > 2) {
      return setError("A product can have no more than two videos.");
    }

    setError(null);
    const draft = {
      name: name.trim(),
      price: price.trim(),
      media: cleanMedia.map((item) => ({ ...item, src: item.src.trim() })),
    };

    try {
      const saved = await onSubmit(draft);
      if (!saved) return;

      submissionSaved.current = true;
      uploadedMedia.current.clear();
      try {
        window.localStorage.removeItem(storageKey);
      } catch {
        setDraftSaveError(
          "The product was saved, but its local draft could not be cleared from this device."
        );
      }
      const mediaSources = new Set(draft.media.map((item) => item.src));
      const sourcesToDelete = pendingDeletions.filter(
        (src) => !mediaSources.has(src)
      );
      const failedDeletions: string[] = [];
      for (const src of sourcesToDelete) {
        try {
          await deleteStoredMedia(src);
        } catch {
          failedDeletions.push(src);
        }
      }
      setPendingDeletions(failedDeletions);

      if (failedDeletions.length > 0) {
        setError(
          `Product saved, but ${failedDeletions.length} removed media file${failedDeletions.length === 1 ? "" : "s"} could not be deleted from R2. Save again to retry.`
        );
        return;
      }

      onSuccess?.();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not save the product."
      );
    }
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
          <div className="flex w-full border border-ink/20 focus-within:border-clay transition-colors">
            <span className="flex items-center border-r border-ink/10 px-3 text-sm text-ink-soft">
              ₦
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={formatPriceDigits(price)}
              onChange={(e) => setPrice(getPriceDigits(e.target.value))}
              className="min-w-0 flex-1 px-3 py-2.5 text-sm outline-none"
              placeholder="165,000"
              aria-label="Price in Nigerian naira"
            />
          </div>
          <p className="text-[11px] text-ink-soft mt-1.5">
            Enter the amount in naira. Commas and the ₦ symbol are added automatically.
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
              <p className="mt-1 text-[11px] text-ink-soft">
                Your form changes and uploaded media are saved automatically on this device.
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <div className="flex gap-2">
                {(["image", "video"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => addMedia(type)}
                    disabled={type === "video" && videoCount >= 2}
                    className="border border-ink/20 px-2.5 py-2 text-[10px] uppercase tracking-wide hover:border-ink disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    + {type}
                  </button>
                ))}
              </div>
              {mediaError && (
                <p className="max-w-64 text-right text-[11px] text-red-700" role="alert">
                  {mediaError}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-3">
            {media.map((item, index) => (
              <div
                key={`${index}-${item.type}`}
                onDragOver={(event) => {
                  if (draggingIndex !== null && uploadingIndex === null) {
                    event.preventDefault();
                  }
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  if (draggingIndex !== null && uploadingIndex === null) {
                    reorderMedia(draggingIndex, index);
                  }
                  setDraggingIndex(null);
                }}
                className={`border border-ink/10 bg-white p-3 transition-opacity ${
                  draggingIndex === index ? "opacity-50" : ""
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span
                    draggable={uploadingIndex === null}
                    onDragStart={(event) => {
                      setDraggingIndex(index);
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", String(index));
                    }}
                    onDragEnd={() => setDraggingIndex(null)}
                    className="cursor-grab touch-none text-[10px] uppercase tracking-[0.12em] text-ink-soft active:cursor-grabbing"
                    title="Drag to reorder media"
                  >
                    &#8942;&#8942;{" "}
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
                      onClick={() => void removeMedia(index)}
                      disabled={uploadingIndex !== null}
                      aria-label={`Remove media ${index + 1}`}
                      className="h-7 w-7 text-ink-soft hover:text-red-700"
                    >
                      &times;
                    </button>
                  </div>
                </div>
                <div className="grid min-w-0 gap-3">
                  <select
                        aria-label={`Media type ${index + 1}`}
                        value={item.type}
                        disabled={uploadingIndex !== null || Boolean(item.src.trim())}
                        title={item.src.trim() ? "Remove this item and add a new one to change its type" : undefined}
                        onChange={(event) => {
                          if (item.src.trim()) return;
                          updateMedia(index, {
                            type: event.target.value as ProductMediaItem["type"],
                          });
                        }}
                        className="w-full border border-ink/20 bg-white px-2.5 py-2 text-xs outline-none focus:border-clay sm:w-40"
                      >
                        <option value="image">Image</option>
                        <option value="video" disabled={item.type !== "video" && videoCount >= 2}>Video</option>
                  </select>
                    <div className="rounded border border-ink/15 bg-ivory p-3">
                      <label
                        htmlFor={`media-url-${index}`}
                        className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-ink"
                      >
                        Add {item.type} by URL
                      </label>
                      <p className="mt-1 text-[11px] text-ink-soft">
                        Paste a direct link to your {item.type} below.
                      </p>
                      <input
                        id={`media-url-${index}`}
                        value={item.src}
                        onChange={(event) =>
                          updateMedia(index, { src: event.target.value })
                        }
                        disabled={uploadingIndex !== null}
                        className="mt-2 w-full min-w-0 border border-ink/25 bg-white px-3 py-2.5 text-sm outline-none transition-colors focus:border-ink"
                        placeholder="https://example.com/your-media"
                        aria-label={`${item.type} URL ${index + 1}`}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-wide text-ink-soft">
                      <span className="h-px flex-1 bg-ink/10" />
                      Or upload a file
                      <span className="h-px flex-1 bg-ink/10" />
                    </div>
                    {item.src.trim() && (
                      <p className="text-[10px] text-ink-soft">
                        To change the media type, remove this item and add a new image or video.
                      </p>
                    )}

                    {item.src.trim() ? (
                      <div className="overflow-hidden rounded border border-ink/10 bg-sand">
                        <div className="relative aspect-[4/3] w-full overflow-hidden">
                          {item.type === "video" ? (
                            <video
                              src={item.src}
                              controls
                              className="h-full w-full object-cover"
                              preload="metadata"
                            />
                          ) : (
                            <div
                              aria-label={`${item.type} ${index + 1}`}
                              className="h-full w-full bg-cover bg-center"
                              style={{ backgroundImage: `url(${item.src})` }}
                            />
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex min-h-24 items-center justify-center border border-dashed border-ink/20 bg-sand px-3 text-center text-[11px] uppercase tracking-[0.12em] text-ink-soft">
                        No {item.type} selected
                      </div>
                    )}

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
                        {uploadingIndex === index ? "Uploading..." : `Choose ${item.type} file`}
                      </span>
                      <span>Max 20 MB image / 100 MB video</span>
                  </label>
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
                  {price ? `₦${formatPriceDigits(price)}` : "Price"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {error && <p className="text-[13px] text-red-700">{error}</p>}
        {draftRestoreError && (
          <p className="text-[12px] text-red-700" role="alert">
            {draftRestoreError}
          </p>
        )}
        {draftSaveError && (
          <p className="text-[12px] text-red-700" role="alert">
            {draftSaveError}
          </p>
        )}

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
