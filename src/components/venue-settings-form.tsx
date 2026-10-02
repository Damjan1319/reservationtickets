"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { updateVenue } from "@/app/actions/venue";
import { VENUE_TYPES } from "@/lib/constants";

type VenueSettingsFormProps = {
  venue: {
    name: string;
    type: string;
    city: string;
    address: string;
    description: string;
    phone: string;
    pib: string;
    proofUrl: string;
    verificationStatus: string;
  };
};

export function VenueSettingsForm({ venue }: VenueSettingsFormProps) {
  const t = useTranslations("venue");
  const ts = useTranslations("settings");
  const tc = useTranslations("common");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(async () => {
          const result = await updateVenue(data);
          setMessage(result?.ok ? ts("saved") : tc("required"));
        });
      }}
    >
      <input type="hidden" name="slug" value="kept" />
      <label className="block space-y-2">
        <span className="text-sm text-muted">{t("name")}</span>
        <input
          name="name"
          defaultValue={venue.name}
          required
          className="w-full rounded-xl border border-line bg-surface-2 px-4 py-3 outline-none focus:border-gold"
        />
      </label>
      <label className="block space-y-2">
        <span className="text-sm text-muted">{t("type")}</span>
        <select
          name="type"
          defaultValue={venue.type}
          className="w-full rounded-xl border border-line bg-surface-2 px-4 py-3 outline-none focus:border-gold"
        >
          {VENUE_TYPES.map((type) => (
            <option key={type} value={type}>
              {t(`types.${type}`)}
            </option>
          ))}
        </select>
      </label>
      <label className="block space-y-2">
        <span className="text-sm text-muted">{t("city")}</span>
        <input
          name="city"
          defaultValue={venue.city}
          required
          className="w-full rounded-xl border border-line bg-surface-2 px-4 py-3 outline-none focus:border-gold"
        />
      </label>
      <label className="block space-y-2">
        <span className="text-sm text-muted">{t("address")}</span>
        <input
          name="address"
          defaultValue={venue.address}
          required
          className="w-full rounded-xl border border-line bg-surface-2 px-4 py-3 outline-none focus:border-gold"
        />
      </label>
      <label className="block space-y-2">
        <span className="text-sm text-muted">{t("description")}</span>
        <textarea
          name="description"
          defaultValue={venue.description}
          required
          rows={4}
          className="w-full rounded-xl border border-line bg-surface-2 px-4 py-3 outline-none focus:border-gold"
        />
      </label>
      <label className="block space-y-2">
        <span className="text-sm text-muted">{t("pib")}</span>
        <input
          value={venue.pib}
          readOnly
          className="w-full rounded-xl border border-line bg-surface-2 px-4 py-3 text-muted"
        />
      </label>
      <label className="block space-y-2">
        <span className="text-sm text-muted">{t("phone")}</span>
        <input
          name="phone"
          type="tel"
          defaultValue={venue.phone}
          required
          className="w-full rounded-xl border border-line bg-surface-2 px-4 py-3 outline-none focus:border-gold"
        />
      </label>
      <label className="block space-y-2">
        <span className="text-sm text-muted">{t("proofUrl")}</span>
        <input
          name="proofUrl"
          type="url"
          defaultValue={venue.proofUrl}
          required
          className="w-full rounded-xl border border-line bg-surface-2 px-4 py-3 outline-none focus:border-gold"
        />
      </label>
      {message ? <p className="text-sm text-success">{message}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary"
      >
        {tc("save")}
      </button>
    </form>
  );
}
