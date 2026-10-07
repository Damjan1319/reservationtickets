import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { reservationQrDataUrl } from "@/lib/qr";
import { getStaffContext } from "@/lib/staff";
import { formatDateLong, formatTime, venueCover } from "@/lib/utils";
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
      <article className="overflow-hidden rounded-3xl border border-line bg-surface">
        <div className="relative overflow-hidden px-6 py-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={venueCover(reservation.venue.type, reservation.venue.coverUrl)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-bg/70 to-bg/30" />
          <div className="relative">
            <p className="text-xs font-medium text-cream/80">{reservation.venue.name}</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-cream">{title}</h1>
            <p className="mt-3 inline-flex rounded-full bg-cream/15 px-3 py-1 text-xs font-semibold text-cream">
              {statusLabel}
            </p>
          </div>
        </div>

        {reservation.status === "PENDING" ? (
          <div className="space-y-4 px-6 py-8">
            <p className="text-lg font-semibold leading-snug text-cream">{booked}</p>
            <p className="text-sm leading-relaxed text-cream/75">
              {isTable ? t("waitingConfirmTable") : t("waitingConfirm")}
            </p>
          </div>
        ) : reservation.status === "CANCELLED" ? (
          <div className="space-y-4 px-6 py-8">
            <p className="text-lg font-semibold leading-snug text-cream">{booked}</p>
            <p className="text-sm text-cream/75">{t("cancelled")}</p>
          </div>
        ) : isTable ? (
          <div className="space-y-4 px-6 py-8">
            <p className="text-3xl font-bold tracking-tight text-cream">{reservation.user.name}</p>
            <p className="text-lg font-semibold leading-snug text-cream">{booked}</p>
            <p className="text-base font-semibold text-cream">{t("onListSayName")}</p>
            <p className="text-sm leading-relaxed text-cream/75">{t("tableNoQr")}</p>
          </div>
        ) : (
          <div className="space-y-8 px-6 py-8">
            <p className="text-lg font-semibold leading-snug text-cream">{booked}</p>
            <p className="text-sm text-cream/75">{t("showAtDoor")}</p>
            <DownloadTickets items={codes} />
            {codes.map((ticket) => (
              <div key={ticket.id} className="flex flex-col items-center border-t border-line pt-6 first:border-0 first:pt-0">
                <p className="mb-3 text-sm text-muted">
                  {t("person", { seat: ticket.seat, total: reservation.guests })}
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ticket.dataUrl} alt="" className="h-56 w-56 rounded-2xl border border-line" />
                <div className="mt-3">
                  <DownloadOne dataUrl={ticket.dataUrl} fileName={ticket.fileName} label={t("downloadOne")} />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isTable ? (
          <dl className="border-t border-line text-sm">
            <div className="bg-surface px-6 py-4">
              <dt className="text-cream/70">{reservation.paymentMethod === "ONLINE" ? t("online") : t("onsite")}</dt>
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
