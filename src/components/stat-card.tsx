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
    <article className="rounded-2xl border border-line bg-surface px-4 py-4">
      <p className="text-xs font-medium text-cream/55">{label}</p>
      <p className="mt-1.5 text-2xl font-bold tracking-tight text-cream tabular-nums">{value}</p>
      {hint ? <p className="mt-2 text-xs leading-relaxed text-cream/55">{hint}</p> : null}
    </article>
  );
}
