import Link from "next/link";
import { SearchBar } from "@/components/search-bar";
import { type SearchQuery } from "@/lib/search";

export function HomeHero({
  eyebrow,
  title,
  subtitle,
  ctaVenue,
  ctaVenueLink,
  card,
  cities,
  searchDefaults,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaVenue: string;
  ctaVenueLink: string;
  card: { status: string; title: string; meta: string };
  cities: string[];
  searchDefaults: SearchQuery;
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-14 pt-12 sm:pb-20 sm:pt-20">
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div>
          <p className="text-sm font-medium text-muted">{eyebrow}</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-semibold leading-[1.05] tracking-[-0.035em] text-cream sm:text-5xl lg:text-[56px]">
            {title}
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted sm:text-lg">{subtitle}</p>
        </div>

        <div className="relative hidden lg:block" aria-hidden>
          <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-surface-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/venues/restaurant.jpg"
              alt=""
              decoding="async"
              fetchPriority="high"
              className="h-full w-full object-cover saturate-[.8]"
            />
          </div>
          <div className="absolute -bottom-6 -left-8 w-60 rounded-xl border border-line bg-bg p-4">
            <span className="inline-flex rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
              {card.status}
            </span>
            <p className="mt-2.5 text-[15px] font-semibold text-cream">{card.title}</p>
            <p className="mt-0.5 text-[13px] text-muted">{card.meta}</p>
          </div>
        </div>
      </div>

      <div className="mt-10 lg:mt-14">
        <SearchBar cities={cities} values={searchDefaults} />
      </div>
      <p className="mt-4 text-sm text-muted">
        {ctaVenue}{" "}
        <Link href="/register-venue" className="font-semibold text-cream underline underline-offset-[3px]">
          {ctaVenueLink}
        </Link>
      </p>
    </section>
  );
}
