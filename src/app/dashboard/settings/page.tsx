import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { CopyLink } from "@/components/copy-link";
import { PageHeader } from "@/components/page-header";
import { VenueSettingsForm } from "@/components/venue-settings-form";
import { requireOwner } from "@/lib/staff";

export default async function SettingsPage() {
  const context = await requireOwner();
  if (!context) redirect("/dashboard");
  const t = await getTranslations("settings");
  const tv = await getTranslations("venue");

  return (
    <div>
      <PageHeader title={t("title")} />
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-cream/70">
        <span>{tv("publicLink")}</span>
        <code className="rounded-full border border-line bg-surface px-3 py-1 text-cream">
          {context.venue.slug}.ulaznice.rs
        </code>
        <CopyLink value={`https://${context.venue.slug}.ulaznice.rs`} />
      </div>
      <div className="mt-8 max-w-xl rounded-2xl border border-paper-line bg-paper p-5 text-paper-text sm:p-6">
        <VenueSettingsForm venue={context.venue} />
      </div>
    </div>
  );
}
