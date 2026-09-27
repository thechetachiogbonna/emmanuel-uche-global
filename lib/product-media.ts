export type ProductMediaItem = {
  src: string;
  type: "image" | "video";
};

export function getProductMedia(
  media: ProductMediaItem[] | null | undefined,
  img1: string,
  img2: string
): ProductMediaItem[] {
  if (media?.length) return media;
  return [img1, img2]
    .filter((src, index, sources) => Boolean(src) && sources.indexOf(src) === index)
    .map((src) => ({ src, type: "image" }));
}