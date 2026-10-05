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
    <article className="rounded-2xl border border-paper-line bg-paper p-5 text-paper-text sm:p-6">
      <p className="text-sm text-paper-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">{value}</p>
      {hint ? <p className="mt-3 text-sm leading-relaxed text-paper-muted">{hint}</p> : null}
    </article>
  );
}
