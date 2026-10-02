import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/page-header";
import { StaffBookingForm } from "@/components/staff-booking-form";
import { prisma } from "@/lib/prisma";
import { getStaffContext } from "@/lib/staff";

export default async function CreateBookingPage() {
  const context = await getStaffContext();
  if (!context) return null;
  const t = await getTranslations("dashboard");
  const events = await prisma.event.findMany({
    where: { venueId: context.venue.id, startsAt: { gte: new Date() } },
    orderBy: { startsAt: "asc" },
    select: { id: true, title: true },
  });

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={context.venue.name} title={t("newBooking")} description={t("newBookingHint")} />
      <div className="max-w-lg overflow-hidden rounded-2xl border border-paper-line bg-paper p-5 text-paper-text sm:p-6">
        <StaffBookingForm events={events} />
      </div>
    </div>
  );
}
