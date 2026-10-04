import "dotenv/config";
import { eq } from "drizzle-orm";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import {
  collections,
  products,
  users,
  orders,
  orderItems,
} from "@/lib/db/schema";
import * as schema from "@/lib/db/schema";

function newId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

// A standalone auth instance for seeding only — the real lib/auth.ts is
// guarded with `import "server-only"` (correctly — it should never end
// up in a client bundle), which unconditionally throws outside Next.js's
// server-aware build pipeline. This plain script runs via tsx directly,
// so it needs its own minimal, unguarded instance instead.
const seedAuth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema, usePlural: true }),
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
});

async function main() {
  console.log("Seeding database…");

  // ---- Admin user — created through Better Auth's own signup flow (so
  // password hashing is whatever Better Auth actually uses internally,
  // not something we have to replicate), then promoted to the "admin"
  // role via the admin plugin. proxy.ts and requireAdmin() both check
  // this role, not an email match. ----
  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@emmanueluche.com").toLowerCase();
  const adminPassword = process.env.ADMIN_SEED_PASSWORD ?? "change-this-password";

  const existingAdmin = await db.query.users.findFirst({
    where: eq(users.email, adminEmail),
  });

  if (!existingAdmin) {
    await seedAuth.api.signUpEmail({
      body: { name: "Admin", email: adminEmail, password: adminPassword },
    });
  }

  await db
    .update(users)
    .set({ role: "admin" })
    .where(eq(users.email, adminEmail));
  console.log(`  ✓ Admin user ready: ${adminEmail}`);

  // ---- Collections + products (same content the site shipped with) ----
  const sharedProducts = [
    { name: "Tailored Wrap Dress", priceNaira: 165000, media: [{ src: "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=700&q=80", type: "image" as const }, { src: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=700&q=80", type: "image" as const }] },
    { name: "Ivory Tailored Set", priceNaira: 210000, media: [{ src: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=700&q=80", type: "image" as const }, { src: "https://images.unsplash.com/photo-1550614000-4895a10e1bfd?w=700&q=80", type: "image" as const }] },
    { name: "Aso-Oke Blazer", priceNaira: 245000, media: [{ src: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=700&q=80", type: "image" as const }, { src: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=700&q=80", type: "image" as const }] },
    { name: "Clay Silk Gown", priceNaira: 298000, media: [{ src: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=700&q=80", type: "image" as const }, { src: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=700&q=80", type: "image" as const }] },
    { name: "Sand Linen Trouser", priceNaira: 98000, media: [{ src: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=700&q=80", type: "image" as const }, { src: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=700&q=80", type: "image" as const }] },
  ];

  const collectionSeeds = [
    {
      slug: "ss26-new-collection",
      season: "SS26",
      name: "New Collection",
      status: "available" as const,
      productIndexes: [0, 1, 2, 3, 4],
    },
    {
      slug: "resort-25",
      season: "Resort 25",
      name: "Resort Collection",
      status: "available" as const,
      productIndexes: [0, 1, 2, 3],
    },
    {
      slug: "aw25",
      season: "AW25",
      name: "Autumn Collection",
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
        status: seed.status,
      })
      .onConflictDoUpdate({
        target: collections.slug,
        set: {
          name: seed.name,
          season: seed.season,
          status: seed.status,
          updatedAt: new Date(),
        },
      })
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
      const existingProduct = await db.query.products.findFirst({
        where: (product, { and, eq }) =>
          and(
            eq(product.collectionId, collectionId),
            eq(product.name, p.name)
          ),
      });

      if (existingProduct) {
        await db
          .update(products)
          .set({
            priceNaira: p.priceNaira,
            media: p.media,
            updatedAt: new Date(),
          })
          .where(eq(products.id, existingProduct.id));
      } else {
        await db.insert(products).values({
          id: newId("prod"),
          collectionId,
          name: p.name,
          priceNaira: p.priceNaira,
          media: p.media,
        });
      }
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

  for (const c of sampleCustomers) {
    const [row] = await db
      .insert(users)
      .values({
        id: newId("user"),
        name: c.name,
        email: c.email,
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
    {
      customerEmail: "ifeoma.c@example.com",
      status: "processing" as const,
      totalNaira: 363000,
      itemCount: 2,
      items: [
        { productName: "Tailored Wrap Dress", priceNaira: 165000, quantity: 1, img1: sharedProducts[0].media[0].src },
        { productName: "Sand Linen Trouser", priceNaira: 98000, quantity: 2, img1: sharedProducts[4].media[0].src },
      ],
    },
    {
      customerEmail: "tayo.a@example.com",
      status: "shipped" as const,
      totalNaira: 245000,
      itemCount: 1,
      items: [
        { productName: "Aso-Oke Blazer", priceNaira: 245000, quantity: 1, img1: sharedProducts[2].media[0].src },
      ],
    },
    {
      customerEmail: "chiamaka.o@example.com",
      status: "delivered" as const,
      totalNaira: 461000,
      itemCount: 3,
      items: [
        { productName: "Ivory Tailored Set", priceNaira: 210000, quantity: 1, img1: sharedProducts[1].media[0].src },
        { productName: "Clay Silk Gown", priceNaira: 251000, quantity: 1, img1: sharedProducts[3].media[0].src },
      ],
    },
  ];

  for (const o of sampleOrders) {
    const paymentReference = `seed-${o.customerEmail.split("@")[0]}`;
    const [inserted] = await db
      .insert(orders)
      .values({
        id: newId("ord"),
        customerId: customerIds[o.customerEmail],
        status: o.status,
        paymentStatus: "paid",
        paymentReference,
        totalNaira: o.totalNaira,
        itemCount: o.itemCount,
      })
      .onConflictDoNothing({ target: orders.paymentReference })
      .returning({ id: orders.id });

    if (inserted) {
      await db.insert(orderItems).values(
        o.items.map((item) => ({
          id: newId("oi"),
          orderId: inserted.id,
          productName: item.productName,
          priceNaira: item.priceNaira,
          quantity: item.quantity,
          img1: item.img1,
        }))
      );
    }
  }
  console.log(`  ✓ ${sampleOrders.length} sample orders`);

  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
