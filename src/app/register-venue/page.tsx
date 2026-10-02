import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { RegisterVenueForm } from "@/components/register-venue-form";

export default async function RegisterVenuePage() {
  const t = await getTranslations("venue");
  const session = await auth();

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <div className="rounded-2xl border border-paper-line bg-paper p-6 text-paper-text sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">{t("registerTitle")}</h1>
        <p className="mt-2 text-sm text-paper-muted">{t("registerSubtitle")}</p>
        <div className="mt-8">
          <RegisterVenueForm signedIn={Boolean(session?.user)} />
        </div>
      </div>
    </div>
  );
}
