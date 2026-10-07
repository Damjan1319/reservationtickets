"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { updateVenue } from "@/app/actions/venue";
import { VENUE_TYPES } from "@/lib/constants";
import { venueCover } from "@/lib/utils";

async function compressCover(file: File) {
  const bitmap = await createImageBitmap(file);
  const max = 1600;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
  if (!blob || blob.size > 1_500_000) return file;
  return new File([blob], "cover.jpg", { type: "image/jpeg" });
}

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
    coverUrl: string;
    verificationStatus: string;
    tableCapacity: number;
    opensAt: string;
    closesAt: string;
    closed: boolean;
    noShowMinutes: number;
  };
};

export function VenueSettingsForm({ venue }: VenueSettingsFormProps) {
  const t = useTranslations("venue");
  const ts = useTranslations("settings");
  const tc = useTranslations("common");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState(venueCover(venue.type, venue.coverUrl));
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(async () => {
          const file = data.get("cover");
          if (file instanceof File && file.size > 0) {
            try {
              data.set("cover", await compressCover(file));
            } catch {
              /* keep the original file */
            }
          }
          const result = await updateVenue(data);
          if (result?.ok) {
            setError(null);
            setMessage(ts("saved"));
          } else if (result?.error === "coverType") {
            setMessage(null);
            setError(ts("coverType"));
          } else if (result?.error === "coverSize") {
            setMessage(null);
            setError(ts("coverSize"));
          } else if (result?.error === "coverSave") {
            setMessage(null);
            setError(ts("coverSave"));
          } else {
            setMessage(null);
            setError(tc("required"));
          }
        });
      }}
    >
      <input type="hidden" name="slug" value="kept" />
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-paper-text">{ts("cover")}</span>
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-36 w-full rounded-xl object-cover" />
        ) : null}
        <input
          name="cover"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => {
            const file = event.target.files?.[0];
            setPreview(file ? URL.createObjectURL(file) : venueCover(venue.type, venue.coverUrl));
          }}
          className="w-full rounded-xl border border-paper-line bg-white px-4 py-3 text-sm text-paper-text outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-paper-text file:px-3 file:py-1.5 file:font-semibold file:text-paper focus:border-paper-text"
        />
        <span className="block text-xs text-paper-muted">{ts("coverHint")}</span>
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-paper-text">{t("name")}</span>
        <input
          name="name"
          defaultValue={venue.name}
          required
          className="w-full rounded-xl border border-paper-line bg-white px-4 py-3 text-paper-text outline-none focus:border-paper-text"
        />
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-paper-text">{t("type")}</span>
        <select
          name="type"
          defaultValue={venue.type}
          className="w-full rounded-xl border border-paper-line bg-white px-4 py-3 text-paper-text outline-none focus:border-paper-text"
        >
          {VENUE_TYPES.map((type) => (
            <option key={type} value={type}>
              {t(`types.${type}`)}
            </option>
          ))}
        </select>
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-paper-text">{t("city")}</span>
        <input
          name="city"
          defaultValue={venue.city}
          required
          className="w-full rounded-xl border border-paper-line bg-white px-4 py-3 text-paper-text outline-none focus:border-paper-text"
        />
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-paper-text">{t("address")}</span>
        <input
          name="address"
          defaultValue={venue.address}
          required
          className="w-full rounded-xl border border-paper-line bg-white px-4 py-3 text-paper-text outline-none focus:border-paper-text"
        />
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-paper-text">{t("description")}</span>
        <textarea
          name="description"
          defaultValue={venue.description}
          required
          rows={4}
          className="w-full rounded-xl border border-paper-line bg-white px-4 py-3 text-paper-text outline-none focus:border-paper-text"
        />
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-paper-text">{t("pib")}</span>
        <input
          value={venue.pib}
          readOnly
          className="w-full rounded-xl border border-paper-line bg-white px-4 py-3 text-paper-muted"
        />
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-paper-text">{t("phone")}</span>
        <input
          name="phone"
          type="tel"
          defaultValue={venue.phone}
          required
          className="w-full rounded-xl border border-paper-line bg-white px-4 py-3 text-paper-text outline-none focus:border-paper-text"
        />
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-paper-text">{t("proofUrl")}</span>
        <input
          name="proofUrl"
          type="url"
          defaultValue={venue.proofUrl}
          required
          className="w-full rounded-xl border border-paper-line bg-white px-4 py-3 text-paper-text outline-none focus:border-paper-text"
        />
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-paper-text">{ts("tableCapacity")}</span>
        <input
          name="tableCapacity"
          type="number"
          min={0}
          defaultValue={venue.tableCapacity}
          className="w-full rounded-xl border border-paper-line bg-white px-4 py-3 text-paper-text outline-none focus:border-paper-text"
        />
        <span className="block text-xs text-paper-muted">{ts("tableCapacityHint")}</span>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-paper-text">{ts("opensAt")}</span>
          <input
            name="opensAt"
            type="time"
            defaultValue={venue.opensAt}
            className="w-full rounded-xl border border-paper-line bg-white px-4 py-3 text-paper-text outline-none [color-scheme:light] focus:border-paper-text"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-paper-text">{ts("closesAt")}</span>
          <input
            name="closesAt"
            type="time"
            defaultValue={venue.closesAt}
            className="w-full rounded-xl border border-paper-line bg-white px-4 py-3 text-paper-text outline-none [color-scheme:light] focus:border-paper-text"
          />
        </label>
      </div>
      <label className="flex items-center gap-3 rounded-xl border border-paper-line bg-white px-4 py-3 text-paper-text">
        <input name="closed" type="checkbox" defaultChecked={venue.closed} className="h-4 w-4" />
        <span className="text-sm font-semibold">{ts("closed")}</span>
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-paper-text">{ts("noShowMinutes")}</span>
        <input
          name="noShowMinutes"
          type="number"
          min={15}
          max={240}
          defaultValue={venue.noShowMinutes}
          className="w-full rounded-xl border border-paper-line bg-white px-4 py-3 text-paper-text outline-none focus:border-paper-text"
        />
        <span className="block text-xs text-paper-muted">{ts("noShowHint")}</span>
      </label>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
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
