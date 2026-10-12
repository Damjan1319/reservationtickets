"use server";

import { revalidatePath } from "next/cache";
import { MENU_KINDS, PROMO_KINDS } from "@/lib/constants";
import { parseOptionalDate } from "@/lib/offers";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/staff";

function refresh(slug: string) {
  revalidatePath("/dashboard/menu");
  revalidatePath("/dashboard/promos");
  revalidatePath(`/v/${slug}`);
  revalidatePath("/");
  revalidatePath("/search");
}

export async function createMenu(formData: FormData) {
  const context = await requireStaff();
  if (!context) return { error: "auth" as const };

  const title = String(formData.get("title") ?? "").trim();
  const kind = String(formData.get("kind") ?? "");
  if (!title || !MENU_KINDS.includes(kind as (typeof MENU_KINDS)[number])) {
    return { error: "required" as const };
  }

  await prisma.menu.create({
    data: { venueId: context.venue.id, title, kind },
  });
  refresh(context.venue.slug);
  return { ok: true as const };
}

export async function deleteMenu(menuId: string) {
  const context = await requireStaff();
  if (!context) return { error: "auth" as const };
  await prisma.menu.deleteMany({ where: { id: menuId, venueId: context.venue.id } });
  refresh(context.venue.slug);
  return { ok: true as const };
}

export async function toggleMenu(menuId: string) {
  const context = await requireStaff();
  if (!context) return { error: "auth" as const };
  const menu = await prisma.menu.findFirst({ where: { id: menuId, venueId: context.venue.id } });
  if (!menu) return { error: "required" as const };
  await prisma.menu.update({ where: { id: menu.id }, data: { published: !menu.published } });
  refresh(context.venue.slug);
  return { ok: true as const };
}

export async function createMenuItem(formData: FormData) {
  const context = await requireStaff();
  if (!context) return { error: "auth" as const };

  const menuId = String(formData.get("menuId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const section = String(formData.get("section") ?? "").trim();
  const price = Number(formData.get("price"));
  const menu = await prisma.menu.findFirst({ where: { id: menuId, venueId: context.venue.id } });
  if (!menu || !name) return { error: "required" as const };
  if (!Number.isFinite(price) || price < 0) return { error: "required" as const };

  await prisma.menuItem.create({
    data: {
      menuId: menu.id,
      name,
      description,
      section,
      price: Math.floor(price),
    },
  });
  refresh(context.venue.slug);
  return { ok: true as const };
}

export async function deleteMenuItem(itemId: string) {
  const context = await requireStaff();
  if (!context) return { error: "auth" as const };
  const item = await prisma.menuItem.findFirst({
    where: { id: itemId, menu: { venueId: context.venue.id } },
    select: { id: true },
  });
  if (!item) return { error: "required" as const };
  await prisma.menuItem.delete({ where: { id: item.id } });
  refresh(context.venue.slug);
  return { ok: true as const };
}

export async function createPromotion(formData: FormData) {
  const context = await requireStaff();
  if (!context) return { error: "auth" as const };

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const kind = String(formData.get("kind") ?? "");
  if (!title || !PROMO_KINDS.includes(kind as (typeof PROMO_KINDS)[number])) {
    return { error: "required" as const };
  }

  await prisma.promotion.create({
    data: {
      venueId: context.venue.id,
      createdById: context.userId,
      title,
      body,
      kind,
      startsAt: parseOptionalDate(String(formData.get("startsAt") ?? "")),
      endsAt: parseOptionalDate(String(formData.get("endsAt") ?? "")),
      active: true,
    },
  });
  refresh(context.venue.slug);
  return { ok: true as const };
}

export async function togglePromotion(promoId: string) {
  const context = await requireStaff();
  if (!context) return { error: "auth" as const };
  const promo = await prisma.promotion.findFirst({ where: { id: promoId, venueId: context.venue.id } });
  if (!promo) return { error: "required" as const };
  await prisma.promotion.update({ where: { id: promo.id }, data: { active: !promo.active } });
  refresh(context.venue.slug);
  return { ok: true as const };
}

export async function deletePromotion(promoId: string) {
  const context = await requireStaff();
  if (!context) return { error: "auth" as const };
  await prisma.promotion.deleteMany({ where: { id: promoId, venueId: context.venue.id } });
  refresh(context.venue.slug);
  return { ok: true as const };
}
