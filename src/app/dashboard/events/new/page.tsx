import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { EventForm } from "@/components/event-form";
import { requireOwner } from "@/lib/staff";

export default async function NewEventPage() {
  const context = await requireOwner();
  if (!context) redirect("/dashboard");
  const t = await getTranslations("event");

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">{t("newTitle")}</h1>
      <div className="mt-8 max-w-xl rounded-2xl border border-paper-line bg-paper p-5 text-paper-text sm:p-6">
        <EventForm />
      </div>
    </div>
  );
}
