import { getTranslations } from "next-intl/server";
import { RegisterForm } from "@/components/register-form";

export default async function RegisterPage() {
  const t = await getTranslations("auth");

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-paper-line bg-paper p-6 text-paper-text sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">{t("registerTitle")}</h1>
        <p className="mt-2 text-sm text-paper-muted">{t("registerSubtitle")}</p>
        <div className="mt-8">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
