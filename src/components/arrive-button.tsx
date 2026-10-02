"use client";

import { useTransition } from "react";
import { markTableArrived } from "@/app/actions/reservation";
import { useTranslations } from "next-intl";

export function ArriveButton({ id, arrived }: { id: string; arrived: boolean }) {
  const t = useTranslations("dashboard");
  const [pending, startTransition] = useTransition();

  if (arrived) {
    return <span className="text-sm text-muted">{t("arrived")}</span>;
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(async () => markTableArrived(id))}
      className="rounded-full border border-line px-3 py-1.5 text-sm hover:border-cream"
    >
      {t("markArrived")}
    </button>
  );
}
