import Link from "next/link";
import { redirect } from "next/navigation";
import { confirmOrderPayment } from "@/lib/payments";

export default async function CheckoutCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; trxref?: string }>;
}) {
  const params = await searchParams;
  const reference = params.reference ?? params.trxref;

  if (!reference) {
    return (
      <main className="flex-1 px-6 md:px-10 py-20 md:py-28 text-center max-w-md mx-auto">
        <h1 className="font-display font-light italic text-3xl mb-4">
          Something went wrong
        </h1>
        <p className="text-[14px] text-ink-soft mb-8">
          No payment reference was provided.
        </p>
        <Link
          href="/"
          className="inline-block bg-ink text-ivory text-[12px] tracking-[0.14em] uppercase px-6 py-3.5 hover:bg-clay transition-colors"
        >
          Back to Shop
        </Link>
      </main>
    );
  }

  const result = await confirmOrderPayment(reference);

  if (result.ok) {
    redirect(`/orders/${result.orderId}`);
  }

  return (
    <main className="flex-1 px-6 md:px-10 py-20 md:py-28 text-center max-w-md mx-auto">
      <p className="text-[12px] tracking-[0.18em] uppercase text-clay mb-3">
        Payment Not Completed
      </p>
      <h1 className="font-display font-light italic text-3xl mb-4">
        We couldn&apos;t confirm this payment
      </h1>
      <p className="text-[14px] text-ink-soft mb-8">{result.error}</p>
      <div className="flex gap-3 justify-center">
        <Link
          href="/orders"
          className="border border-ink/20 text-[12px] tracking-[0.14em] uppercase px-6 py-3.5 hover:border-ink transition-colors"
        >
          View Your Orders
        </Link>
        <Link
          href="/"
          className="bg-ink text-ivory text-[12px] tracking-[0.14em] uppercase px-6 py-3.5 hover:bg-clay transition-colors"
        >
          Back to Shop
        </Link>
      </div>
    </main>
  );
}
