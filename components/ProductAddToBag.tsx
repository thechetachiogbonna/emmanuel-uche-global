"use client";

import { useCart } from "@/lib/cart/CartContext";
import { useCartDrawer } from "@/lib/cart/CartDrawerContext";
import type { ProductDetail } from "@/lib/data";

export default function ProductAddToBag({
  product,
}: {
  product: ProductDetail;
}) {
  const { addItem } = useCart();
  const { openCart } = useCartDrawer();
  const image =
    product.media.find((item) => item.type === "image")?.src ??
    product.media[0]?.src ??
    "";

  const handleAddToBag = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      img1: image,
    });
    openCart();
  };

  return (
    <button
      type="button"
      onClick={handleAddToBag}
      className="w-full bg-ink text-ivory text-[12px] tracking-[0.14em] uppercase py-4 hover:bg-clay transition-colors"
    >
      Add to Bag
    </button>
  );
}
