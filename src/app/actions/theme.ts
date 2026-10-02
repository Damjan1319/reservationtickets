"use server";

import { cookies } from "next/headers";

export async function setTheme(theme: "light" | "dark") {
  const store = await cookies();
  store.set("theme", theme, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
