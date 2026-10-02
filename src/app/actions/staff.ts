"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/staff";

export async function addStaffMember(formData: FormData) {
  const context = await requireOwner();
  if (!context) return { error: "ownerOnly" as const };

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .toLowerCase()
    .trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !email) return { error: "required" as const };

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    if (password.length < 6) return { error: "minPassword" as const };
    user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: await bcrypt.hash(password, 10),
      },
    });
  }

  const existing = await prisma.staffMembership.findUnique({
    where: { userId_venueId: { userId: user.id, venueId: context.venue.id } },
  });
  if (existing) return { error: "exists" as const };

  await prisma.staffMembership.create({
    data: {
      userId: user.id,
      venueId: context.venue.id,
      role: "STAFF",
    },
  });

  revalidatePath("/dashboard/staff");
  return { ok: true as const };
}

export async function removeStaffMember(membershipId: string) {
  const context = await requireOwner();
  if (!context) return { error: "ownerOnly" as const };

  await prisma.staffMembership.deleteMany({
    where: {
      id: membershipId,
      venueId: context.venue.id,
      role: "STAFF",
    },
  });

  revalidatePath("/dashboard/staff");
  return { ok: true as const };
}
