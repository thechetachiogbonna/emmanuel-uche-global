"use client";

import {
  startTransition,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import Image from "next/image";
import MediaCarousel, { type MediaItem } from "@/components/MediaCarousel";
import type { ProductDraft } from "@/lib/actions/admin-collections";
import type { ProductMediaItem } from "@/lib/product-media";

type Draft = ProductDraft;
const MOCKUP_BACKGROUNDS = [
  {
    id: "1",
    label: "Painted wall & gray mannequin",
    src: "/images/master_reference_bg_1.jpg",
  },
  {
    id: "2",
    label: "Blue geometric wall & black mannequin",
    src: "/images/master_reference_bg_2.jpg",
  },
] as const;

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

type SavedDraft = {
  version: 1 | 2;
  name: string;
  price: string;
  description?: string;
  sizes?: string[];
  media: ProductMediaItem[];
  pendingDeletions: string[];
  uploadedMedia: string[];
};

function isSavedDraft(value: unknown): value is SavedDraft {
  if (!value || typeof value !== "object") return false;
  const draft = value as Record<string, unknown>;
  return (
    (draft.version === 1 || draft.version === 2) &&
    typeof draft.name === "string" &&
    typeof draft.price === "string" &&
    (draft.description === undefined || typeof draft.description === "string") &&
    (draft.sizes === undefined ||
      (Array.isArray(draft.sizes) &&
        draft.sizes.every((size) => typeof size === "string"))) &&
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
  const [isGeneratingName, setIsGeneratingName] = useState(false);
  const [nameGenerationError, setNameGenerationError] = useState<string | null>(null);
  const [price, setPrice] = useState(() =>
    getPriceDigits(initial?.price ?? "")
  );
  const [description, setDescription] = useState(initial?.description ?? "");
  const [descriptionInstructions, setDescriptionInstructions] = useState("");
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [descriptionGenerationError, setDescriptionGenerationError] = useState<string | null>(null);
  const [sizesText, setSizesText] = useState(
    () => initial?.sizes.join(", ") ?? ""
  );
  const [draftReady, setDraftReady] = useState(false);
  const [draftRestoreError, setDraftRestoreError] = useState<string | null>(null);
  const [draftSaveError, setDraftSaveError] = useState<string | null>(null);
  const [media, setMedia] = useState<ProductMediaItem[]>(() =>
    getDefaultMedia(initial?.media)
  );
  const [error, setError] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmittedSuccessfully, setHasSubmittedSuccessfully] = useState(false);
  const [isGeneratingMockup, setIsGeneratingMockup] = useState(false);
  const [mockupView, setMockupView] = useState<"front" | "back">("front");
  const [mockupBackground, setMockupBackground] = useState<"1" | "2">("1");
  const [mockupError, setMockupError] = useState<string | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [pendingDeletions, setPendingDeletions] = useState<string[]>([]);
  const uploadedMedia = useRef(new Set<string>());
  const submissionInProgress = useRef(false);
  const submissionSaved = useRef(false);
  const isFormLocked =
    isSubmitting || hasSubmittedSuccessfully || isGeneratingMockup;
  const storageKey = `admin-product-draft:${draftStorageKey}`;
  const videoCount = media.filter((item) => item.type === "video").length;
  const previewMedia: MediaItem[] = media
    .filter((item) => item.src.trim())
    .map((item, index) => ({
      ...item,
      alt: `${name.trim() || "Product preview"} image ${index + 1}`,
    }));

  const generateName = async () => {
    const images = media.filter((item) => item.type === "image" && item.src.trim());
    if (images.length === 0) {
      setNameGenerationError("Add at least one product image before generating a name.");
      return;
    }

    setIsGeneratingName(true);
    setNameGenerationError(null);
    try {
      const response = await fetch("/api/admin/product-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: "name", media: images }),
      });
      const result: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message =
          result &&
          typeof result === "object" &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "Could not generate a product name. Try again.";
        throw new Error(message);
      }
      if (
        !result ||
        typeof result !== "object" ||
        !("name" in result) ||
        typeof result.name !== "string" ||
        !result.name.trim()
      ) {
        throw new Error("The AI service returned an invalid product name. Try again.");
      }

      setName(result.name.trim());
    } catch (generationError) {
      setNameGenerationError(
        generationError instanceof Error
          ? generationError.message
          : "Could not generate a product name. Try again."
      );
    } finally {
      setIsGeneratingName(false);
    }
  };

  const generateDescription = async () => {
    if (!name.trim()) {
      setDescriptionGenerationError("Enter a product name before generating a description.");
      return;
    }

    const images = media.filter((item) => item.type === "image" && item.src.trim());
    if (images.length === 0) {
      setDescriptionGenerationError("Add at least one product image before generating a description.");
      return;
    }

    setIsGeneratingDescription(true);
    setDescriptionGenerationError(null);
    try {
      const response = await fetch("/api/admin/product-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "description",
          name: name.trim(),
          instructions: descriptionInstructions.trim(),
          media: images,
        }),
      });
      const result: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message =
          result &&
          typeof result === "object" &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "Could not generate a product description. Try again.";
        throw new Error(message);
      }
      if (
        !result ||
        typeof result !== "object" ||
        !("description" in result) ||
        typeof result.description !== "string" ||
        !result.description.trim()
      ) {
        throw new Error("The AI service returned an invalid description. Try again.");
      }

      setDescription(result.description.trim());
    } catch (generationError) {
      setDescriptionGenerationError(
        generationError instanceof Error
          ? generationError.message
          : "Could not generate a product description. Try again."
      );
    } finally {
      setIsGeneratingDescription(false);
    }
  };

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
          setDescription(parsed.description ?? "");
          setSizesText(parsed.sizes?.join(", ") ?? "");
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
        version: 2,
        name,
        price,
        description,
        sizes: sizesText.split(",").map((size) => size.trim()).filter(Boolean),
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
  }, [description, draftReady, draftStorageKey, media, name, pendingDeletions, price, sizesText, storageKey]);

  useEffect(() => {
    if (draggingIndex === null || isFormLocked || uploadingIndex !== null) {
      return;
    }

    const edgeSize = 100;
    const maxScrollStep = 20;
    const handleDragOver = (event: DragEvent) => {
      const distanceFromTop = event.clientY;
      const distanceFromBottom = window.innerHeight - event.clientY;

      if (distanceFromTop < edgeSize) {
        const step = Math.ceil(
          ((edgeSize - distanceFromTop) / edgeSize) * maxScrollStep
        );
        window.scrollBy({ top: -step, behavior: "instant" });
      } else if (distanceFromBottom < edgeSize) {
        const step = Math.ceil(
          ((edgeSize - distanceFromBottom) / edgeSize) * maxScrollStep
        );
        window.scrollBy({ top: step, behavior: "instant" });
      }
    };

    window.addEventListener("dragover", handleDragOver);
    return () => window.removeEventListener("dragover", handleDragOver);
  }, [draggingIndex, isFormLocked, uploadingIndex]);

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

  const generateMockup = async (file: File) => {
    setMockupError(null);
    if (!IMAGE_TYPES.has(file.type)) {
      setMockupError("Choose a JPEG, PNG, WebP, or AVIF shirt image.");
      return;
    }
    if (file.size <= 0 || file.size > 20 * 1024 * 1024) {
      setMockupError("Shirt images must be smaller than 20 MB.");
      return;
    }

    setIsGeneratingMockup(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("sku", name.trim() || "shirt-product");
      formData.set("view", mockupView);
      formData.set("background", mockupBackground);

      const response = await fetch("/api/admin/process-shirt", {
        method: "POST",
        body: formData,
      });
      const result: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message =
          result &&
          typeof result === "object" &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "Could not generate an apparel mockup. Try again.";
        throw new Error(message);
      }
      const url =
        result && typeof result === "object" && "url" in result
          ? result.url
          : null;
      if (typeof url !== "string" || !url.trim()) {
        throw new Error("The image service returned an invalid mockup URL.");
      }

      setMedia((current) => [
        ...current,
        { src: url, type: "image" },
      ]);
      uploadedMedia.current.add(url);
      setMediaError(null);
    } catch (processingError) {
      setMockupError(
        processingError instanceof Error
          ? processingError.message
          : "Could not generate an apparel mockup. Try again."
      );
    } finally {
      setIsGeneratingMockup(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submissionInProgress.current || submissionSaved.current) return;
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
    submissionInProgress.current = true;
    setIsSubmitting(true);
    const draft = {
      name: name.trim(),
      price: price.trim(),
      description: description.trim(),
      sizes: sizesText.split(",").map((size) => size.trim()).filter(Boolean),
      media: cleanMedia.map((item) => ({ ...item, src: item.src.trim() })),
    };

    try {
      const saved = await onSubmit(draft);
      if (!saved) return;

      submissionSaved.current = true;
      setHasSubmittedSuccessfully(true);
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
          `Product saved, but ${failedDeletions.length} removed media file${failedDeletions.length === 1 ? "" : "s"} could not be deleted from R2.`
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
    } finally {
      submissionInProgress.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl">
      <fieldset
        disabled={isFormLocked}
        className="m-0 grid min-w-0 gap-5 border-0 p-0"
      >
        <div>
          <label
            htmlFor="product-name"
            className="block text-[12px] tracking-wide uppercase text-ink-soft mb-2"
          >
            Product Name
          </label>
          <input
            id="product-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
                event.preventDefault();
                void generateName();
              }
            }}
            aria-busy={isGeneratingName}
            className="w-full border border-ink/20 px-3 py-2.5 text-sm outline-none focus:border-clay transition-colors"
            placeholder="e.g. Àdìrẹ́ Wrap Dress"
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-[10px] text-ink-soft">
              Uses uploaded JPEG, PNG, or WebP image URLs. Ctrl/⌘ + Enter to generate.
            </p>
            <button
              type="button"
              onClick={() => void generateName()}
              disabled={
                isGeneratingName ||
                isGeneratingDescription ||
                isFormLocked ||
                uploadingIndex !== null
              }
              className="flex shrink-0 items-center gap-2 bg-[#705985] px-3 py-2 text-[11px] font-medium text-white transition-colors hover:bg-[#604975] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGeneratingName ? (
                <span
                  aria-hidden="true"
                  className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"
                />
              ) : (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 2.5 11.8 8l5.7 2-5.7 2-1.8 5.5L8.2 12 2.5 10l5.7-2L10 2.5Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m15.5 2 .7 2.1 2.3.9-2.3.8-.7 2.2-.8-2.2-2.2-.8 2.2-.9.8-2.1Z"
                  />
                </svg>
              )}
              {isGeneratingName ? "Naming..." : "Generate name"}
            </button>
          </div>
          {nameGenerationError && (
            <p className="mt-2 text-[12px] text-red-700" role="alert">
              {nameGenerationError}
            </p>
          )}
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
          <div className="mb-2 flex items-center justify-between gap-3">
            <label
              htmlFor="product-description"
              className="block text-[12px] tracking-wide uppercase text-ink-soft"
            >
              Product Description
            </label>
            <span className="text-[10px] uppercase tracking-wide text-ink-soft">
              AI assisted
            </span>
          </div>
          <textarea
            id="product-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
                event.preventDefault();
                void generateDescription();
              }
            }}
            rows={5}
            maxLength={10_000}
            aria-busy={isGeneratingDescription}
            className="w-full resize-y border border-ink/20 px-3 py-2.5 text-sm outline-none transition-colors focus:border-clay"
            placeholder="Describe the visible colours, print, and design details."
          />
          <div className="mt-3 border border-ink/10 bg-white p-2.5">
            <label htmlFor="description-ai-prompt" className="sr-only">
              Optional AI writing instructions
            </label>
            <input
              id="description-ai-prompt"
              value={descriptionInstructions}
              onChange={(event) => setDescriptionInstructions(event.target.value)}
              maxLength={1000}
              disabled={isGeneratingDescription || isGeneratingName}
              placeholder="Message (optional): add guidance for the description..."
              className="w-full bg-transparent px-1 py-1.5 text-[12px] outline-none placeholder:text-ink-soft/60"
            />
            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="text-[10px] text-ink-soft">
                Review the draft before saving. Ctrl/⌘ + Enter to generate.
              </p>
              <button
                type="button"
                onClick={() => void generateDescription()}
                disabled={
                  isGeneratingDescription ||
                  isGeneratingName ||
                  isFormLocked ||
                  uploadingIndex !== null
                }
                className="flex shrink-0 items-center gap-2 bg-[#705985] px-3 py-2.5 text-[11px] font-medium text-white transition-colors hover:bg-[#604975] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGeneratingDescription ? (
                  <span
                    aria-hidden="true"
                    className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"
                  />
                ) : (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 2.5 11.8 8l5.7 2-5.7 2-1.8 5.5L8.2 12 2.5 10l5.7-2L10 2.5Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m15.5 2 .7 2.1 2.3.9-2.3.8-.7 2.2-.8-2.2-2.2-.8 2.2-.9.8-2.1Z"
                    />
                  </svg>
                )}
                {isGeneratingDescription ? "Generating..." : "Generate description"}
              </button>
            </div>
          </div>
          {descriptionGenerationError && (
            <p className="mt-2 text-[12px] text-red-700" role="alert">
              {descriptionGenerationError}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="product-sizes"
            className="mb-2 block text-[12px] tracking-wide uppercase text-ink-soft"
          >
            Available Sizes
          </label>
          <input
            id="product-sizes"
            value={sizesText}
            onChange={(event) => setSizesText(event.target.value)}
            className="w-full border border-ink/20 px-3 py-2.5 text-sm outline-none transition-colors focus:border-clay"
            placeholder="XS, S, M, L, XL, XXL"
          />
          <p className="mt-1.5 text-[11px] text-ink-soft">
            Separate sizes with commas. Leave blank for items without sizes.
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

          <div className="mb-4 border border-ink/10 bg-white p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink">
              Generate mannequin mockup
            </p>
            <p className="mt-1 text-[11px] text-ink-soft">
              Upload a front or back shirt photo. The result is added to the live preview and saved with this product.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <label htmlFor="mockup-view" className="sr-only">
                Shirt photo view
              </label>
              <select
                id="mockup-view"
                value={mockupView}
                onChange={(event) =>
                  setMockupView(event.target.value as "front" | "back")
                }
                disabled={isGeneratingMockup || uploadingIndex !== null}
                className="border border-ink/20 bg-white px-2.5 py-2 text-xs outline-none focus:border-clay"
              >
                <option value="front">Front view</option>
                <option value="back">Back view</option>
              </select>
              <label
                className={`cursor-pointer border border-ink/20 px-2.5 py-2 text-[10px] uppercase tracking-wide hover:border-ink ${
                  isGeneratingMockup || uploadingIndex !== null
                    ? "pointer-events-none opacity-50"
                    : ""
                }`}
              >
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="sr-only"
                  disabled={isGeneratingMockup || uploadingIndex !== null}
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0];
                    if (file) void generateMockup(file);
                    event.currentTarget.value = "";
                  }}
                />
                {isGeneratingMockup ? "Generating..." : "Choose shirt photo"}
              </label>
            </div>
            <fieldset className="mt-4" disabled={isGeneratingMockup || uploadingIndex !== null}>
              <legend className="mb-2 text-[10px] font-medium uppercase tracking-[0.1em] text-ink-soft">
                Choose a background
              </legend>
              <div className="grid grid-cols-2 gap-3">
                {MOCKUP_BACKGROUNDS.map((background) => (
                  <label
                    key={background.id}
                    className={`cursor-pointer overflow-hidden border bg-white transition-colors ${
                      mockupBackground === background.id
                        ? "border-clay ring-1 ring-clay"
                        : "border-ink/15 hover:border-ink/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="mockup-background"
                      value={background.id}
                      checked={mockupBackground === background.id}
                      onChange={() => setMockupBackground(background.id)}
                      className="peer sr-only"
                    />
                    <span className="relative block aspect-[3/4] w-full bg-sand peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-clay">
                      <Image
                        src={background.src}
                        alt={background.label}
                        fill
                        sizes="(max-width: 640px) 45vw, 220px"
                        className="object-cover"
                      />
                    </span>
                    <span className="block px-2.5 py-2 text-[10px] leading-snug text-ink">
                      {background.label}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            {mockupError && (
              <p className="mt-2 text-[12px] text-red-700" role="alert">
                {mockupError}
              </p>
            )}
          </div>

          <div className="grid gap-3">
            {media.map((item, index) => (
              <div
                key={`${index}-${item.type}`}
                onDragOver={(event) => {
                  if (
                    !isFormLocked &&
                    draggingIndex !== null &&
                    uploadingIndex === null
                  ) {
                    event.preventDefault();
                  }
                }}
                onDrop={(event) => {
                event.preventDefault();
                if (
                  !isFormLocked &&
                  draggingIndex !== null &&
                  uploadingIndex === null
                ) {
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
                    draggable={!isFormLocked && uploadingIndex === null}
                    onDragStart={(event) => {
                      if (isFormLocked) return;
                      setDraggingIndex(index);
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", String(index));
                    }}
                    onDragEnd={() => {
                      if (!isFormLocked) setDraggingIndex(null);
                    }}
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
          disabled={isFormLocked}
          aria-busy={isSubmitting}
          className="mt-2 flex items-center justify-center gap-2 bg-ink text-ivory text-[12px] tracking-[0.14em] uppercase py-3 hover:bg-clay transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && (
            <span
              aria-hidden="true"
              className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent"
            />
          )}
          {isSubmitting
            ? submitLabel === "Create Product"
              ? "Creating..."
              : "Saving..."
            : hasSubmittedSuccessfully
              ? submitLabel === "Create Product"
                ? "Product Created"
                : "Changes Saved"
              : submitLabel}
        </button>
      </fieldset>
    </form>
  );
}
