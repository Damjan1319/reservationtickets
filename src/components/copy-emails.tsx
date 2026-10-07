"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export function CopyEmails({ emails, className }: { emails: string[]; className?: string }) {
  const t = useTranslations("dashboard");

  if (emails.length === 0) return null;

  return (
    <button
      type="button"
      onClick={() => void navigator.clipboard.writeText(emails.join("\n"))}
      className={cn("text-sm font-semibold text-cream/70 hover:text-cream", className)}
    >
      {t("copyEmails")}
    </button>
  );
}
