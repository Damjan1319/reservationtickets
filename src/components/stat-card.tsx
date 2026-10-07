export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: string;
}) {
  return (
    <article className="rounded-2xl border border-line bg-surface px-4 py-4 text-cream">
      <p className="text-xs font-semibold text-cream/60">{label}</p>
      <p className="mt-1.5 text-2xl font-bold tracking-tight tabular-nums">{value}</p>
      {hint ? <p className="mt-2 text-xs leading-relaxed text-cream/55">{hint}</p> : null}
    </article>
  );
}
