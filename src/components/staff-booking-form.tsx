"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { staffCreateBooking } from "@/app/actions/reservation";
import { GuestCount } from "@/components/guest-count";
import { MEAL_TYPES } from "@/lib/constants";
import { cn, todayInputValue } from "@/lib/utils";

type EventOption = { id: string; title: string };

export function StaffBookingForm({ events }: { events: EventOption[] }) {
  const t = useTranslations("booking");
  const td = useTranslations("dashboard");
  const te = useTranslations("event");
  const tc = useTranslations("common");
  const [kind, setKind] = useState<"TABLE" | "EVENT">("TABLE");
  const [mealType, setMealType] = useState<(typeof MEAL_TYPES)[number]>("DINNER");
  const [guests, setGuests] = useState(2);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        data.set("kind", kind);
        data.set("mealType", mealType);
        data.set("guests", String(guests));
        startTransition(async () => {
          const result = await staffCreateBooking(data);
          if (result?.error) setError(result.error);
        });
      }}
    >
      <div className="grid grid-cols-2 gap-2">
        {(["TABLE", "EVENT"] as const).map((next) => (
          <button
            key={next}
            type="button"
            onClick={() => setKind(next)}
            className={cn(
              "rounded-2xl border px-3 py-3 text-sm font-semibold",
              kind === next
                ? "border-paper-text bg-paper-text text-paper"
                : "border-paper-line bg-white text-paper-text hover:border-paper-text/50",
            )}
          >
            {next === "TABLE" ? td("tables") : td("tickets")}
          </button>
        ))}
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-paper-text">{td("guest")}</span>
        <input
          name="guestName"
          required
          className="w-full rounded-xl border border-paper-line bg-paper-2 px-4 py-3 outline-none focus:border-paper-text"
        />
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-paper-text">{t("email")}</span>
        <input
          name="guestEmail"
          type="email"
          required
          className="w-full rounded-xl border border-paper-line bg-paper-2 px-4 py-3 outline-none focus:border-paper-text"
        />
      </label>

      {kind === "TABLE" ? (
        <>
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
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-paper-text">{t("date")}</span>
              <input
                name="date"
                type="date"
                required
                defaultValue={todayInputValue()}
                className="w-full rounded-xl border border-paper-line bg-paper-2 px-4 py-3 font-semibold text-paper-text outline-none [color-scheme:light] focus:border-paper-text"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-paper-text">{t("time")}</span>
              <input
                name="time"
                type="time"
                required
                defaultValue="20:00"
                className="w-full rounded-xl border border-paper-line bg-paper-2 px-4 py-3 font-semibold text-paper-text outline-none [color-scheme:light] focus:border-paper-text"
              />
            </label>
          </div>
        </>
      ) : (
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-paper-text">{td("parties")}</span>
          <select
            name="eventId"
            required
            className="w-full rounded-xl border border-paper-line bg-paper-2 px-4 py-3 outline-none focus:border-paper-text"
          >
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
        </label>
      )}

      <div>
        <p className="mb-3 text-sm font-semibold text-paper-text">{t("guests")}</p>
        <GuestCount value={guests} onChange={setGuests} />
      </div>

      {kind === "EVENT" ? (
        <input type="hidden" name="paymentMethod" value="ONSITE" />
      ) : null}

      {error ? (
        <p className="text-sm text-danger">{error === "full" ? t("full") : error === "past" ? te("past") : tc("required")}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending || (kind === "EVENT" && events.length === 0)}
        className="btn btn-primary btn-full"
      >
        {te("book")}
      </button>
    </form>
  );
}
