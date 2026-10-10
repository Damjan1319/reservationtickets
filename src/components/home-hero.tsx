import Link from "next/link";
import { SearchBar } from "@/components/search-bar";
import { type SearchQuery } from "@/lib/search";

export function HomeHero({
  eyebrow,
  title,
  subtitle,
  ctaVenue,
  cities,
  searchDefaults,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaVenue: string;
  cities: string[];
  searchDefaults: SearchQuery;
}) {
  return (
    <section className="relative min-h-[28rem] overflow-hidden sm:min-h-[34rem]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/venues/club.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/72 to-black/30" />
      <div className="relative mx-auto flex min-h-[28rem] max-w-6xl flex-col justify-end px-4 pb-8 pt-20 sm:min-h-[34rem] sm:pb-10">
        <p className="text-sm font-medium text-cream/80">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-cream sm:text-5xl lg:text-[3.15rem] lg:leading-[1.1]">
          {title}
        </h1>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-cream/80">{subtitle}</p>
        <div className="mt-8">
          <SearchBar cities={cities} values={searchDefaults} />
        </div>
        <p className="mt-4 text-sm font-medium text-cream/70">
          <Link href="/register-venue" className="underline-offset-2 hover:underline">
            {ctaVenue}
          </Link>
        </p>
      </div>
    </section>
  );
}
