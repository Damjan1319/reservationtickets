import Link from "next/link";
import { resultHref, type SearchQuery, type SearchVenue } from "@/lib/search";

type Labels = {
  type: string;
  status: string;
  statusTone: "ok" | "bad" | "muted";
  reviews: string;
};

export function VenueTile({ venue, query, labels }: { venue: SearchVenue; query: SearchQuery; labels: Labels }) {
  return (
    <Link
      href={resultHref(venue, query)}
      className="group flex flex-col overflow-hidden rounded-xl border border-line bg-bg transition hover:border-cream/25"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={venue.coverUrl} alt="" loading="lazy" decoding="async" className="h-40 w-full bg-surface-2 object-cover" />
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="text-xs font-medium text-muted">
          {labels.type} · {venue.city}
        </p>
        <p className="text-[17px] font-semibold tracking-[-0.01em] text-cream">{venue.name}</p>
        {venue.ratingAvg && venue.ratingCount > 0 ? (
          <p className="text-[13px] text-muted">
            ★ {venue.ratingAvg.toFixed(1)} · {venue.ratingCount} {labels.reviews}
          </p>
        ) : null}
        <p
          className={
            "mt-auto pt-2 text-[13px] font-semibold " +
            (labels.statusTone === "ok" ? "text-success" : labels.statusTone === "bad" ? "text-danger" : "text-muted")
          }
        >
          {labels.status}
        </p>
      </div>
    </Link>
  );
}

