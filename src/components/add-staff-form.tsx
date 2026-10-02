"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { addStaffMember } from "@/app/actions/staff";

export function AddStaffForm() {
  const t = useTranslations("staff");
  const ta = useTranslations("auth");
  const tv = useTranslations("validation");
  const tc = useTranslations("common");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="grid gap-3 sm:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        startTransition(async () => {
          const result = await addStaffMember(data);
          if (result.error) {
            setMessage(null);
            setError(result.error === "minPassword" ? tv("minPassword") : result.error === "exists" ? t("exists") : tc("required"));
            return;
          }
          setError(null);
          setMessage(t("added"));
          form.reset();
        });
      }}
    >
      <input
        name="name"
        placeholder={ta("name")}
        required
        className="rounded-xl border border-line bg-surface-2 px-4 py-3 outline-none focus:border-gold"
      />
      <input
        name="email"
        type="email"
        placeholder={ta("email")}
        required
        className="rounded-xl border border-line bg-surface-2 px-4 py-3 outline-none focus:border-gold"
      />
      <input
        name="password"
        type="password"
        minLength={6}
        placeholder={ta("password")}
        className="rounded-xl border border-line bg-surface-2 px-4 py-3 outline-none focus:border-gold sm:col-span-2"
      />
      {error ? <p className="text-sm text-danger sm:col-span-2">{error}</p> : null}
      {message ? <p className="text-sm text-success sm:col-span-2">{message}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary sm:col-span-2"
      >
        {t("add")}
      </button>
    </form>
  );
}
