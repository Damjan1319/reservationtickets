"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { createReservation } from "@/app/actions/reservation";
import { GuestCount } from "@/components/guest-count";
import { formatMoney } from "@/lib/utils";

type BookingFormProps = {
  eventId: string;
  price: number;
  remaining: number;
  locale: string;
};

export function BookingForm({ eventId, price, remaining, locale }: BookingFormProps) {
  const t = useTranslations("booking");
  const te = useTranslations("event");
  const tc = useTranslations("common");
  const [guests, setGuests] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (remaining <= 0) {
    return <p className="text-danger">{te("soldOut")}</p>;
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData();
        data.set("eventId", eventId);
        data.set("guests", String(guests));
        data.set("paymentMethod", "ONSITE");
        startTransition(async () => {
          const result = await createReservation(data);
          if (result?.error) setError(result.error);
        });
      }}
    >
      <div>
        <p className="mb-3 text-sm text-paper-muted">{t("guests")}</p>
        <GuestCount value={guests} onChange={setGuests} max={remaining} />
      </div>

      <div className="rounded-2xl border border-paper-line p-4">
        <p className="font-medium">{t("onsite")}</p>
        <p className="mt-1 text-sm text-paper-muted">{t("onsiteHint")}</p>
      </div>

      <div className="flex items-center justify-between border-t border-paper-line pt-4">
        <span className="text-paper-muted">{t("total")}</span>
        <span className="text-2xl font-semibold">{formatMoney(price * guests, locale)}</span>
      </div>

      {error ? (
        <p className="text-sm text-danger">
          {error === "auth"
            ? t("needLogin")
            : error === "past"
              ? te("past")
              : error === "unverified"
                ? t("unverified")
                : error === "required"
                ? tc("required")
                : t(error)}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="btn btn-primary btn-full">
        {te("book")}
      </button>
    </form>
  );
}
