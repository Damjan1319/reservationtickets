"use client";

import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";

export function HeaderControls({ theme }: { theme: "light" | "dark" }) {
  return (
    <div className="flex h-8 items-center rounded-lg border border-line bg-surface/70 px-0.5">
      <LanguageSwitcher />
      <span className="mx-0.5 h-3.5 w-px bg-line" />
      <ThemeToggle theme={theme} />
    </div>
  );
}
