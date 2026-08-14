export default function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="border border-ink/10 bg-white p-5">
      <div className="text-[11px] tracking-[0.12em] uppercase text-ink-soft mb-2">
        {label}
      </div>
      <div className="font-display text-2xl md:text-3xl">{value}</div>
      {sub && <div className="text-[12px] text-ink-soft mt-1">{sub}</div>}
    </div>
  );
}
