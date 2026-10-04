import { redirect } from "next/navigation";
import { getCollectionLinks } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  const collections = await getCollectionLinks();
  const firstAvailable = collections.find(
    (collection) => collection.status === "available"
  );

  redirect(firstAvailable ? `/collections/${firstAvailable.slug}` : "/");
}
