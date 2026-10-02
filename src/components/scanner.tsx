"use client";

import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, useTransition } from "react";
import { checkInTicket, lookupTicket, markReservationPaid, type ScannedTicket } from "@/app/actions/reservation";
import { formatDateTime } from "@/lib/utils";

async function stopScanner(scanner: Html5Qrcode) {
  try {
    const state = scanner.getState();
    if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
      await scanner.stop();
    }
  } catch {
    // ignore
  }
  try {
    scanner.clear();
  } catch {
    // ignore
  }
}

export function Scanner({ locale }: { locale: string }) {
  const t = useTranslations("scan");
  const tt = useTranslations("ticket");
  const [cameraError, setCameraError] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [ticket, setTicket] = useState<ScannedTicket | null>(null);
  const [pending, startTransition] = useTransition();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastCode = useRef("");
  const lastAt = useRef(0);

  function applyResult(result: Awaited<ReturnType<typeof lookupTicket>> & { warning?: "allIn" }) {
    if ("reservation" in result && result.reservation) {
      setError(null);
      setTicket(result.reservation);
      setNotice(result.warning === "allIn" || result.reservation.allIn ? "allIn" : null);
      return;
    }
    setTicket(null);
    setNotice(null);
    setError(result.error ?? "notFound");
  }

  function lookup(code: string) {
    const normalized = code.trim();
    if (!normalized) return;
    const now = Date.now();
    if (normalized === lastCode.current && now - lastAt.current < 1200) return;
    lastCode.current = normalized;
    lastAt.current = now;
    startTransition(async () => {
      applyResult(await lookupTicket(normalized));
    });
  }

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        void stopScanner(scannerRef.current);
        scannerRef.current = null;
      }
    };
  }, []);

  async function startCamera() {
    setCameraError(false);
    setStarting(true);
    try {
      if (scannerRef.current) {
        await stopScanner(scannerRef.current);
        scannerRef.current = null;
      }
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 8, qrbox: { width: 220, height: 220 } },
        (decoded) => lookup(decoded),
        () => undefined,
      );
      setCameraOn(true);
    } catch {
      setCameraError(true);
      setCameraOn(false);
    } finally {
      setStarting(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-xl gap-5">
      <div className="space-y-3">
        <div
          id="qr-reader"
          className="min-h-40 overflow-hidden rounded-2xl border border-paper-line bg-paper-2 [&_video]:w-full"
        />
        {!cameraOn ? (
          <button
            type="button"
            onClick={() => void startCamera()}
            disabled={starting}
            className="btn btn-primary btn-full"
          >
            {starting ? t("starting") : t("startCamera")}
          </button>
        ) : (
          <p className="text-center text-sm text-paper-muted">{t("ready")}</p>
        )}
        {cameraError ? <p className="text-sm text-danger">{t("cameraError")}</p> : null}
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            lastCode.current = "";
            lookup(String(data.get("code") ?? ""));
          }}
        >
          <input
            name="code"
            placeholder={t("manual")}
            className="min-w-0 flex-1 rounded-xl border border-paper-line bg-paper-2 px-4 py-3 outline-none focus:border-paper-text"
          />
          <button
            type="submit"
            disabled={pending}
            className="shrink-0 btn btn-ghost !px-4"
          >
            {t("lookup")}
          </button>
        </form>
      </div>

      <div className="rounded-2xl bg-paper-2 p-5">
        {error ? <p className="text-danger">{t(error)}</p> : null}
        {ticket ? (
          <div className="space-y-4">
            {notice === "allIn" ? (
              <p className="rounded-xl bg-paper px-4 py-3 text-sm text-paper-muted">
                {t("alreadyIn")}
              </p>
            ) : (
              <p className="rounded-xl bg-paper px-4 py-3 text-sm">
                {t("entered", { current: ticket.checkedInCount, total: ticket.guests, seat: ticket.seat })}
              </p>
            )}
            <div>
              <p className="text-xs font-medium text-paper-muted">{ticket.venueName}</p>
                <p className="mt-2 text-xl font-semibold leading-tight">{ticket.eventTitle}</p>
              <p className="mt-1 text-sm text-paper-muted">
                {tt("person", { seat: ticket.seat, total: ticket.guests })} · {formatDateTime(new Date(ticket.startsAt), locale)}
              </p>
            </div>
            <p className="text-sm">
              {ticket.guestName}
              <span className="block text-paper-muted">{ticket.guestEmail}</span>
            </p>
            <p className={`text-sm font-medium ${ticket.paymentStatus === "PAID" ? "text-success" : "text-danger"}`}>
              {ticket.paymentStatus === "PAID" ? tt("paid") : tt("unpaid")}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              {ticket.paymentStatus === "UNPAID" ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => applyResult(await markReservationPaid(ticket.id)))
                  }
                  className="btn btn-ghost text-danger"
                >
                  {t("markPaid")}
                </button>
              ) : null}
              {!ticket.allIn ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => startTransition(async () => applyResult(await checkInTicket(ticket.ticketId)))}
                  className="btn btn-primary"
                >
                  {t("doCheckIn")}
                </button>
              ) : null}
            </div>
          </div>
        ) : !error ? (
          <p className="text-paper-muted">{t("subtitle")}</p>
        ) : null}
      </div>
    </div>
  );
}
