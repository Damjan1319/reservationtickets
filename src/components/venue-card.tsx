"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { venueCover } from "@/lib/utils";

export type VenueCardProps = {
  name: string;
  slug: string;
  type: string;
  city: string;
  description: string;
  coverUrl?: string | null;
};

export function VenueCard({ name, slug, type, city, description, coverUrl }: VenueCardProps) {
  const t = useTranslations("venue");

  return (
    <Link
      href={`/v/${slug}`}
      className="group overflow-hidden rounded-2xl border border-paper-line bg-paper text-paper-text transition hover:border-paper-text/25"
    >
      <div className="relative h-44 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={venueCover(type, coverUrl)}
          alt=""
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
      </div>
      <div className="space-y-2 p-5">
        <div className="flex items-center justify-between gap-3 text-xs font-semibold text-paper-muted">
          <span>{t(`types.${type}`)}</span>
          <span>{city}</span>
        </div>
        <h3 className="text-lg font-bold tracking-tight">{name}</h3>
        <p className="text-xs font-medium text-paper-muted">{t("verified")}</p>
        <p className="line-clamp-2 text-sm font-medium text-paper-muted">{description}</p>
        <p className="pt-1 text-xs font-medium text-paper-muted">{slug}.ulaznice.rs</p>
      </div>
    </Link>
  );
}
