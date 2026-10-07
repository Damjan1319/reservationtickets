"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { VenueCard, type VenueCardProps } from "@/components/venue-card";
import { VENUE_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type VenueListItem = VenueCardProps & { id: string };

export function VenueBrowser({
  venues,
  initialCity = "",
  initialType = "",
}: {
  venues: VenueListItem[];
  initialCity?: string;
  initialType?: string;
}) {
  const t = useTranslations("common");
  const tv = useTranslations("venue");
  const th = useTranslations("home");
  const [city, setCity] = useState(initialCity);
  const [type, setType] = useState(
    VENUE_TYPES.includes(initialType as (typeof VENUE_TYPES)[number]) ? initialType : "",
  );

  const cities = useMemo(
    () => [...new Set(venues.map((item) => item.city))].sort((a, b) => a.localeCompare(b, "sr")),
    [venues],
  );

  const visible = venues.filter((item) => (!city || item.city === city) && (!type || item.type === type));

  function apply(nextCity: string, nextType: string) {
    setCity(nextCity);
    setType(nextType);
    const params = new URLSearchParams();
    if (nextCity) params.set("city", nextCity);
    if (nextType) params.set("type", nextType);
    const query = params.toString();
    window.history.replaceState(null, "", query ? `/?${query}#venues` : "/#venues");
  }

  return (
    <>
      <div className="mt-5 flex flex-wrap gap-2">
        <FilterChip active={!city} onClick={() => apply("", type)}>
          {t("allCities")}
        </FilterChip>
        {cities.map((item) => (
          <FilterChip key={item} active={city === item} onClick={() => apply(item, type)}>
            {item}
          </FilterChip>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <FilterChip active={!type} onClick={() => apply(city, "")}>
          {t("allTypes")}
        </FilterChip>
        {VENUE_TYPES.filter((item) => item !== "BAR").map((item) => (
          <FilterChip key={item} active={type === item} onClick={() => apply(city, item)}>
            {tv(`types.${item}`)}
          </FilterChip>
        ))}
      </div>
      {visible.length === 0 ? (
        <p className="mt-10 font-medium text-cream">{venues.length === 0 ? th("venuesEmpty") : th("venuesEmptyFilter")}</p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((venue) => (
            <VenueCard key={venue.id} {...venue} />
          ))}
        </div>
      )}
    </>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3.5 py-1.5 text-sm font-semibold transition",
        active ? "bg-paper text-paper-text" : "border border-line text-cream hover:bg-surface",
      )}
    >
      {children}
    </button>
  );
}
