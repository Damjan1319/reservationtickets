import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { reservationQrDataUrl } from "@/lib/qr";
import { getStaffContext } from "@/lib/staff";
import { formatDateLong, formatTime } from "@/lib/utils";
import { DownloadOne, DownloadTickets } from "@/components/download-tickets";
import { PageBack } from "@/components/page-back";

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const t = await getTranslations("ticket");
  const tb = await getTranslations("booking");
  const locale = await getLocale();
  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: { event: true, venue: true, user: true, tickets: { orderBy: { seat: "asc" } } },
  });

  if (!reservation) notFound();

  const staff = session?.user?.id ? await getStaffContext() : null;
  const canView =
    session?.user?.id === reservation.userId || staff?.venue.id === reservation.venueId;
  if (!canView) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <p className="text-muted">{t("notYours")}</p>
      </div>
    );
  }

  const title =
    reservation.kind === "TABLE" && reservation.mealType
      ? `${t("table")} · ${tb(`meals.${reservation.mealType}`)}`
      : (reservation.event?.title ?? reservation.venue.name);
  const when = reservation.event?.startsAt ?? reservation.visitAt;
  const isTable = reservation.kind === "TABLE";
  const isOwn = session?.user?.id === reservation.userId;
  const inside =
    isTable
      ? reservation.checkedInCount >= reservation.guests
      : reservation.tickets.some((ticket) => ticket.checkedInAt);
  const statusLabel =
    reservation.status === "PENDING"
      ? t("statusPending")
      : reservation.status === "CANCELLED"
        ? t("statusCancelled")
        : inside
          ? t("statusInside")
          : t("statusConfirmed");
  const booked = t(isOwn ? "youBooked" : "theyBooked", {
    name: reservation.user.name,
    date: formatDateLong(when, locale),
    time: formatTime(when, locale),
    count: reservation.guests,
    venue: reservation.venue.name,
  });
  const codes = await Promise.all(
    reservation.tickets.map(async (ticket) => ({
      ...ticket,
      dataUrl: await reservationQrDataUrl(ticket.qrToken),
      fileName: `ulaznica-${ticket.seat}.png`,
    })),
  );

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <PageBack href="/tickets" label={t("myTickets")} />
      <article className="overflow-hidden rounded-xl border border-line bg-bg">
        <div className="px-6 py-6">
          <p
            className={
              "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold " +
              (reservation.status === "CANCELLED"
                ? "bg-danger/10 text-danger"
                : reservation.status === "PENDING"
                  ? "bg-surface-2 text-muted"
                  : "bg-success/10 text-success")
            }
          >
            {statusLabel}
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-cream">{title}</h1>
          <p className="mt-1 text-sm text-muted">{reservation.venue.name}</p>
        </div>

        {reservation.status === "PENDING" ? (
          <div className="space-y-4 border-t border-line px-6 py-8">
            <p className="text-lg font-semibold leading-snug text-cream">{booked}</p>
            <p className="text-sm leading-relaxed text-cream">
              {isTable ? t("waitingConfirmTable") : t("waitingConfirm")}
            </p>
          </div>
        ) : reservation.status === "CANCELLED" ? (
          <div className="space-y-4 border-t border-line px-6 py-8">
            <p className="text-lg font-semibold leading-snug text-cream">{booked}</p>
            <p className="text-sm text-cream">{t("cancelled")}</p>
          </div>
        ) : isTable ? (
          <div className="space-y-4 border-t border-line px-6 py-8">
            <p className="text-3xl font-semibold tracking-tight text-cream">{reservation.user.name}</p>
            <p className="text-lg font-semibold leading-snug text-cream">{booked}</p>
            <p className="text-base font-semibold text-cream">{t("onListSayName")}</p>
            <p className="text-sm leading-relaxed text-cream">{t("tableNoQr")}</p>
          </div>
        ) : (
          <div className="space-y-8 border-t border-line px-6 py-8">
            <p className="text-lg font-semibold leading-snug text-cream">{booked}</p>
            <p className="text-sm text-cream">{t("showAtDoor")}</p>
            <DownloadTickets items={codes} />
            {codes.map((ticket) => (
              <div key={ticket.id} className="flex flex-col items-center border-t border-line pt-6 first:border-0 first:pt-0">
                <p className="mb-3 text-sm text-muted">
                  {t("person", { seat: ticket.seat, total: reservation.guests })}
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ticket.dataUrl} alt="" className="h-56 w-56 rounded-xl border border-line bg-paper p-2" />
                <div className="mt-3">
                  <DownloadOne dataUrl={ticket.dataUrl} fileName={ticket.fileName} label={t("downloadOne")} />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isTable ? (
          <dl className="border-t border-dashed border-line text-sm">
            <div className="px-6 py-4">
              <dt className="text-muted">{reservation.paymentMethod === "ONLINE" ? t("online") : t("onsite")}</dt>
              <dd className="mt-1 text-lg font-semibold text-cream">
                {reservation.paymentStatus === "PAID" ? t("paid") : t("unpaid")}
              </dd>
            </div>
          </dl>
        ) : null}
      </article>
    </div>
  );
}
