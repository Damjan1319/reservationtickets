"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { auth, signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { VENUE_TYPES } from "@/lib/constants";
import { isValidPhone, isValidPib, isValidProofUrl, isValidSlug, normalizePib, slugify } from "@/lib/utils";
import { requireAdmin, requireOwner } from "@/lib/staff";

const COVER_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

async function saveCoverFile(file: File | null) {
  if (!file || file.size === 0) return { url: null as string | null };
  if (!COVER_TYPES.has(file.type)) return { error: "coverType" as const };
  if (file.size > 1_500_000) return { error: "coverSize" as const };
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    return { url: `data:${file.type};base64,${buffer.toString("base64")}` };
  } catch {
    return { error: "coverSave" as const };
  }
}

async function readVenueFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? name));
  const type = String(formData.get("type") ?? "CLUB");
  const city = String(formData.get("city") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const pib = normalizePib(String(formData.get("pib") ?? ""));
  const proofUrl = String(formData.get("proofUrl") ?? "").trim();
  const tableCapacity = Math.max(0, Math.floor(Number(formData.get("tableCapacity") ?? 0) || 0));
  const opensAt = String(formData.get("opensAt") ?? "10:00").trim();
  const closesAt = String(formData.get("closesAt") ?? "23:30").trim();
  const closed = String(formData.get("closed") ?? "") === "on";
  const noShowMinutes = Math.min(240, Math.max(15, Math.floor(Number(formData.get("noShowMinutes") ?? 45) || 45)));

  return {
    name,
    slug,
    type,
    city,
    address,
    description,
    phone,
    pib,
    proofUrl,
    tableCapacity,
    opensAt,
    closesAt,
    closed,
    noShowMinutes,
  };
}

export async function registerVenue(formData: FormData) {
  const fields = await readVenueFields(formData);
  if (!fields.name || !fields.city || !fields.address || !fields.description) {
    return { error: "required" as const };
  }
  if (!isValidPib(fields.pib)) {
    return { error: "pibInvalid" as const };
  }
  if (!isValidPhone(fields.phone)) {
    return { error: "phoneInvalid" as const };
  }
  if (!isValidProofUrl(fields.proofUrl)) {
    return { error: "proofInvalid" as const };
  }
  if (!isValidSlug(fields.slug)) {
    return { error: "slugInvalid" as const };
  }
  if (!VENUE_TYPES.includes(fields.type as (typeof VENUE_TYPES)[number])) {
    return { error: "required" as const };
  }

  const taken = await prisma.venue.findUnique({ where: { slug: fields.slug } });
  if (taken) {
    return { error: "slugTaken" as const };
  }
  const pibTaken = await prisma.venue.findFirst({ where: { pib: fields.pib } });
  if (pibTaken) {
    return { error: "pibTaken" as const };
  }

  let session = await auth();
  let userId = session?.user?.id;

  if (!userId) {
    const ownerName = String(formData.get("ownerName") ?? "").trim();
    const email = String(formData.get("email") ?? "")
      .toLowerCase()
      .trim();
    const password = String(formData.get("password") ?? "");
    if (!ownerName || !email || password.length < 6) {
      return { error: "required" as const };
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { error: "exists" as const };
    }
    const user = await prisma.user.create({
      data: {
        name: ownerName,
        email,
        passwordHash: await bcrypt.hash(password, 10),
      },
    });
    userId = user.id;
    await signIn("credentials", { email, password, redirect: false });
  }

  const alreadyOwner = await prisma.venue.findFirst({ where: { ownerId: userId } });
  if (alreadyOwner) {
    return { error: "ownerExists" as const };
  }

  const hues = [12, 22, 28, 36, 42, 200, 260];
  const venue = await prisma.venue.create({
    data: {
      ...fields,
      coverHue: hues[Math.floor(Math.random() * hues.length)],
      ownerId: userId,
      verificationStatus: "PENDING",
    },
  });

  await prisma.staffMembership.create({
    data: { userId, venueId: venue.id, role: "OWNER" },
  });

  revalidatePath("/");
  revalidatePath(`/v/${venue.slug}`);
  redirect(`/dashboard`);
}

export async function updateVenue(formData: FormData) {
  const context = await requireOwner();
  if (!context) return { error: "ownerOnly" as const };

  const fields = await readVenueFields(formData);
  if (!fields.name || !fields.city || !fields.address || !fields.description) {
    return { error: "required" as const };
  }
  if (!isValidPhone(fields.phone)) {
    return { error: "phoneInvalid" as const };
  }
  if (!isValidProofUrl(fields.proofUrl)) {
    return { error: "proofInvalid" as const };
  }
  if (!VENUE_TYPES.includes(fields.type as (typeof VENUE_TYPES)[number])) {
    return { error: "required" as const };
  }

  const proofChanged =
    fields.phone !== context.venue.phone || fields.proofUrl !== context.venue.proofUrl;

  const cover = await saveCoverFile(
    formData.get("cover") instanceof File ? (formData.get("cover") as File) : null,
  );
  if ("error" in cover) return { error: cover.error };

  try {
    await prisma.venue.update({
      where: { id: context.venue.id },
      data: {
        name: fields.name,
        type: fields.type,
        city: fields.city,
        address: fields.address,
        description: fields.description,
        phone: fields.phone,
        proofUrl: fields.proofUrl,
        tableCapacity: fields.tableCapacity,
        opensAt: fields.opensAt,
        closesAt: fields.closesAt,
        closed: fields.closed,
        noShowMinutes: fields.noShowMinutes,
        ...(cover.url ? { coverUrl: cover.url } : {}),
        verificationStatus: proofChanged ? "PENDING" : context.venue.verificationStatus,
      },
    });
  } catch {
    return { error: "coverSave" as const };
  }

  revalidatePath("/dashboard/settings");
  revalidatePath(`/v/${context.venue.slug}`);
  revalidatePath("/");
  return { ok: true as const };
}

export async function setVenueVerification(venueId: string, status: "VERIFIED" | "REJECTED") {
  const admin = await requireAdmin();
  if (!admin) return { error: "adminOnly" as const };

  await prisma.venue.update({
    where: { id: venueId },
    data: { verificationStatus: status },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  return { ok: true as const };
}
