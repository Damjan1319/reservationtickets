"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { cancelReservation, confirmReservation } from "@/app/actions/reservation";
import { AppDialog } from "@/components/app-dialog";

export function DecideButtons({ id, status }: { id: string; status: string }) {
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");
  const [pending, startTransition] = useTransition();
  const [ask, setAsk] = useState<"confirm" | "cancel" | null>(null);

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
          onClick={() => setAsk("confirm")}
        >
          {t("confirmBooking")}
        </button>
      )}
      <button
        type="button"
        disabled={pending}
        className="btn btn-ghost !px-4 !py-2"
        onClick={() => setAsk("cancel")}
      >
        {t("cancelBooking")}
      </button>

      <AppDialog
        open={ask === "confirm"}
        title={t("confirmBookingAsk")}
        confirmLabel={t("confirmBooking")}
        cancelLabel={tc("cancel")}
        onCancel={() => setAsk(null)}
        onConfirm={() => {
          setAsk(null);
          startTransition(async () => {
            await confirmReservation(id);
          });
        }}
      />
      <AppDialog
        open={ask === "cancel"}
        title={t("cancelBookingAsk")}
        confirmLabel={t("cancelBooking")}
        cancelLabel={tc("cancel")}
        danger
        onCancel={() => setAsk(null)}
        onConfirm={() => {
          setAsk(null);
          startTransition(async () => {
            await cancelReservation(id);
          });
        }}
      />
    </div>
  );
}
