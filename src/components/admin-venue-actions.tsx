"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { deleteVenue, setVenueVerification } from "@/app/actions/venue";
import { AppDialog } from "@/components/app-dialog";

export function AdminVenueActions({ venueId, status }: { venueId: string; status: string }) {
  const t = useTranslations("admin");
  const tc = useTranslations("common");
  const [ask, setAsk] = useState<"disable" | "delete" | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {status !== "VERIFIED" ? (
        <button
          type="button"
          disabled={pending}
          className="btn btn-primary !px-4 !py-2"
          onClick={() => start(async () => { await setVenueVerification(venueId, "VERIFIED"); })}
        >
          {status === "DISABLED" ? t("enable") : t("approve")}
        </button>
      ) : null}

      {status === "PENDING" ? (
        <button
          type="button"
          disabled={pending}
          className="btn btn-ghost !px-4 !py-2"
          onClick={() => start(async () => { await setVenueVerification(venueId, "REJECTED"); })}
        >
          {t("reject")}
        </button>
      ) : null}

      {status === "VERIFIED" ? (
        <button
          type="button"
          disabled={pending}
          className="btn btn-ghost !px-4 !py-2"
          onClick={() => setAsk("disable")}
        >
          {t("disable")}
        </button>
      ) : null}

      <button
        type="button"
        disabled={pending}
        className="btn btn-ghost !px-4 !py-2 text-danger"
        onClick={() => setAsk("delete")}
      >
        {t("delete")}
      </button>

      <AppDialog
        open={ask === "disable"}
        title={t("disableAsk")}
        confirmLabel={t("disable")}
        cancelLabel={tc("cancel")}
        onCancel={() => setAsk(null)}
        onConfirm={() => {
          setAsk(null);
          start(async () => {
            await setVenueVerification(venueId, "DISABLED");
          });
        }}
      >
        {t("disableHint")}
      </AppDialog>

      <AppDialog
        open={ask === "delete"}
        title={t("deleteAsk")}
        confirmLabel={t("delete")}
        cancelLabel={tc("cancel")}
        danger
        onCancel={() => setAsk(null)}
        onConfirm={() => {
          setAsk(null);
          start(async () => {
            await deleteVenue(venueId);
          });
        }}
      >
        {t("deleteHint")}
      </AppDialog>
    </div>
  );
}
