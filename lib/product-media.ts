export type ProductMediaItem = {
  src: string;
  type: "image" | "video";
};

export function getProductMedia(
  media: ProductMediaItem[] | null | undefined
): ProductMediaItem[] {
  return media ?? [];
}