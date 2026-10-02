import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { venueCover } from "@/lib/utils";

type VenueCardProps = {
  name: string;
  slug: string;
  type: string;
  city: string;
  description: string;
  coverHue?: number;
};

export async function VenueCard({ name, slug, type, city, description }: VenueCardProps) {
  const t = await getTranslations("venue");

  return (
    <Link
      href={`/v/${slug}`}
      className="group overflow-hidden rounded-2xl border border-paper-line bg-paper text-paper-text transition hover:border-paper-text/25"
    >
      <div className="relative h-44 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={venueCover(type)}
          alt=""
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
      </div>
      <div className="space-y-2 p-5">
        <div className="flex items-center justify-between gap-3 text-xs font-medium text-paper-muted">
          <span>{t(`types.${type}`)}</span>
          <span>{city}</span>
        </div>
        <h3 className="text-lg font-semibold">{name}</h3>
        <p className="text-xs text-paper-muted">{t("verified")}</p>
        <p className="line-clamp-2 text-sm text-paper-muted">{description}</p>
        <p className="pt-1 text-xs text-paper-muted">{slug}.ulaznice.rs</p>
      </div>
    </Link>
  );
}
