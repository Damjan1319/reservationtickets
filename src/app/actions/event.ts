"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/staff";

function readEventFields(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const artist = String(formData.get("artist") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const startsAtRaw = String(formData.get("startsAt") ?? "");
  const capacity = Number(formData.get("capacity"));
  const price = Number(formData.get("price"));
  const startsAt = startsAtRaw ? new Date(startsAtRaw) : null;

  return { title, artist, description, startsAt, capacity, price };
}

export async function createEvent(formData: FormData) {
  const context = await requireOwner();
  if (!context) return { error: "ownerOnly" as const };

  const fields = readEventFields(formData);
  if (!fields.title || !fields.description || !fields.startsAt || Number.isNaN(fields.startsAt.getTime())) {
    return { error: "required" as const };
  }
  if (!fields.capacity || fields.capacity < 1 || fields.price < 0) {
    return { error: "required" as const };
  }

  await prisma.event.create({
    data: {
      venueId: context.venue.id,
      title: fields.title,
      artist: fields.artist,
      description: fields.description,
      startsAt: fields.startsAt,
      capacity: Math.floor(fields.capacity),
      price: Math.floor(fields.price),
    },
  });

  revalidatePath("/dashboard/events");
  revalidatePath(`/v/${context.venue.slug}`);
  redirect("/dashboard/events");
}

export async function updateEvent(eventId: string, formData: FormData) {
  const context = await requireOwner();
  if (!context) return { error: "ownerOnly" as const };

  const existing = await prisma.event.findFirst({
    where: { id: eventId, venueId: context.venue.id },
  });
  if (!existing) return { error: "required" as const };

  const fields = readEventFields(formData);
  if (!fields.title || !fields.description || !fields.startsAt || Number.isNaN(fields.startsAt.getTime())) {
    return { error: "required" as const };
  }
  if (!fields.capacity || fields.capacity < 1 || fields.price < 0) {
    return { error: "required" as const };
  }

  await prisma.event.update({
    where: { id: eventId },
    data: {
      title: fields.title,
      artist: fields.artist,
      description: fields.description,
      startsAt: fields.startsAt,
      capacity: Math.floor(fields.capacity),
      price: Math.floor(fields.price),
    },
  });

  revalidatePath("/dashboard/events");
  revalidatePath(`/v/${context.venue.slug}`);
  revalidatePath(`/v/${context.venue.slug}/events/${eventId}`);
  redirect("/dashboard/events");
}

export async function deleteEvent(eventId: string) {
  const context = await requireOwner();
  if (!context) return { error: "ownerOnly" as const };

  await prisma.event.deleteMany({
    where: { id: eventId, venueId: context.venue.id },
  });

  revalidatePath("/dashboard/events");
  revalidatePath(`/v/${context.venue.slug}`);
  redirect("/dashboard/events");
}
