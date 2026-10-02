import Link from "next/link";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";

export default async function TicketsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/tickets");

  const t = await getTranslations("ticket");
  const tb = await getTranslations("booking");
  const locale = await getLocale();
  const tickets = await prisma.reservation.findMany({
    where: { userId: session.user.id },
    include: { event: true, venue: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-2xl font-semibold tracking-tight">{t("myTickets")}</h1>
      {tickets.length === 0 ? (
        <p className="mt-8 text-muted">{t("empty")}</p>
      ) : (
        <div className="mt-8 space-y-4">
          {tickets.map((ticket) => {
            const title =
              ticket.kind === "TABLE" && ticket.mealType
                ? `${t("table")} · ${tb(`meals.${ticket.mealType}`)}`
                : (ticket.event?.title ?? ticket.venue.name);
            const when = ticket.event?.startsAt ?? ticket.visitAt;
            return (
              <Link
                key={ticket.id}
                href={`/tickets/${ticket.id}`}
                className="block rounded-2xl border border-paper-line bg-paper p-5 text-paper-text hover:border-paper-text/25"
              >
                <p className="text-xs font-medium text-paper-muted">{ticket.venue.name}</p>
                <h2 className="mt-1 text-lg font-semibold">{title}</h2>
                <p className="mt-2 text-sm text-paper-muted">{formatDateTime(when, locale)}</p>
                <p className={`mt-3 text-sm ${ticket.kind === "TABLE" ? "text-paper-muted" : ticket.paymentStatus === "PAID" ? "text-success" : "text-danger"}`}>
                  {ticket.kind === "TABLE"
                    ? `${t("table")} · ${ticket.guests} ${t("guests").toLowerCase()}`
                    : `${ticket.paymentStatus === "PAID" ? t("paid") : t("unpaid")} · ${ticket.guests} ${t("guests").toLowerCase()}`}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
