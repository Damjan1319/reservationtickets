"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function registerUser(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .toLowerCase()
    .trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || !password) {
    return { error: "required" as const };
  }
  if (!email.includes("@")) {
    return { error: "invalidEmail" as const };
  }
  if (password.length < 6) {
    return { error: "minPassword" as const };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "exists" as const };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name, email, passwordHash },
  });

  return { ok: true as const, email, password };
}
