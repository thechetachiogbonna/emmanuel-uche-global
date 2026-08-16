import Link from "next/link";
import { getAdminCollections } from "@/lib/admin/queries";
import EditProductForm from "@/components/admin/EditProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ slug: string; productId: string }>;
}) {
  const { slug, productId } = await params;
  const collections = await getAdminCollections();
  const collection = collections.find((c) => c.slug === slug);
  const product = collection?.products.find((p) => p.id === productId);

  if (!collection || !product) {
    return (
      <div>
        <Link
          href={`/admin/collections/${slug}`}
          className="text-[12px] tracking-wide uppercase text-ink-soft hover:text-ink"
        >
          ← Back
        </Link>
        <p className="mt-6 text-[14px] text-ink-soft">
          That product doesn&apos;t exist — it may have been deleted.
        </p>
      </div>
    );
  }

  return (
    <div>
      <Link
        href={`/admin/collections/${collection.slug}`}
        className="text-[12px] tracking-wide uppercase text-ink-soft hover:text-ink"
      >
        ← Back to {collection.name}
      </Link>
      <h1 className="font-display text-2xl md:text-3xl mt-3 mb-6">
        Edit Product
      </h1>
      <EditProductForm
        productId={product.id}
        collectionSlug={collection.slug}
        initial={{
          name: product.name,
          price: product.price,
          img1: product.img1,
          img2: product.img2,
        }}
      />
    </div>
  );
}
