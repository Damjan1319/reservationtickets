"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { createPromotion, deletePromotion, togglePromotion } from "@/app/actions/offer";
import { PROMO_KINDS } from "@/lib/constants";

export function CreatePromoForm() {
  const t = useTranslations("offer");
  const tc = useTranslations("common");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <form
      className="grid gap-3 rounded-2xl border border-paper-line bg-paper p-5 text-paper-text"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        start(async () => {
          const result = await createPromotion(data);
          if (result.error) setError(tc("required"));
          else {
            setError(null);
            form.reset();
          }
        });
      }}
    >
      <input
        name="title"
        required
        placeholder={t("promoTitle")}
        className="rounded-xl border border-paper-line bg-white px-4 py-3 text-paper-text outline-none focus:border-paper-text"
      />
      <textarea
        name="body"
        rows={3}
        placeholder={t("promoBody")}
        className="rounded-xl border border-paper-line bg-white px-4 py-3 text-paper-text outline-none focus:border-paper-text"
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <select
          name="kind"
          className="rounded-xl border border-paper-line bg-white px-3 py-3 text-sm font-semibold text-paper-text outline-none"
        >
          {PROMO_KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {t(`promoKinds.${kind}`)}
            </option>
          ))}
        </select>
        <input
          name="startsAt"
          type="datetime-local"
          className="rounded-xl border border-paper-line bg-white px-3 py-3 text-sm text-paper-text outline-none [color-scheme:light]"
        />
        <input
          name="endsAt"
          type="datetime-local"
          className="rounded-xl border border-paper-line bg-white px-3 py-3 text-sm text-paper-text outline-none [color-scheme:light]"
        />
      </div>
      <button type="submit" disabled={pending} className="btn btn-primary justify-self-start">
        {t("addPromo")}
      </button>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </form>
  );
}

export function PromoActions({ promoId, active }: { promoId: string; active: boolean }) {
  const t = useTranslations("offer");
  const tc = useTranslations("common");
  const [pending, start] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        disabled={pending}
        className="btn btn-ghost !px-3 !py-1.5 text-sm"
        onClick={() => start(async () => { await togglePromotion(promoId); })}
      >
        {active ? t("pause") : t("activate")}
      </button>
      <button
        type="button"
        disabled={pending}
        className="btn btn-ghost !px-3 !py-1.5 text-sm text-danger"
        onClick={() => start(async () => { await deletePromotion(promoId); })}
      >
        {tc("delete")}
      </button>
    </div>
  );
}
