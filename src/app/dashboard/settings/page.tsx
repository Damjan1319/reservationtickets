import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { VenueSettingsForm } from "@/components/venue-settings-form";
import { requireOwner } from "@/lib/staff";
import { CopyLink } from "@/components/copy-link";

export default async function SettingsPage() {
  const context = await requireOwner();
  if (!context) redirect("/dashboard");
  const t = await getTranslations("settings");
  const tv = await getTranslations("venue");

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
      <div className="mt-4 flex items-center gap-3 text-sm text-muted">
        <span>{tv("publicLink")}:</span>
        <code>{context.venue.slug}.ulaznice.rs</code>
        <CopyLink value={`https://${context.venue.slug}.ulaznice.rs`} />
      </div>
      <div className="mt-8 max-w-xl rounded-2xl border border-paper-line bg-paper p-5 text-paper-text sm:p-6">
        <VenueSettingsForm venue={context.venue} />
      </div>
    </div>
  );
}
