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
      className="group flex flex-col overflow-hidden rounded-xl border border-line bg-bg transition hover:border-cream/25"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={venueCover(type, coverUrl)} alt="" className="h-44 w-full bg-surface-2 object-cover" />
      <div className="p-4">
        <p className="text-xs font-medium text-muted">
          {t(`types.${type}`)} · {city}
        </p>
        <h3 className="mt-1 text-[17px] font-semibold tracking-[-0.01em] text-cream">{name}</h3>
      </div>
    </Link>
  );
}
