"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function CopyLink({ value }: { value: string }) {
  const t = useTranslations("common");
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-full border border-line px-3 py-1 text-xs text-muted hover:border-gold hover:text-cream"
    >
      {copied ? t("copied") : t("copy")}
    </button>
  );
}
