import { cn } from "@/lib/utils";

const TONES = {
  table: "border-l-[3px] border-l-cal-table",
  event: "border-l-[3px] border-l-cal-event",
  both: "border-l-[3px] border-l-cal-both",
  warn: "border-l-[3px] border-l-danger",
};

export function StatCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: keyof typeof TONES;
}) {
  return (
    <article className={cn("rounded-2xl border border-paper-line bg-paper p-4 text-paper-text sm:p-5", tone && TONES[tone])}>
      <p className="text-xs font-medium text-paper-muted">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">{value}</p>
      {hint ? <p className="mt-1.5 text-xs text-paper-muted">{hint}</p> : null}
    </article>
  );
}
