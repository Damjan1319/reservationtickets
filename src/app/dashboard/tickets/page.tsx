import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { CopyEmails } from "@/components/copy-emails";
import { PageHeader } from "@/components/page-header";
import { prisma } from "@/lib/prisma";
import { getStaffContext } from "@/lib/staff";

export default async function TicketEvidencePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const context = await getStaffContext();
  if (!context) return null;
  const t = await getTranslations("dashboard");
  const tt = await getTranslations("ticket");
  const { q } = await searchParams;
  const query = (q ?? "").trim().toLowerCase();

  const items = await prisma.reservation.findMany({
    where: { venueId: context.venue.id, kind: "EVENT" },
    include: { event: true, user: true, tickets: true },
    orderBy: { visitAt: "desc" },
  });

  const filtered = query
    ? items.filter(
        (item) =>
          item.user.email.toLowerCase().includes(query) ||
          item.user.name.toLowerCase().includes(query) ||
          (item.event?.title ?? "").toLowerCase().includes(query),
      )
    : items;

  const emails = [...new Set(filtered.map((item) => item.user.email))];

  return (
    <div>
      <PageHeader
        eyebrow={context.venue.name}
        title={t("tickets")}
        description={t("ticketsHint")}
        action={
          <Link href="/dashboard/create" className="btn btn-primary !px-4 !py-2">
            {t("newTicket")}
          </Link>
        }
      />

      <form className="mt-6 flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder={t("searchGuests")}
          className="min-w-0 flex-1 rounded-xl border border-line bg-surface-2 px-4 py-3 outline-none focus:border-gold"
        />
        <button type="submit" className="btn btn-ghost !px-4">
          {t("searchGuests")}
        </button>
      </form>

      <section className="mt-6 rounded-2xl border border-paper-line bg-paper p-5 text-paper-text">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">{t("emailsTitle")}</h2>
          <CopyEmails emails={emails} />
        </div>
        {emails.length === 0 ? (
          <p className="mt-3 text-sm text-paper-muted">{t("emptyReservations")}</p>
        ) : (
          <ul className="mt-3 space-y-1 text-sm">
            {emails.map((email) => (
              <li key={email} className="text-paper-muted">
                {email}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-6 space-y-3">
        {filtered.length === 0 ? (
          <p className="text-muted">{t("emptyReservations")}</p>
        ) : (
          filtered.map((item) => {
            const inside = item.tickets.filter((ticket) => ticket.checkedInAt).length;
            return (
              <article key={item.id} className="rounded-2xl border border-paper-line border-l-[3px] border-l-cal-event bg-paper p-4 text-paper-text">
                <p className="text-base font-semibold">{item.event?.title ?? t("tickets")}</p>
                <p className="mt-1 text-sm">
                  {item.user.name}
                  <span className="mt-0.5 block text-paper-muted">{item.user.email}</span>
                </p>
                <p className="mt-3 text-sm text-paper-muted">
                  {tt("guests")}: {item.guests} · QR: {item.tickets.length} · {t("inside")}: {inside}/{item.guests}
                </p>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
