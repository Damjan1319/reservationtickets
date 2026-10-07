import Link from "next/link";
import { buildMonthCells, dayTone, type DayOccupancy } from "@/lib/calendar";
import { cn, todayInputValue } from "@/lib/utils";

const DEFAULT_WEEKDAYS = ["P", "U", "S", "Č", "P", "S", "N"];

const TONE_CLASS = {
  free: "text-cream/50 hover:bg-surface-2",
  table: "bg-surface-2 text-cream",
  event: "bg-cream/12 text-cream",
  both: "bg-paper text-paper-text",
};

export function ReservationCalendar({
  year,
  month,
  occupancy,
  selected,
  dayHref,
  prevHref,
  nextHref,
  monthTitle,
  weekdays,
  legendTables,
  legendEvents,
  legendBoth,
  legendFree,
}: {
  year: number;
  month: number;
  occupancy: Map<string, DayOccupancy>;
  selected?: string;
  dayHref: (key: string) => string;
  prevHref: string;
  nextHref: string;
  monthTitle: string;
  weekdays: string[];
  legendTables: string;
  legendEvents: string;
  legendBoth: string;
  legendFree: string;
}) {
  const cells = buildMonthCells(year, month);
  const today = todayInputValue();
  const days = Array.isArray(weekdays) && weekdays.length === 7 ? weekdays : DEFAULT_WEEKDAYS;

  return (
    <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <Link href={prevHref} className="rounded-lg px-2 py-1 text-sm text-cream/55 hover:text-cream">
          ←
        </Link>
        <h2 className="text-xl font-bold tracking-tight text-cream capitalize">{monthTitle}</h2>
        <Link href={nextHref} className="rounded-lg px-2 py-1 text-sm text-cream/55 hover:text-cream">
          →
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-cream/45">
        {days.map((day, index) => (
          <div key={`${day}-${index}`}>{day}</div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((cell, index) => {
          if (!cell) return <div key={`empty-${index}`} />;
          const info = occupancy.get(cell.key);
          const tone = dayTone(info);
          const isToday = cell.key === today;
          const isSelected = cell.key === selected;
          return (
            <Link
              key={cell.key}
              href={dayHref(cell.key)}
              className={cn(
                "flex min-h-11 flex-col items-center justify-center rounded-lg text-sm transition",
                TONE_CLASS[tone],
                isToday && "ring-1 ring-cream/35",
                isSelected && "ring-2 ring-paper",
              )}
            >
              <span className="tabular-nums">{cell.date}</span>
              {info && info.guests > 0 ? (
                <span className="text-[10px] text-cream/55">{info.guests}</span>
              ) : null}
            </Link>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap gap-3 text-[11px] text-cream/55">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-surface-2" />
          {legendTables}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-cream/20" />
          {legendEvents}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-paper" />
          {legendBoth}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border border-line" />
          {legendFree}
        </span>
      </div>
    </section>
  );
}
