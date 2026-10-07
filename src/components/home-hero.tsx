import Link from "next/link";

export function HomeHero({
  eyebrow,
  title,
  subtitle,
  ctaGuest,
  ctaVenue,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaGuest: string;
  ctaVenue: string;
}) {
  return (
    <section className="relative min-h-[26rem] overflow-hidden sm:min-h-[32rem]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/venues/club.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/72 to-black/30" />
      <div className="relative mx-auto flex min-h-[26rem] max-w-6xl flex-col justify-end px-4 pb-10 pt-20 sm:min-h-[32rem] sm:pb-12">
        <p className="text-sm font-medium text-cream/80">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-cream sm:text-5xl lg:text-[3.15rem] lg:leading-[1.1]">
          {title}
        </h1>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-cream/80">{subtitle}</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <a href="#venues" className="btn btn-primary">
            {ctaGuest}
          </a>
          <Link href="/register-venue" className="btn btn-ghost text-cream">
            {ctaVenue}
          </Link>
        </div>
      </div>
    </section>
  );
}
