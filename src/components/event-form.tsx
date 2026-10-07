"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { createEvent, updateEvent } from "@/app/actions/event";

type EventFormProps = {
  event?: {
    id: string;
    title: string;
    artist: string;
    description: string;
    startsAt: string;
    capacity: number;
    price: number;
  };
};

export function EventForm({ event }: EventFormProps) {
  const t = useTranslations("event");
  const tc = useTranslations("common");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4"
      onSubmit={(formEvent) => {
        formEvent.preventDefault();
        const data = new FormData(formEvent.currentTarget);
        startTransition(async () => {
          const result = event ? await updateEvent(event.id, data) : await createEvent(data);
          if (result?.error) setError(tc("required"));
        });
      }}
    >
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-paper-text">{t("title")}</span>
        <input
          name="title"
          defaultValue={event?.title}
          required
          className="w-full rounded-xl border border-paper-line bg-white px-4 py-3 text-paper-text outline-none [color-scheme:light] focus:border-paper-text"
        />
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-paper-text">{t("artist")}</span>
        <input
          name="artist"
          defaultValue={event?.artist}
          placeholder={t("artistHint")}
          className="w-full rounded-xl border border-paper-line bg-white px-4 py-3 text-paper-text outline-none [color-scheme:light] focus:border-paper-text"
        />
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-paper-text">{t("description")}</span>
        <textarea
          name="description"
          defaultValue={event?.description}
          required
          rows={4}
          className="w-full rounded-xl border border-paper-line bg-white px-4 py-3 text-paper-text outline-none [color-scheme:light] focus:border-paper-text"
        />
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-paper-text">{t("startsAt")}</span>
        <input
          name="startsAt"
          type="datetime-local"
          defaultValue={event?.startsAt}
          required
          className="w-full rounded-xl border border-paper-line bg-white px-4 py-3 text-paper-text outline-none [color-scheme:light] focus:border-paper-text"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-paper-text">{t("capacity")}</span>
          <input
            name="capacity"
            type="number"
            min={1}
            defaultValue={event?.capacity ?? 40}
            required
            className="w-full rounded-xl border border-paper-line bg-white px-4 py-3 text-paper-text outline-none [color-scheme:light] focus:border-paper-text"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-paper-text">{t("price")}</span>
          <input
            name="price"
            type="number"
            min={0}
            defaultValue={event?.price ?? 0}
            required
            className="w-full rounded-xl border border-paper-line bg-white px-4 py-3 text-paper-text outline-none [color-scheme:light] focus:border-paper-text"
          />
        </label>
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary"
      >
        {event ? t("update") : t("create")}
      </button>
    </form>
  );
}
