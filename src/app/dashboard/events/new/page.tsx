import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { EventForm } from "@/components/event-form";
import { PageHeader } from "@/components/page-header";
import { requireOwner } from "@/lib/staff";

export default async function NewEventPage() {
  const context = await requireOwner();
  if (!context) redirect("/dashboard");
  const t = await getTranslations("event");

  return (
    <div>
      <PageHeader title={t("newTitle")} />
      <div className="mt-6 max-w-xl rounded-2xl border border-paper-line bg-paper p-5 text-paper-text sm:p-6">
        <EventForm />
      </div>
    </div>
  );
}
