"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState, useTransition } from "react";
import { registerVenue } from "@/app/actions/venue";
import { VENUE_TYPES } from "@/lib/constants";
import { slugify } from "@/lib/utils";

export function RegisterVenueForm({ signedIn }: { signedIn: boolean }) {
  const t = useTranslations("venue");
  const ta = useTranslations("auth");
  const tc = useTranslations("common");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const preview = useMemo(() => slugify(slug || name) || "tvoj-lokal", [name, slug]);

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(async () => {
          const result = await registerVenue(data);
          if (result?.error) {
            setError(result.error === "exists" ? ta("exists") : t(result.error));
          }
        });
      }}
    >
      {!signedIn ? (
        <>
          <label className="block space-y-2">
            <span className="text-sm text-paper-muted">{ta("name")}</span>
            <input
              name="ownerName"
              required
              className="w-full rounded-xl border border-paper-line bg-paper-2 px-4 py-3 outline-none focus:border-paper-text"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm text-paper-muted">{ta("email")}</span>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-xl border border-paper-line bg-paper-2 px-4 py-3 outline-none focus:border-paper-text"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm text-paper-muted">{ta("password")}</span>
            <input
              name="password"
              type="password"
              minLength={6}
              required
              className="w-full rounded-xl border border-paper-line bg-paper-2 px-4 py-3 outline-none focus:border-paper-text"
            />
          </label>
          <div className="border-t border-paper-line pt-4" />
        </>
      ) : null}

      <label className="block space-y-2">
        <span className="text-sm text-paper-muted">{t("name")}</span>
        <input
          name="name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            if (!slugTouched) setSlug(slugify(event.target.value));
          }}
          required
          className="w-full rounded-xl border border-paper-line bg-paper-2 px-4 py-3 outline-none focus:border-paper-text"
        />
      </label>
      <label className="block space-y-2">
        <span className="text-sm text-paper-muted">{t("slug")}</span>
        <input
          name="slug"
          value={slug}
          onChange={(event) => {
            setSlugTouched(true);
            setSlug(slugify(event.target.value));
          }}
          required
          className="w-full rounded-xl border border-paper-line bg-paper-2 px-4 py-3 outline-none focus:border-paper-text"
        />
        <span className="block text-xs text-paper-muted">{t("slugHint", { slug: preview })}</span>
      </label>
      <label className="block space-y-2">
        <span className="text-sm text-paper-muted">{t("type")}</span>
        <select
          name="type"
          className="w-full rounded-xl border border-paper-line bg-paper-2 px-4 py-3 outline-none focus:border-paper-text"
        >
          {VENUE_TYPES.map((type) => (
            <option key={type} value={type}>
              {t(`types.${type}`)}
            </option>
          ))}
        </select>
      </label>
      <label className="block space-y-2">
        <span className="text-sm text-paper-muted">{t("city")}</span>
        <input
          name="city"
          required
          className="w-full rounded-xl border border-paper-line bg-paper-2 px-4 py-3 outline-none focus:border-paper-text"
        />
      </label>
      <label className="block space-y-2">
        <span className="text-sm text-paper-muted">{t("address")}</span>
        <input
          name="address"
          required
          className="w-full rounded-xl border border-paper-line bg-paper-2 px-4 py-3 outline-none focus:border-paper-text"
        />
      </label>
      <label className="block space-y-2">
        <span className="text-sm text-paper-muted">{t("description")}</span>
        <textarea
          name="description"
          required
          rows={4}
          className="w-full rounded-xl border border-paper-line bg-paper-2 px-4 py-3 outline-none focus:border-paper-text"
        />
      </label>
      <div className="rounded-2xl bg-paper-2 p-4">
        <p className="font-medium">{t("proofTitle")}</p>
        <p className="mt-1 text-xs text-paper-muted">{t("proofHint")}</p>
      </div>
      <label className="block space-y-2">
        <span className="text-sm text-paper-muted">{t("pib")}</span>
        <input
          name="pib"
          inputMode="numeric"
          required
          maxLength={9}
          placeholder="123456789"
          className="w-full rounded-xl border border-paper-line bg-paper-2 px-4 py-3 outline-none focus:border-paper-text"
        />
      </label>
      <label className="block space-y-2">
        <span className="text-sm text-paper-muted">{t("phone")}</span>
        <input
          name="phone"
          type="tel"
          required
          placeholder="+381 11 123 4567"
          className="w-full rounded-xl border border-paper-line bg-paper-2 px-4 py-3 outline-none focus:border-paper-text"
        />
      </label>
      <label className="block space-y-2">
        <span className="text-sm text-paper-muted">{t("proofUrl")}</span>
        <input
          name="proofUrl"
          type="url"
          required
          placeholder="https://maps.google.com/..."
          className="w-full rounded-xl border border-paper-line bg-paper-2 px-4 py-3 outline-none focus:border-paper-text"
        />
      </label>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary btn-full"
      >
        {pending ? tc("loading") : t("submit")}
      </button>
    </form>
  );
}
