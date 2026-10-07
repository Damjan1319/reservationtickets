"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createReservation } from "@/app/actions/reservation";
import { AppDialog } from "@/components/app-dialog";
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
  const tt = useTranslations("ticket");
  const router = useRouter();
  const [guests, setGuests] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [doneId, setDoneId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (remaining <= 0) {
    return <p className="text-danger">{te("soldOut")}</p>;
  }

  return (
    <>
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
            else if (result?.ok) setDoneId(result.id);
          });
        }}
      >
        <div>
          <p className="mb-3 text-sm font-semibold text-paper-text">{t("guests")}</p>
          <GuestCount value={guests} onChange={setGuests} max={remaining} />
        </div>

        <div className="rounded-2xl border border-paper-line p-4">
          <p className="font-semibold">{t("onsite")}</p>
          <p className="mt-1 text-sm font-medium text-paper-muted">{t("onsiteHint")}</p>
        </div>

        <div className="flex items-center justify-between border-t border-paper-line pt-4">
          <span className="font-medium text-paper-muted">{t("total")}</span>
          <span className="text-2xl font-bold">{formatMoney(price * guests, locale)}</span>
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

      <AppDialog
        open={Boolean(doneId)}
        title={t("success")}
        confirmLabel={tt("viewReservation")}
        cancelLabel={tc("close")}
        onConfirm={() => doneId && router.push(`/tickets/${doneId}`)}
        onCancel={() => router.push("/tickets")}
      >
        {tt("bookedEvent")}
      </AppDialog>
    </>
  );
}
