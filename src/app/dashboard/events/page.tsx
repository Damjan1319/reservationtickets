import Link from "next/link";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { deleteEvent } from "@/app/actions/event";
import { PageHeader } from "@/components/page-header";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/staff";
import { formatDateTime, liveGuestCount } from "@/lib/utils";

export default async function DashboardEventsPage() {
  const context = await requireOwner();
  if (!context) redirect("/dashboard");
  const t = await getTranslations("dashboard");
  const te = await getTranslations("event");
  const tc = await getTranslations("common");
  const locale = await getLocale();
  const events = await prisma.event.findMany({
    where: { venueId: context.venue.id, startsAt: { gte: new Date() } },
    include: { reservations: true },
    orderBy: { startsAt: "asc" },
  });

  return (
    <div>
      <PageHeader
        title={t("parties")}
        action={
          <Link href="/dashboard/events/new" className="btn btn-primary !px-4 !py-2">
            {te("newTitle")}
          </Link>
        }
      />
      {events.length === 0 ? (
        <p className="mt-8 text-cream/70">{t("emptyEvents")}</p>
      ) : (
        <div className="mt-6 space-y-3">
          {events.map((event) => {
            const reserved = liveGuestCount(event.reservations);
            return (
              <div
                key={event.id}
                className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-xl font-bold tracking-tight text-cream">{event.title}</p>
                  <p className="mt-1 text-sm font-medium text-cream/80">
                    {te("act")} · {event.artist.trim() || context.venue.name}
                  </p>
                  <p className="mt-1 text-sm text-cream/65">{formatDateTime(event.startsAt, locale)}</p>
                  <p className="mt-1 text-sm text-cream/55">
                    {reserved}/{event.capacity}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/dashboard/events/${event.id}/edit`} className="btn btn-ghost !px-4 !py-2">
                    {te("editTitle")}
                  </Link>
                  <form
                    action={async () => {
                      "use server";
                      await deleteEvent(event.id);
                    }}
                  >
                    <button type="submit" className="btn btn-ghost !px-4 !py-2 text-danger">
                      {tc("delete")}
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
