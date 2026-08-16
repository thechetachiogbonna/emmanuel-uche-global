const ORDER_COLORS: Record<string, string> = {
  pending: "bg-sand/60 text-ink-soft",
  processing: "bg-gold/20 text-gold",
  shipped: "bg-[#3B5B8C]/10 text-[#3B5B8C]",
  delivered: "bg-green-700/10 text-green-800",
  cancelled: "bg-red-700/10 text-red-800",
};

const COLLECTION_COLORS: Record<string, string> = {
  available: "bg-green-700/10 text-green-800",
  "coming-soon": "bg-sand/60 text-ink-soft",
};

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block px-2.5 py-1 text-[11px] tracking-wide uppercase rounded-sm ${
        ORDER_COLORS[status] ?? "bg-sand/60 text-ink-soft"
      }`}
    >
      {status}
    </span>
  );
}

export function CollectionStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block px-2.5 py-1 text-[11px] tracking-wide uppercase rounded-sm ${
        COLLECTION_COLORS[status] ?? "bg-sand/60 text-ink-soft"
      }`}
    >
      {status === "coming-soon" ? "Coming Soon" : "Available"}
    </span>
  );
}
