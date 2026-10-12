"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { rateLimit } from "@/lib/rate-limit";
import { hasRequiredScores, scoresForAspects } from "@/lib/reviews";
import { prisma } from "@/lib/prisma";

export async function saveReview(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "auth" as const };
  if (!rateLimit(`review:${session.user.id}`, 8, 60 * 60 * 1000)) return { error: "rate" as const };

  const venueId = String(formData.get("venueId") ?? "");
  const body = String(formData.get("body") ?? "").trim().slice(0, 500);
  const venue = await prisma.venue.findUnique({
    where: { id: venueId },
    select: { id: true, slug: true, type: true, ownerId: true, verificationStatus: true },
  });
  if (!venue || venue.verificationStatus !== "VERIFIED") return { error: "required" as const };
  if (venue.ownerId === session.user.id) return { error: "own" as const };

  const staff = await prisma.staffMembership.findFirst({
    where: { venueId: venue.id, userId: session.user.id },
    select: { id: true },
  });
  if (staff) return { error: "own" as const };

  const scores = scoresForAspects(venue.type, formData);
  if (!hasRequiredScores(venue.type, scores)) return { error: "scores" as const };

  await prisma.review.upsert({
    where: { venueId_userId: { venueId: venue.id, userId: session.user.id } },
    create: {
      venueId: venue.id,
      userId: session.user.id,
      body,
      food: scores.food,
      drinks: scores.drinks,
      night: scores.night,
    },
    update: {
      body,
      food: scores.food,
      drinks: scores.drinks,
      night: scores.night,
    },
  });

  revalidatePath(`/v/${venue.slug}`);
  revalidatePath("/");
  revalidatePath("/search");
  return { ok: true as const };
}
