import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md bg-cream", className)}
    >
      <span className="h-[2px] w-3 rounded-full bg-bg" />
    </span>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 text-[17px] font-bold tracking-[-0.02em] text-cream", className)}>
      <LogoMark />
      {APP_NAME}
    </span>
  );
}
