"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createTableReservation } from "@/app/actions/reservation";
import { AppDialog } from "@/components/app-dialog";
import { GuestCount } from "@/components/guest-count";
import { MEAL_TYPES, MEAL_HOURS } from "@/lib/constants";
import { cn, todayInputValue } from "@/lib/utils";

export function TableBookingForm({ venueId }: { venueId: string }) {
  const t = useTranslations("booking");
  const te = useTranslations("event");
  const tc = useTranslations("common");
  const tt = useTranslations("ticket");
  const router = useRouter();
  const [mealType, setMealType] = useState<(typeof MEAL_TYPES)[number]>("DINNER");
  const [guests, setGuests] = useState(2);
  const [error, setError] = useState<string | null>(null);
  const [doneId, setDoneId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <form
        className="space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          data.set("venueId", venueId);
          data.set("mealType", mealType);
          data.set("guests", String(guests));
          startTransition(async () => {
            const result = await createTableReservation(data);
            if (result?.error) setError(result.error);
            else if (result?.ok) setDoneId(result.id);
          });
        }}
      >
        <div>
          <p className="mb-3 text-sm font-semibold text-paper-text">{t("meal")}</p>
          <div className="grid grid-cols-2 gap-2">
            {MEAL_TYPES.map((meal) => (
              <button
                key={meal}
                type="button"
                onClick={() => setMealType(meal)}
                className={cn(
                  "rounded-2xl border px-3 py-3 text-sm font-semibold",
                  mealType === meal
                    ? "border-paper-text bg-paper-text text-paper"
                    : "border-paper-line bg-white text-paper-text hover:border-paper-text/50",
                )}
              >
                {t(`meals.${meal}`)}
              </button>
            ))}
          </div>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-paper-text">{t("date")}</span>
          <input
            name="date"
            type="date"
            required
            min={todayInputValue()}
            defaultValue={todayInputValue()}
            className="w-full rounded-xl border border-paper-line bg-white px-4 py-3 font-semibold text-paper-text outline-none [color-scheme:light] focus:border-paper-text"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-paper-text">{t("time")}</span>
          <input
            key={mealType}
            name="time"
            type="time"
            required
            defaultValue={`${String(MEAL_HOURS[mealType]).padStart(2, "0")}:00`}
            className="w-full rounded-xl border border-paper-line bg-white px-4 py-3 font-semibold text-paper-text outline-none [color-scheme:light] focus:border-paper-text"
          />
        </label>

        <div>
          <p className="mb-3 text-sm font-semibold text-paper-text">{t("guests")}</p>
          <GuestCount value={guests} onChange={setGuests} />
        </div>

        {error ? (
          <p className="text-sm text-danger">
            {error === "auth"
              ? t("needLogin")
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
        {tt("bookedTable")}
      </AppDialog>
    </>
  );
}
