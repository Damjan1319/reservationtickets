export function AdminChart({
  days,
  reservationsLabel,
  arrivedLabel,
}: {
  days: { label: string; reservations: number; arrived: number }[];
  reservationsLabel: string;
  arrivedLabel: string;
}) {
  const max = Math.max(1, ...days.map((day) => Math.max(day.reservations, day.arrived)));

  return (
    <div>
      <div className="flex flex-wrap gap-4 text-xs text-paper-muted">
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-paper-text" />
          {reservationsLabel}
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-paper-text/30" />
          {arrivedLabel}
        </span>
      </div>
      <div
        className="mt-5 grid h-44 items-end gap-1.5"
        style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}
      >
        {days.map((day) => (
          <div key={day.label} className="flex h-full flex-col items-center justify-end gap-1">
            <div className="flex w-full flex-1 items-end justify-center gap-0.5">
              <div
                className="w-1/2 min-h-0.5 rounded-sm bg-paper-text"
                style={{ height: `${(day.reservations / max) * 100}%` }}
                title={`${reservationsLabel}: ${day.reservations}`}
              />
              <div
                className="w-1/2 min-h-0.5 rounded-sm bg-paper-text/30"
                style={{ height: `${(day.arrived / max) * 100}%` }}
                title={`${arrivedLabel}: ${day.arrived}`}
              />
            </div>
            <span className="text-[10px] text-paper-muted">{day.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
