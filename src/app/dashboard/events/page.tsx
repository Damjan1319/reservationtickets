import Link from "next/link";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { deleteEvent } from "@/app/actions/event";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/staff";
import { formatDateTime } from "@/lib/utils";

export default async function DashboardEventsPage() {
  const context = await requireOwner();
  if (!context) redirect("/dashboard");
  const t = await getTranslations("dashboard");
  const te = await getTranslations("event");
  const tc = await getTranslations("common");
  const locale = await getLocale();
  const events = await prisma.event.findMany({
    where: { venueId: context.venue.id },
    include: { reservations: { select: { guests: true } } },
    orderBy: { startsAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">{t("parties")}</h1>
        <Link href="/dashboard/events/new" className="btn btn-primary !px-4 !py-2">
          {te("newTitle")}
        </Link>
      </div>
      {events.length === 0 ? (
        <p className="mt-8 text-muted">{t("emptyEvents")}</p>
      ) : (
        <div className="mt-8 space-y-3">
          {events.map((event) => {
            const reserved = event.reservations.reduce((sum, item) => sum + item.guests, 0);
            return (
              <div key={event.id} className="flex flex-col gap-3 rounded-2xl border border-paper-line bg-paper p-5 text-paper-text sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div>
                  <p className="text-xl font-semibold tracking-tight">{event.title}</p>
                  <p className="text-sm text-paper-muted">{formatDateTime(event.startsAt, locale)}</p>
                  <p className="mt-1 text-xs text-paper-muted">
                    {reserved}/{event.capacity}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/events/${event.id}/edit`}
                    className="btn btn-ghost !px-4 !py-2"
                  >
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
