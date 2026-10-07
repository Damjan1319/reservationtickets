"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { venueCover } from "@/lib/utils";

export type VenueCardProps = {
  name: string;
  slug: string;
  type: string;
  city: string;
  description?: string;
  coverUrl?: string | null;
};

export function VenueCard({ name, slug, type, city, coverUrl }: VenueCardProps) {
  const t = useTranslations("venue");

  return (
    <Link
      href={`/v/${slug}`}
      className="group relative block overflow-hidden rounded-2xl border border-line transition hover:border-cream/40"
    >
      <div className="relative h-56 sm:h-60">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={venueCover(type, coverUrl)} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
      </div>
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <p className="text-xs font-semibold text-cream/80">
          {t(`types.${type}`)} · {city}
        </p>
        <h3 className="mt-1 text-xl font-bold tracking-tight text-cream">{name}</h3>
      </div>
    </Link>
  );
}
