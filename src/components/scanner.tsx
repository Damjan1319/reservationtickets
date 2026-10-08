"use client";

import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, useTransition } from "react";
import { admitByCode, type ScannedTicket } from "@/app/actions/reservation";
import { formatDate, formatTime } from "@/lib/utils";

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

function beep(ok: boolean) {
  try {
    const ctx = new AudioContext();
    const tone = ctx.createOscillator();
    const gain = ctx.createGain();
    tone.type = "sine";
    tone.frequency.value = ok ? 880 : 220;
    gain.gain.value = 0.06;
    tone.connect(gain);
    gain.connect(ctx.destination);
    tone.start();
    tone.stop(ctx.currentTime + 0.14);
  } catch {
    /* ignore */
  }
}

export function Scanner({ locale, onNeedList }: { locale: string; onNeedList?: () => void }) {
  const t = useTranslations("scan");
  const tt = useTranslations("ticket");
  const tb = useTranslations("booking");
  const [cameraError, setCameraError] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [starting, setStarting] = useState(false);
  const [torch, setTorch] = useState(false);
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
    entered?: boolean;
  }) {
    if (result.reservation) {
      pauseCamera();
      setError(null);
      setTicket(result.reservation);
      setOpen(true);
      beep(true);
      return;
    }
    if (result.ok) {
      setTicket((current) => (current ? { ...current, paymentStatus: "PAID" } : current));
      setOpen(true);
      beep(true);
      return;
    }
    pauseCamera();
    setTicket(null);
    setError(result.error ?? "notFound");
    setOpen(true);
    beep(false);
  }

  function lookup(code: string) {
    const normalized = code.trim();
    if (!normalized) return;
    const now = Date.now();
    if (normalized === lastCode.current && now - lastAt.current < 1200) return;
    lastCode.current = normalized;
    lastAt.current = now;
    startTransition(async () => {
      applyResult(await admitByCode(normalized));
    });
  }

  useEffect(() => {
    let cancelled = false;
    async function start() {
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
          { fps: 10, qrbox: { width: 260, height: 260 } },
          (decoded) => lookup(decoded),
          () => undefined,
        );
        if (cancelled) {
          await stopScanner(scanner);
          return;
        }
        setCameraOn(true);
      } catch {
        if (!cancelled) {
          setCameraError(true);
          setCameraOn(false);
        }
      } finally {
        if (!cancelled) setStarting(false);
      }
    }
    void start();
    return () => {
      cancelled = true;
      if (scannerRef.current) {
        void stopScanner(scannerRef.current);
        scannerRef.current = null;
      }
    };
    // Start once when the door scanner mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") closePopup();
    }
    window.addEventListener("keydown", onKey);
    const autoClose = error ? 0 : window.setTimeout(() => closePopup(), 1600);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (autoClose) window.clearTimeout(autoClose);
    };
  }, [open, error, ticket?.ticketId]);

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
        { fps: 10, qrbox: { width: 260, height: 260 } },
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

  const used = Boolean(ticket?.allIn);
  const when = ticket ? new Date(ticket.startsAt) : null;
  const kindLabel = ticket?.kind === "TABLE"
    ? ticket.mealType
      ? `${tt("table")} · ${tb(`meals.${ticket.mealType}`)}`
      : tt("kindTable")
    : ticket?.eventTitle;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-3">
      <div
        id="qr-reader"
        className="relative min-h-[min(72dvh,640px)] flex-1 overflow-hidden rounded-3xl bg-black [&_img]:hidden [&_video]:absolute [&_video]:inset-0 [&_video]:h-full [&_video]:w-full [&_video]:object-cover"
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
        <p className="text-center text-sm font-medium text-cream">{t("ready")}</p>
      )}
      {cameraOn ? (
        <button
          type="button"
          onClick={() => {
            const next = !torch;
            setTorch(next);
            try {
              void scannerRef.current?.applyVideoConstraints({
                advanced: [{ torch: next }],
              } as never);
            } catch {
              /* ignore */
            }
          }}
          className="btn btn-ghost btn-full"
        >
          {torch ? t("torchOff") : t("torchOn")}
        </button>
      ) : null}
      {cameraError ? (
        <div className="space-y-2 text-center">
          <p className="text-sm text-danger">{t("cameraError")}</p>
          {onNeedList ? (
            <button type="button" onClick={onNeedList} className="btn btn-primary btn-full">
              {t("toList")}
            </button>
          ) : null}
        </div>
      ) : null}
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
          className="min-w-0 flex-1 rounded-xl border border-line bg-surface px-4 py-3 text-cream outline-none focus:border-cream"
        />
        <button type="submit" disabled={pending} className="btn btn-ghost !px-4 shrink-0">
          {t("lookup")}
        </button>
      </form>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
          onClick={closePopup}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-3xl bg-paper p-6 text-paper-text shadow-2xl sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            {error ? (
              <p className="text-3xl font-bold leading-snug">{t(error)}</p>
            ) : ticket && when ? (
              <div className="space-y-5">
                <p
                  className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                    used ? "bg-paper-text text-paper" : "bg-paper-2 text-paper-text"
                  }`}
                >
                  {used ? t("letIn") : tt("paid")}
                </p>

                <div>
                  <h2 className="text-3xl font-bold tracking-tight">{ticket.guestName}</h2>
                  <p className="mt-2 text-lg font-semibold leading-snug">
                    {t("people", { count: ticket.guests })}
                    <span className="text-paper-muted"> · </span>
                    {formatDate(when, locale)}
                    <span className="text-paper-muted"> · </span>
                    {formatTime(when, locale)}
                  </p>
                  <p className="mt-2 text-base font-semibold text-paper-muted">{kindLabel}</p>
                  <p className="mt-1 text-sm text-paper-muted">{ticket.guestEmail}</p>
                </div>

                {used ? <p className="text-2xl font-bold">{t("letIn")}</p> : null}
              </div>
            ) : null}

            <button type="button" onClick={closePopup} className="btn btn-ghost btn-full mt-6">
              {t("close")}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
