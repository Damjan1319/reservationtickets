"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { cancelReservation, confirmReservation } from "@/app/actions/reservation";

export function DecideButtons({ id, status }: { id: string; status: string }) {
  const t = useTranslations("dashboard");
  const [pending, startTransition] = useTransition();

  if (status === "CANCELLED") {
    return <p className="text-sm text-paper-muted">{t("statusCancelled")}</p>;
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {status === "CONFIRMED" ? (
        <p className="text-sm text-paper-muted">{t("statusConfirmed")}</p>
      ) : (
        <button
          type="button"
          disabled={pending}
          className="btn btn-primary !px-4 !py-2"
          onClick={() => startTransition(async () => { await confirmReservation(id); })}
        >
          {t("confirmBooking")}
        </button>
      )}
      <button
        type="button"
        disabled={pending}
        className="btn btn-ghost !px-4 !py-2"
        onClick={() => startTransition(async () => { await cancelReservation(id); })}
      >
        {t("cancelBooking")}
      </button>
    </div>
  );
}
