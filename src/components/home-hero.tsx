"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const SLIDES = [
  "/venues/club.jpg",
  "/venues/cafe.jpg",
  "/venues/restaurant.jpg",
  "/venues/bar.jpg",
];

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
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[28rem] overflow-hidden sm:min-h-[34rem]">
      {SLIDES.map((src, slideIndex) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            slideIndex === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-bg/62 to-bg" />
      <div className="relative mx-auto flex min-h-[28rem] max-w-6xl flex-col justify-end px-4 pb-12 pt-20 sm:min-h-[34rem] sm:pb-16">
        <p className="text-sm text-cream/80">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-cream sm:text-5xl lg:text-[3.25rem] lg:leading-[1.12]">
          {title}
        </h1>
        <p className="mt-4 max-w-xl text-base text-cream/75">{subtitle}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#venues" className="btn btn-primary">
            {ctaGuest}
          </a>
          <Link href="/register-venue" className="btn btn-ghost text-cream">
            {ctaVenue}
          </Link>
        </div>
        <div className="mt-8 flex gap-2">
          {SLIDES.map((src, slideIndex) => (
            <button
              key={src}
              type="button"
              aria-label={`Slide ${slideIndex + 1}`}
              onClick={() => setIndex(slideIndex)}
              className={`h-1.5 rounded-full transition ${
                slideIndex === index ? "w-7 bg-cream" : "w-3 bg-cream/35"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
