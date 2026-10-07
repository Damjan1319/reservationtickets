"use server";

import bcrypt from "bcryptjs";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function inspectLogin(emailValue: string) {
  const email = emailValue.toLowerCase().trim();
  if (!email.includes("@")) {
    return { error: "invalidEmail" as const };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { passwordHash: true },
  });

  if (!user) return { error: "noAccount" as const };
  if (!user.passwordHash) return { error: "useGoogle" as const };
  return { ok: true as const };
}

export async function loginUser(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .toLowerCase()
    .trim();
  const password = String(formData.get("password") ?? "");
  if (!email.includes("@")) {
    return { error: "invalidEmail" as const };
  }
  if (!password) {
    return { error: "required" as const };
  }

  const inspect = await inspectLogin(email);
  if (inspect.error) return inspect;

  try {
    await signIn("credentials", { email, password, redirect: false });
    return { ok: true as const };
  } catch {
    return { error: "wrongPassword" as const };
  }
}

export async function registerUser(formData: FormData) {
  try {
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
      return { error: existing.passwordHash ? ("exists" as const) : ("useGoogle" as const) };
    }

    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: await bcrypt.hash(password, 10),
      },
    });

    return { ok: true as const, email };
  } catch (error) {
    console.error(error);
    return { error: "failed" as const };
  }
}
