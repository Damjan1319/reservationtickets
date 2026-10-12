"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { createMenu, createMenuItem, deleteMenu, deleteMenuItem, toggleMenu } from "@/app/actions/offer";
import { MENU_KINDS } from "@/lib/constants";

export function CreateMenuForm() {
  const t = useTranslations("offer");
  const tc = useTranslations("common");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <form
      className="grid gap-3 rounded-2xl border border-paper-line bg-paper p-5 text-paper-text sm:grid-cols-[1fr_10rem_auto]"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        start(async () => {
          const result = await createMenu(data);
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
        placeholder={t("menuTitle")}
        className="rounded-xl border border-paper-line bg-white px-4 py-3 text-paper-text outline-none focus:border-paper-text"
      />
      <select
        name="kind"
        className="rounded-xl border border-paper-line bg-white px-3 py-3 text-sm font-semibold text-paper-text outline-none"
      >
        {MENU_KINDS.map((kind) => (
          <option key={kind} value={kind}>
            {t(`menuKinds.${kind}`)}
          </option>
        ))}
      </select>
      <button type="submit" disabled={pending} className="btn btn-primary">
        {t("addMenu")}
      </button>
      {error ? <p className="text-sm text-danger sm:col-span-3">{error}</p> : null}
    </form>
  );
}

export function MenuActions({ menuId, published }: { menuId: string; published: boolean }) {
  const t = useTranslations("offer");
  const tc = useTranslations("common");
  const [pending, start] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        disabled={pending}
        className="btn btn-ghost !px-3 !py-1.5 text-sm"
        onClick={() => start(async () => { await toggleMenu(menuId); })}
      >
        {published ? t("hide") : t("publish")}
      </button>
      <button
        type="button"
        disabled={pending}
        className="btn btn-ghost !px-3 !py-1.5 text-sm text-danger"
        onClick={() => start(async () => { await deleteMenu(menuId); })}
      >
        {tc("delete")}
      </button>
    </div>
  );
}

export function AddMenuItemForm({ menuId }: { menuId: string }) {
  const t = useTranslations("offer");
  const tc = useTranslations("common");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <form
      className="mt-4 grid gap-2 sm:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        data.set("menuId", menuId);
        start(async () => {
          const result = await createMenuItem(data);
          if (result.error) setError(tc("required"));
          else {
            setError(null);
            form.reset();
          }
        });
      }}
    >
      <input
        name="name"
        required
        placeholder={t("itemName")}
        className="rounded-xl border border-paper-line bg-white px-3 py-2.5 text-sm text-paper-text outline-none focus:border-paper-text"
      />
      <input
        name="price"
        type="number"
        min={0}
        step={1}
        defaultValue={0}
        placeholder={t("itemPrice")}
        className="rounded-xl border border-paper-line bg-white px-3 py-2.5 text-sm text-paper-text outline-none focus:border-paper-text"
      />
      <input
        name="section"
        placeholder={t("itemSection")}
        className="rounded-xl border border-paper-line bg-white px-3 py-2.5 text-sm text-paper-text outline-none focus:border-paper-text"
      />
      <input
        name="description"
        placeholder={t("itemDescription")}
        className="rounded-xl border border-paper-line bg-white px-3 py-2.5 text-sm text-paper-text outline-none focus:border-paper-text"
      />
      <button type="submit" disabled={pending} className="btn btn-primary sm:col-span-2">
        {t("addItem")}
      </button>
      {error ? <p className="text-sm text-danger sm:col-span-2">{error}</p> : null}
    </form>
  );
}

export function DeleteItemButton({ itemId }: { itemId: string }) {
  const tc = useTranslations("common");
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      className="text-sm font-semibold text-danger hover:underline"
      onClick={() => start(async () => { await deleteMenuItem(itemId); })}
    >
      {tc("delete")}
    </button>
  );
}
