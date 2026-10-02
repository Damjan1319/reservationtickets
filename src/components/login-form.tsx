"use client";

import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

export function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/after-login";
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(async () => {
          const result = await signIn("credentials", {
            email: String(data.get("email") ?? ""),
            password: String(data.get("password") ?? ""),
            redirect: false,
          });
          if (!result?.ok) {
            setError(true);
            return;
          }
          router.push(callbackUrl);
          router.refresh();
        });
      }}
    >
      <label className="block space-y-2">
        <span className="text-sm text-paper-muted">{t("email")}</span>
        <input
          name="email"
          type="email"
          required
          className="w-full rounded-xl border border-paper-line bg-paper-2 px-4 py-3 outline-none focus:border-paper-text"
        />
      </label>
      <label className="block space-y-2">
        <span className="text-sm text-paper-muted">{t("password")}</span>
        <input
          name="password"
          type="password"
          required
          className="w-full rounded-xl border border-paper-line bg-paper-2 px-4 py-3 outline-none focus:border-paper-text"
        />
      </label>
      {error ? <p className="text-sm text-danger">{t("invalid")}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary btn-full"
      >
        {t("submitLogin")}
      </button>
      <p className="text-center text-sm text-paper-muted">
        {t("noAccount")}{" "}
        <Link href="/register" className="underline underline-offset-2 hover:text-paper-text">
          {t("submitRegister")}
        </Link>
      </p>
    </form>
  );
}
