"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { MAX_GUESTS, MEAL_TYPES, ONLINE_PAYMENTS_ENABLED, type MealType } from "@/lib/constants";
import { sendReservationDecisionEmail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/staff";
import { combineDateTime, createQrToken, liveGuestCount, parseQrPayload } from "@/lib/utils";

function paymentFromForm(formData: FormData) {
  const paymentMethod = String(formData.get("paymentMethod") ?? "ONSITE");
  if (paymentMethod === "ONLINE" && !ONLINE_PAYMENTS_ENABLED) return null;
  if (paymentMethod !== "ONSITE") return null;
  return "ONSITE" as const;
}

function guestsFromForm(formData: FormData, max = MAX_GUESTS) {
  const guests = Number(formData.get("guests"));
  if (!Number.isInteger(guests) || guests < 1 || guests > max) return null;
  return guests;
}

async function createTickets(reservationId: string, guests: number, firstToken?: string) {
  await prisma.ticket.createMany({
    data: Array.from({ length: guests }, (_, index) => ({
      reservationId,
      seat: index + 1,
      qrToken: index === 0 && firstToken ? firstToken : createQrToken(),
    })),
  });
}

async function findOrCreateGuest(name: string, email: string) {
  const normalized = email.toLowerCase().trim();
  const guestName = name.trim();
  if (!guestName || !normalized.includes("@")) return null;
  const existing = await prisma.user.findUnique({ where: { email: normalized } });
  if (existing) return existing;
  return prisma.user.create({
    data: {
      name: guestName,
      email: normalized,
      passwordHash: await bcrypt.hash(crypto.randomUUID(), 8),
    },
  });
}

export async function createReservation(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "auth" as const };
  }

  const eventId = String(formData.get("eventId") ?? "");
  const guests = guestsFromForm(formData);
  const paymentMethod = paymentFromForm(formData);

  if (!eventId || !guests) {
    return { error: "invalidGuests" as const };
  }
  if (!paymentMethod) {
    return { error: "required" as const };
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      venue: true,
      reservations: true,
    },
  });
  if (!event) return { error: "required" as const };
  if (event.venue.verificationStatus !== "VERIFIED") return { error: "unverified" as const };
  if (event.startsAt.getTime() < Date.now()) return { error: "past" as const };

  const reserved = liveGuestCount(event.reservations);
  if (reserved + guests > event.capacity) {
    return { error: "full" as const };
  }

  const reservation = await prisma.reservation.create({
    data: {
      kind: "EVENT",
      venueId: event.venueId,
      eventId,
      userId: session.user.id,
      guests,
      visitAt: event.startsAt,
      paymentMethod: "ONSITE",
      paymentStatus: "UNPAID",
      status: "PENDING",
    },
  });

  revalidatePath(`/v/${event.venue.slug}`);
  revalidatePath(`/tickets`);
  revalidatePath("/dashboard", "layout");
  return { ok: true as const, id: reservation.id };
}

export async function createTableReservation(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "auth" as const };
  }

  const venueId = String(formData.get("venueId") ?? "");
  const mealType = String(formData.get("mealType") ?? "") as MealType;
  const dateValue = String(formData.get("date") ?? "");
  const timeValue = String(formData.get("time") ?? "");
  const guests = guestsFromForm(formData);

  if (!venueId || !guests) {
    return { error: "required" as const };
  }
  if (!MEAL_TYPES.includes(mealType)) {
    return { error: "required" as const };
  }

  const visitAt = combineDateTime(dateValue, timeValue);
  if (!visitAt) return { error: "required" as const };

  const venue = await prisma.venue.findUnique({ where: { id: venueId } });
  if (!venue) return { error: "required" as const };
  if (venue.verificationStatus !== "VERIFIED") return { error: "unverified" as const };

  const reservation = await prisma.reservation.create({
    data: {
      kind: "TABLE",
      venueId,
      userId: session.user.id,
      guests,
      mealType,
      visitAt,
      paymentMethod: "ONSITE",
      paymentStatus: "UNPAID",
      status: "PENDING",
    },
  });

  revalidatePath(`/v/${venue.slug}`);
  revalidatePath(`/tickets`);
  revalidatePath("/dashboard", "layout");
  return { ok: true as const, id: reservation.id };
}

export async function staffCreateBooking(formData: FormData) {
  const context = await requireStaff();
  if (!context) return { error: "noAccess" as const };

  const kind = String(formData.get("kind") ?? "");
  const guest = await findOrCreateGuest(
    String(formData.get("guestName") ?? ""),
    String(formData.get("guestEmail") ?? ""),
  );
  if (!guest) return { error: "required" as const };

  if (kind === "TABLE") {
    const mealType = String(formData.get("mealType") ?? "") as MealType;
    const guests = guestsFromForm(formData);
    const visitAt = combineDateTime(String(formData.get("date") ?? ""), String(formData.get("time") ?? ""));
    if (!guests || !visitAt || !MEAL_TYPES.includes(mealType)) {
      return { error: "required" as const };
    }
    const created = await prisma.reservation.create({
      data: {
        kind: "TABLE",
        venueId: context.venue.id,
        userId: guest.id,
        guests,
        mealType,
        visitAt,
        paymentMethod: "ONSITE",
        paymentStatus: "UNPAID",
        status: "CONFIRMED",
      },
      include: { user: true, venue: true, event: true },
    });
    await sendReservationDecisionEmail(created, "CONFIRMED");
    revalidatePath("/dashboard/reservations");
    redirect("/dashboard/reservations");
  }

  if (kind === "EVENT") {
    const eventId = String(formData.get("eventId") ?? "");
    const guests = guestsFromForm(formData);
    if (!eventId || !guests) return { error: "required" as const };

    const event = await prisma.event.findFirst({
      where: { id: eventId, venueId: context.venue.id },
      include: { reservations: true },
    });
    if (!event) return { error: "required" as const };
    if (event.startsAt.getTime() < Date.now()) return { error: "past" as const };
    const reserved = liveGuestCount(event.reservations);
    if (reserved + guests > event.capacity) return { error: "full" as const };

    const reservation = await prisma.reservation.create({
      data: {
        kind: "EVENT",
        venueId: context.venue.id,
        eventId,
        userId: guest.id,
        guests,
        visitAt: event.startsAt,
        paymentMethod: "ONSITE",
        paymentStatus: "UNPAID",
        status: "CONFIRMED",
      },
      include: { user: true, venue: true, event: true },
    });
    await createTickets(reservation.id, guests);
    await sendReservationDecisionEmail(reservation, "CONFIRMED");
    revalidatePath("/dashboard/tickets");
    redirect("/dashboard/tickets");
  }

  return { error: "required" as const };
}

const decisionInclude = { user: true, venue: true, event: true } as const;

export async function confirmReservation(reservationId: string) {
  const context = await requireStaff();
  if (!context) return { error: "noAccess" as const };

  const reservation = await prisma.reservation.findFirst({
    where: { id: reservationId, venueId: context.venue.id, status: "PENDING" },
    include: { tickets: true, ...decisionInclude },
  });
  if (!reservation) return { error: "notFound" as const };

  await prisma.reservation.update({
    where: { id: reservation.id },
    data: { status: "CONFIRMED" },
  });
  if (reservation.kind === "EVENT" && reservation.tickets.length === 0) {
    await createTickets(reservation.id, reservation.guests);
  }
  await sendReservationDecisionEmail(reservation, "CONFIRMED");
  revalidatePath("/dashboard/reservations");
  revalidatePath("/dashboard/tickets");
  revalidatePath("/dashboard", "layout");
  revalidatePath("/dashboard");
  revalidatePath("/tickets");
  return { ok: true as const };
}

export async function cancelReservation(reservationId: string) {
  const context = await requireStaff();
  if (!context) return { error: "noAccess" as const };

  const reservation = await prisma.reservation.findFirst({
    where: { id: reservationId, venueId: context.venue.id, status: { not: "CANCELLED" } },
    include: decisionInclude,
  });
  if (!reservation) return { error: "notFound" as const };

  await prisma.reservation.update({
    where: { id: reservation.id },
    data: { status: "CANCELLED" },
  });
  await sendReservationDecisionEmail(reservation, "CANCELLED");
  revalidatePath("/dashboard/reservations");
  revalidatePath("/dashboard/tickets");
  revalidatePath("/dashboard", "layout");
  revalidatePath("/dashboard");
  revalidatePath("/tickets");
  revalidatePath(`/v/${reservation.venue.slug}`);
  return { ok: true as const };
}

export type ScannedTicket = {
  id: string;
  ticketId: string;
  seat: number;
  guests: number;
  paymentMethod: string;
  paymentStatus: string;
  checkedInCount: number;
  checkedInAt: string | null;
  qrToken: string;
  guestName: string;
  guestEmail: string;
  eventTitle: string;
  startsAt: string;
  venueName: string;
  kind: string;
  mealType: string | null;
  allIn: boolean;
};

function toScanned(
  reservation: {
    id: string;
    guests: number;
    paymentMethod: string;
    paymentStatus: string;
    mealType: string | null;
    kind: string;
    visitAt: Date;
    user: { name: string; email: string };
    venue: { name: string };
    event: { title: string; startsAt: Date } | null;
    tickets: { id: string; seat: number; qrToken: string; checkedInAt: Date | null }[];
  },
  ticket: { id: string; seat: number; qrToken: string; checkedInAt: Date | null },
): ScannedTicket {
  const inCount = reservation.tickets.filter((item) => item.checkedInAt).length;
  return {
    id: reservation.id,
    ticketId: ticket.id,
    seat: ticket.seat,
    guests: reservation.guests,
    paymentMethod: reservation.paymentMethod,
    paymentStatus: reservation.paymentStatus,
    checkedInCount: inCount,
    checkedInAt: ticket.checkedInAt?.toISOString() ?? null,
    allIn: Boolean(ticket.checkedInAt),
    qrToken: ticket.qrToken,
    guestName: reservation.user.name,
    guestEmail: reservation.user.email,
    eventTitle: reservation.event?.title ?? reservation.venue.name,
    startsAt: (reservation.event?.startsAt ?? reservation.visitAt).toISOString(),
    venueName: reservation.venue.name,
    kind: reservation.kind,
    mealType: reservation.mealType,
  };
}

const ticketInclude = {
  reservation: {
    include: {
      user: true,
      venue: true,
      event: true,
      tickets: true,
    },
  },
} as const;

export async function lookupTicket(rawCode: string) {
  const context = await requireStaff();
  if (!context) return { error: "noAccess" as const };

  const token = parseQrPayload(rawCode);
  if (!token) return { error: "notFound" as const };

  const ticket = await prisma.ticket.findUnique({
    where: { qrToken: token },
    include: ticketInclude,
  });

  if (!ticket || ticket.reservation.venueId !== context.venue.id) {
    return { error: ticket ? "wrongVenue" : "notFound" };
  }
  if (ticket.reservation.status === "CANCELLED") return { error: "cancelled" as const };
  if (ticket.reservation.status !== "CONFIRMED") return { error: "pending" as const };

  return {
    ok: true as const,
    reservation: toScanned(ticket.reservation, ticket),
  };
}

export async function checkInReservation(reservationId: string) {
  return checkInTicket(reservationId);
}

export async function checkInTicket(ticketId: string) {
  try {
    const context = await requireStaff();
    if (!context) return { error: "noAccess" as const };

    const ticket = await prisma.ticket.findFirst({
      where: { id: ticketId, reservation: { venueId: context.venue.id } },
      include: ticketInclude,
    });
    if (!ticket) return { error: "notFound" as const };
    if (ticket.reservation.status !== "CONFIRMED") return { error: "pending" as const };

    if (ticket.checkedInAt) {
      return { ok: true as const, warning: "allIn" as const, reservation: toScanned(ticket.reservation, ticket) };
    }

    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { checkedInAt: new Date() },
    });

    const inCount = ticket.reservation.tickets.filter((item) => item.checkedInAt || item.id === ticket.id).length;
    await prisma.reservation.update({
      where: { id: ticket.reservationId },
      data: {
        checkedInCount: inCount,
        checkedInAt: new Date(),
      },
    });

    revalidatePath("/dashboard/reservations");
    revalidatePath("/dashboard/tickets");
    return lookupTicket(ticket.qrToken);
  } catch (error) {
    console.error(error);
    return { error: "notFound" as const };
  }
}

export async function markReservationPaid(reservationId: string, ticketId?: string) {
  const context = await requireStaff();
  if (!context) return { error: "noAccess" as const };

  const reservation = await prisma.reservation.findFirst({
    where: { id: reservationId, venueId: context.venue.id },
  });
  if (!reservation) return { error: "notFound" as const };

  await prisma.reservation.update({
    where: { id: reservationId },
    data: { paymentStatus: "PAID" },
  });

  revalidatePath("/dashboard/reservations");
  revalidatePath("/dashboard/tickets");

  const ticket = await prisma.ticket.findFirst({
    where: ticketId ? { id: ticketId, reservationId } : { reservationId },
    orderBy: { seat: "asc" },
  });
  if (ticket) return lookupTicket(ticket.qrToken);
  return { ok: true as const };
}

export async function markTableArrived(reservationId: string) {
  const context = await requireStaff();
  if (!context) return { error: "noAccess" as const };

  const reservation = await prisma.reservation.findFirst({
    where: { id: reservationId, venueId: context.venue.id, kind: "TABLE" },
  });
  if (!reservation) return { error: "notFound" as const };

  await prisma.reservation.update({
    where: { id: reservationId },
    data: {
      checkedInCount: reservation.guests,
      checkedInAt: new Date(),
    },
  });

  revalidatePath("/dashboard/reservations");
  return { ok: true as const };
}
