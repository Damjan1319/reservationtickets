import { prisma } from "@/lib/prisma";
import { dayKeyInTz, todayKey } from "@/lib/time";
import { liveGuestCount } from "@/lib/utils";

export type DoorItem = {
  id: string;
  kind: string;
  status: string;
  guests: number;
  visitAt: string;
  mealType: string | null;
  eventTitle: string | null;
  guestName: string;
  guestEmail: string;
  paymentStatus: string;
  inside: number;
  checkedIn: boolean;
};

export async function releaseNoShows(venueId: string, minutes: number) {
  if (minutes < 5) return 0;
  const cutoff = new Date(Date.now() - minutes * 60_000);
  const stale = await prisma.reservation.findMany({
    where: {
      venueId,
      kind: "TABLE",
      status: "CONFIRMED",
      checkedInAt: null,
      visitAt: { lt: cutoff },
    },
    select: { id: true },
  });
  if (stale.length === 0) return 0;
  await prisma.reservation.updateMany({
    where: { id: { in: stale.map((item) => item.id) } },
    data: { status: "CANCELLED" },
  });
  return stale.length;
}

export async function loadDoorList(venueId: string): Promise<DoorItem[]> {
  const day = todayKey();
  const rows = await prisma.reservation.findMany({
    where: {
      venueId,
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    include: {
      user: { select: { name: true, email: true } },
      event: { select: { title: true } },
      tickets: { select: { checkedInAt: true } },
    },
    orderBy: { visitAt: "asc" },
  });

  return rows
    .filter((item) => dayKeyInTz(item.visitAt) === day)
    .map((item) => {
      const inside =
        item.kind === "EVENT"
          ? item.tickets.filter((ticket) => ticket.checkedInAt).length
          : item.checkedInCount;
      return {
        id: item.id,
        kind: item.kind,
        status: item.status,
        guests: item.guests,
        visitAt: item.visitAt.toISOString(),
        mealType: item.mealType,
        eventTitle: item.event?.title ?? null,
        guestName: item.user.name,
        guestEmail: item.user.email,
        paymentStatus: item.paymentStatus,
        inside,
        checkedIn: item.kind === "TABLE" ? item.checkedInCount >= item.guests : inside >= item.guests,
      };
    });
}

export async function tableGuestsForSlot(venueId: string, day: string, mealType: string) {
  const rows = await prisma.reservation.findMany({
    where: { venueId, kind: "TABLE", mealType, status: { not: "CANCELLED" } },
    select: { guests: true, visitAt: true, status: true },
  });
  return liveGuestCount(rows.filter((item) => dayKeyInTz(item.visitAt) === day));
}
