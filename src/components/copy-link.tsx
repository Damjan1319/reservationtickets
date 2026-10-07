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
      className="rounded-full border border-cream px-3 py-1 text-xs font-semibold text-cream hover:bg-cream hover:text-bg"
    >
      {copied ? t("copied") : t("copy")}
    </button>
  );
}
