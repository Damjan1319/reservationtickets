"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLocale } from "@/app/actions/locale";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function switchTo(next: "sr" | "en") {
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center">
      {(["sr", "en"] as const).map((code) => (
        <button
          key={code}
          type="button"
          disabled={pending}
          onClick={() => switchTo(code)}
          className={cn(
            "rounded-md px-1.5 py-1 text-[11px] font-semibold uppercase tracking-wide transition",
            locale === code ? "text-cream" : "text-muted hover:text-cream",
          )}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
