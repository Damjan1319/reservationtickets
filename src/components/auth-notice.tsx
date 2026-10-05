import { cn } from "@/lib/utils";

export function AuthNotice({
  tone,
  children,
}: {
  tone: "danger" | "success" | "info";
  children: React.ReactNode;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-2xl border px-4 py-3 text-sm leading-relaxed",
        tone === "danger" && "border-danger/35 bg-danger/10 text-danger",
        tone === "success" && "border-paper-line bg-paper-2 text-paper-text",
        tone === "info" && "border-paper-line bg-paper-2 text-paper-muted",
      )}
    >
      {children}
    </div>
  );
}
