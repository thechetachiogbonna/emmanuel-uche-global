import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import {
  collections,
  products,
  users,
  orders,
} from "@/lib/db/schema";

function newId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

async function main() {
  console.log("Seeding database…");

  // ---- Collections + products (same content the site shipped with) ----
  const sharedProducts = [
    { name: "Tailored Wrap Dress", priceNaira: 165000, img1: "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=700&q=80", img2: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=700&q=80" },
    { name: "Ivory Tailored Set", priceNaira: 210000, img1: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=700&q=80", img2: "https://images.unsplash.com/photo-1550614000-4895a10e1bfd?w=700&q=80" },
    { name: "Aso-Oke Blazer", priceNaira: 245000, img1: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=700&q=80", img2: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=700&q=80" },
    { name: "Clay Silk Gown", priceNaira: 298000, img1: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=700&q=80", img2: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=700&q=80" },
    { name: "Sand Linen Trouser", priceNaira: 98000, img1: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=700&q=80", img2: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=700&q=80" },
  ];

  const collectionSeeds = [
    {
      slug: "ss26-new-collection",
      season: "SS26",
      name: "New Collection",
      description:
        "Signature pieces finished in Aba — ready-to-wear and made-to-order silhouettes for the season ahead.",
      image: "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=1200&q=80",
      status: "available" as const,
      productIndexes: [0, 1, 2, 3, 4],
    },
    {
      slug: "resort-25",
      season: "Resort 25",
      name: "Resort Collection",
      description:
        "Light linen and silk pieces made for warm weather — tailored for travel between Aba, London, and Accra.",
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80",
      status: "available" as const,
      productIndexes: [0, 1, 2, 3],
    },
    {
      slug: "aw25",
      season: "AW25",
      name: "Autumn Collection",
      description:
        "Layered tailoring and rich structured fabrics — arriving soon from our Aba studio.",
      image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&q=80",
      status: "coming-soon" as const,
      productIndexes: [],
    },
  ];

  for (const seed of collectionSeeds) {
    const [row] = await db
      .insert(collections)
      .values({
        id: newId("col"),
        slug: seed.slug,
        name: seed.name,
        season: seed.season,
        description: seed.description,
        image: seed.image,
        status: seed.status,
      })
      .onConflictDoNothing({ target: collections.slug })
      .returning({ id: collections.id });

    // If it already existed, onConflictDoNothing returns nothing — look it up.
    const collectionId =
      row?.id ??
      (
        await db.query.collections.findFirst({
          where: (c, { eq }) => eq(c.slug, seed.slug),
        })
      )?.id;

    if (!collectionId) continue;

    for (const idx of seed.productIndexes) {
      const p = sharedProducts[idx];
      await db.insert(products).values({
        id: newId("prod"),
        collectionId,
        name: p.name,
        priceNaira: p.priceNaira,
        img1: p.img1,
        img2: p.img2,
      });
    }
    console.log(`  ✓ Collection: ${seed.name} (${seed.productIndexes.length} products)`);
  }

  // ---- Sample customers + orders, for the admin console to show something real ----
  const sampleCustomers = [
    { name: "Ifeoma Chukwu", email: "ifeoma.c@example.com" },
    { name: "Tayo Adeyemi", email: "tayo.a@example.com" },
    { name: "Chiamaka Obi", email: "chiamaka.o@example.com" },
  ];
  const customerIds: Record<string, string> = {};
  const demoHash = await bcrypt.hash("demo-password-not-real", 12);

  for (const c of sampleCustomers) {
    const [row] = await db
      .insert(users)
      .values({
        id: newId("user"),
        name: c.name,
        email: c.email,
        passwordHash: demoHash,
      })
      .onConflictDoNothing({ target: users.email })
      .returning({ id: users.id });

    customerIds[c.email] =
      row?.id ??
      (
        await db.query.users.findFirst({
          where: (u, { eq }) => eq(u.email, c.email),
        })
      )!.id;
  }
  console.log(`  ✓ ${sampleCustomers.length} sample customers`);

  const sampleOrders = [
    { customerEmail: "ifeoma.c@example.com", status: "processing" as const, totalNaira: 363000, itemCount: 2 },
    { customerEmail: "tayo.a@example.com", status: "shipped" as const, totalNaira: 245000, itemCount: 1 },
    { customerEmail: "chiamaka.o@example.com", status: "delivered" as const, totalNaira: 461000, itemCount: 3 },
  ];

  for (const o of sampleOrders) {
    await db
      .insert(orders)
      .values({
        id: newId("ord"),
        customerId: customerIds[o.customerEmail],
        status: o.status,
        totalNaira: o.totalNaira,
        itemCount: o.itemCount,
      })
      .onConflictDoNothing();
  }
  console.log(`  ✓ ${sampleOrders.length} sample orders`);

  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
