import Link from "next/link";
import { SearchBar } from "@/components/search-bar";
import { type SearchQuery } from "@/lib/search";

export function HomeHero({
  eyebrow,
  title,
  subtitle,
  ctaVenue,
  ctaVenueLink,
  cities,
  searchDefaults,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaVenue: string;
  ctaVenueLink: string;
  cities: string[];
  searchDefaults: SearchQuery;
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-14 pt-14 sm:pb-20 sm:pt-24">
      <p className="text-sm font-medium text-muted">{eyebrow}</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.035em] text-cream sm:text-5xl lg:text-[56px]">
        {title}
      </h1>
      <p className="mt-5 max-w-lg text-base leading-relaxed text-muted sm:text-lg">{subtitle}</p>
      <div className="mt-10">
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
