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
  const [ticket, setTicket] = useState<ScannedTicket | null>(null);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastCode = useRef("");
  const lastAt = useRef(0);

  function pauseCamera() {
    try {
      scannerRef.current?.pause(true);
    } catch {
      // ignore
    }
  }

  function resumeCamera() {
    try {
      scannerRef.current?.resume();
    } catch {
      // ignore
    }
  }

  function closePopup() {
    setOpen(false);
    setTicket(null);
    setError(null);
    lastCode.current = "";
    resumeCamera();
  }

  function applyResult(result: {
    error?: string;
    reservation?: ScannedTicket;
    warning?: "allIn";
    ok?: boolean;
  }) {
    if (result.reservation) {
      pauseCamera();
      setError(null);
      setTicket(result.reservation);
      setOpen(true);
      return;
    }
    if (result.ok) {
      setTicket((current) => (current ? { ...current, paymentStatus: "PAID" } : current));
      setOpen(true);
      return;
    }
    pauseCamera();
    setTicket(null);
    setError(result.error ?? "notFound");
    setOpen(true);
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

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") closePopup();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

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

  const unpaid = ticket?.paymentStatus !== "PAID";
  const used = Boolean(ticket?.allIn);

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
          <button type="submit" disabled={pending} className="btn btn-ghost !px-4 shrink-0">
            {t("lookup")}
          </button>
        </form>
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-bg/70 p-4 sm:items-center"
          onClick={closePopup}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl border border-paper-line bg-paper p-5 text-paper-text sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            {error ? (
              <p className="text-sm text-danger">{t(error)}</p>
            ) : ticket ? (
              <div className="space-y-4">
                {used ? (
                  <p className="rounded-xl bg-paper-2 px-4 py-3 text-sm font-semibold">{t("used")}</p>
                ) : null}

                <div>
                  <p className="text-sm text-paper-muted">{ticket.venueName}</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight">{ticket.eventTitle}</h2>
                  <p className="mt-1 text-sm text-paper-muted">
                    {tt("person", { seat: ticket.seat, total: ticket.guests })} ·{" "}
                    {formatDateTime(new Date(ticket.startsAt), locale)}
                  </p>
                </div>

                <p className="text-sm">
                  {ticket.guestName}
                  <span className="mt-0.5 block text-paper-muted">{ticket.guestEmail}</span>
                </p>

                <p className="text-sm text-paper-muted">
                  {ticket.paymentStatus === "PAID" ? tt("paid") : tt("unpaid")}
                  {used ? ` · ${t("used")}` : null}
                </p>

                {!used ? (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    {unpaid ? (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() =>
                          startTransition(async () =>
                            applyResult(await markReservationPaid(ticket.id, ticket.ticketId)),
                          )
                        }
                        className="btn btn-ghost"
                      >
                        {t("markPaid")}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() =>
                        startTransition(async () => applyResult(await checkInTicket(ticket.ticketId)))
                      }
                      className="btn btn-primary"
                    >
                      {t("doCheckIn")}
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}

            <button type="button" onClick={closePopup} className="btn btn-ghost btn-full mt-5">
              {t("close")}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
