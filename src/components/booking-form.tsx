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
  const [method, setMethod] = useState<"ONLINE" | "ONSITE">("ONSITE");
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
        data.set("paymentMethod", method);
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

      <PaymentFields method={method} onChange={setMethod} />

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

      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary btn-full"
      >
        {method === "ONLINE" ? t("confirmOnline") : te("book")}
      </button>
    </form>
  );
}

export function PaymentFields({
  method,
  onChange,
}: {
  method: "ONLINE" | "ONSITE";
  onChange: (next: "ONLINE" | "ONSITE") => void;
}) {
  const t = useTranslations("booking");

  return (
    <div className="space-y-3">
      <p className="text-sm text-paper-muted">{t("payment")}</p>
      <label className="flex cursor-pointer gap-3 rounded-2xl border border-paper-line p-4 has-[:checked]:border-paper-text">
        <input
          type="radio"
          name="payment"
          checked={method === "ONLINE"}
          onChange={() => onChange("ONLINE")}
          className="mt-1 accent-current"
        />
        <span>
          <span className="block">{t("online")}</span>
          <span className="text-sm text-paper-muted">{t("onlineHint")}</span>
        </span>
      </label>
      <label className="flex cursor-pointer gap-3 rounded-2xl border border-paper-line p-4 has-[:checked]:border-paper-text">
        <input
          type="radio"
          name="payment"
          checked={method === "ONSITE"}
          onChange={() => onChange("ONSITE")}
          className="mt-1 accent-current"
        />
        <span>
          <span className="block">{t("onsite")}</span>
          <span className="text-sm text-paper-muted">{t("onsiteHint")}</span>
        </span>
      </label>
    </div>
  );
}
