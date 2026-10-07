"use client";

import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { registerUser } from "@/app/actions/auth";
import { AuthNotice } from "@/components/auth-notice";
import { GoogleButton } from "@/components/google-button";

export function RegisterForm({ googleEnabled }: { googleEnabled: boolean }) {
  const t = useTranslations("auth");
  const tv = useTranslations("validation");
  const router = useRouter();
  const [notice, setNotice] = useState<{ tone: "danger" | "success" | "info"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function messageFor(code: string) {
    if (code === "minPassword" || code === "invalidEmail") return tv(code);
    if (code === "useGoogle") return t("useGoogle");
    if (code === "failed") return t("failed");
    return t(code as "required" | "exists");
  }

  return (
    <div className="space-y-5">
      {notice ? <AuthNotice tone={notice.tone}>{notice.text}</AuthNotice> : null}

      {googleEnabled ? (
        <>
          <GoogleButton callbackUrl="/after-login" label={t("google")} pendingLabel={t("working")} />
          <p className="text-center text-xs text-paper-muted">{t("orEmail")}</p>
        </>
      ) : null}

      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const password = String(data.get("password") ?? "");
          startTransition(async () => {
            const result = await registerUser(data);
            if (result.error) {
              setNotice({ tone: result.error === "useGoogle" ? "info" : "danger", text: messageFor(result.error) });
              return;
            }

            const signed = await signIn("credentials", {
              email: result.email,
              password,
              redirect: false,
            });
            if (!signed?.ok) {
              setNotice({ tone: "success", text: t("createdNowLogin") });
              router.push("/login?registered=1");
              router.refresh();
              return;
            }

            setNotice({ tone: "success", text: t("welcome") });
            router.push("/after-login");
            router.refresh();
          });
        }}
      >
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-paper-text">{t("name")}</span>
          <input
            name="name"
            required
            className="w-full rounded-xl border border-paper-line bg-paper-2 px-4 py-3 outline-none focus:border-paper-text"
          />
        </label>
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
            minLength={6}
            required
            className="w-full rounded-xl border border-paper-line bg-paper-2 px-4 py-3 outline-none focus:border-paper-text"
          />
        </label>
        <button type="submit" disabled={pending} className="btn btn-primary btn-full">
          {pending ? t("working") : t("submitRegister")}
        </button>
      </form>

      <p className="text-center text-sm text-paper-muted">
        {t("hasAccount")}{" "}
        <Link href="/login" className="underline underline-offset-2 hover:text-paper-text">
          {t("submitLogin")}
        </Link>
      </p>
    </div>
  );
}
