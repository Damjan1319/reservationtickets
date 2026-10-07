import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { GuestReservations } from "@/components/guest-reservations";
import { PageBack } from "@/components/page-back";
import { prisma } from "@/lib/prisma";

export default async function TicketsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/tickets");

  const t = await getTranslations("ticket");
  const tn = await getTranslations("nav");
  const tickets = await prisma.reservation.findMany({
    where: { userId: session.user.id },
    include: { event: true, venue: true },
    orderBy: { visitAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <PageBack href="/" label={tn("venues")} />
      <h1 className="text-3xl font-semibold tracking-tight">{t("myTickets")}</h1>
      <p className="mt-2 text-sm text-muted">{t("myHint")}</p>
      <GuestReservations
        items={tickets.map((item) => ({
          id: item.id,
          kind: item.kind,
          status: item.status,
          guests: item.guests,
          paymentStatus: item.paymentStatus,
          mealType: item.mealType,
          visitAt: item.visitAt.toISOString(),
          venueName: item.venue.name,
          eventTitle: item.event?.title ?? null,
        }))}
      />
    </div>
  );
}
