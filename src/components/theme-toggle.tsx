"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setTheme } from "@/app/actions/theme";

export function ThemeToggle({ theme }: { theme: "light" | "dark" }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      disabled={pending}
      aria-label={next === "light" ? "Light" : "Dark"}
      title={next === "light" ? "Light" : "Dark"}
      onClick={() =>
        startTransition(async () => {
          document.documentElement.classList.remove("light", "dark");
          document.documentElement.classList.add(next);
          await setTheme(next);
          router.refresh();
        })
      }
      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted hover:text-cream"
    >
      {theme === "dark" ? (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="3.5" />
          <path d="M12 3v1.6M12 19.4V21M4.6 4.6l1.1 1.1M18.3 18.3l1.1 1.1M3 12h1.6M19.4 12H21M4.6 19.4l1.1-1.1M18.3 5.7l1.1-1.1" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M16.5 13.2A6.2 6.2 0 0 1 10.8 7.5 6.4 6.4 0 1 0 16.5 13.2Z" />
        </svg>
      )}
    </button>
  );
}
