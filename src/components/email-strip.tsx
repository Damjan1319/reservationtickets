import { CopyEmails } from "@/components/copy-emails";

export function EmailStrip({
  label,
  empty,
  emails,
}: {
  label: string;
  empty: string;
  emails: string[];
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-4 py-3">
      <p className="text-sm font-medium text-cream/80">
        {emails.length === 0 ? empty : `${emails.length} · ${label}`}
      </p>
      <CopyEmails emails={emails} />
    </div>
  );
}
