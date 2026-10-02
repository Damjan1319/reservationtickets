"use client";

import { useTranslations } from "next-intl";

export function CopyEmails({ emails }: { emails: string[] }) {
  const t = useTranslations("dashboard");

  if (emails.length === 0) return null;

  return (
    <button
      type="button"
      onClick={() => void navigator.clipboard.writeText(emails.join("\n"))}
      className="text-sm text-paper-muted hover:text-paper-text"
    >
      {t("copyEmails")}
    </button>
  );
}
