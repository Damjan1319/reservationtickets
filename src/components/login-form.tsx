"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { loginUser } from "@/app/actions/auth";
import { AuthNotice } from "@/components/auth-notice";
import { GoogleButton } from "@/components/google-button";
import { safeCallbackUrl } from "@/lib/auth-callback";

export function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const t = useTranslations("auth");
  const tv = useTranslations("validation");
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = safeCallbackUrl(params.get("callbackUrl"));
  const [notice, setNotice] = useState<{ tone: "danger" | "success" | "info"; text: string } | null>(
    () => {
      if (params.get("registered") === "1") return { tone: "success", text: t("createdNowLogin") };
      if (params.get("error")) return { tone: "danger", text: t("googleFailed") };
      return null;
    },
  );
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-5">
      {notice ? <AuthNotice tone={notice.tone}>{notice.text}</AuthNotice> : null}

      {googleEnabled ? (
        <>
          <GoogleButton callbackUrl={callbackUrl} label={t("google")} pendingLabel={t("working")} />
          <p className="text-center text-xs text-paper-muted">{t("orEmail")}</p>
        </>
      ) : null}

      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          startTransition(async () => {
            const result = await loginUser(data);
            if (result.error === "invalidEmail") {
              setNotice({ tone: "danger", text: tv("invalidEmail") });
              return;
            }
            if (result.error === "noAccount") {
              setNotice({ tone: "danger", text: t("noAccountExists") });
              return;
            }
            if (result.error === "useGoogle") {
              setNotice({ tone: "info", text: t("useGoogle") });
              return;
            }
            if (result.error) {
              setNotice({ tone: "danger", text: t("wrongPassword") });
              return;
            }
            router.push(callbackUrl);
            router.refresh();
          });
        }}
      >
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-paper-text">{t("email")}</span>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-xl border border-paper-line bg-paper-2 px-4 py-3 outline-none focus:border-paper-text"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-paper-text">{t("password")}</span>
          <input
            name="password"
            type="password"
            required
            className="w-full rounded-xl border border-paper-line bg-paper-2 px-4 py-3 outline-none focus:border-paper-text"
          />
        </label>
        <button type="submit" disabled={pending} className="btn btn-primary btn-full">
          {pending ? t("working") : t("submitLogin")}
        </button>
      </form>

      <p className="text-center text-sm text-paper-muted">
        {t("noAccount")}{" "}
        <Link href="/register" className="underline underline-offset-2 hover:text-paper-text">
          {t("submitRegister")}
        </Link>
      </p>
    </div>
  );
}
