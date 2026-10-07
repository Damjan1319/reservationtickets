import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { EventForm } from "@/components/event-form";
import { PageHeader } from "@/components/page-header";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/staff";
import { toLocalInputValue } from "@/lib/utils";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const context = await requireOwner();
  if (!context) redirect("/dashboard");
  const { id } = await params;
  const event = await prisma.event.findFirst({
    where: { id, venueId: context.venue.id },
  });
  if (!event) notFound();
  const t = await getTranslations("event");

  return (
    <div>
      <PageHeader title={t("editTitle")} />
      <div className="mt-6 max-w-xl rounded-2xl border border-paper-line bg-paper p-5 text-paper-text sm:p-6">
        <EventForm
          event={{
            id: event.id,
            title: event.title,
            artist: event.artist,
            description: event.description,
            startsAt: toLocalInputValue(event.startsAt),
            capacity: event.capacity,
            price: event.price,
          }}
        />
      </div>
    </div>
  );
}
