"use client";

import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { registerUser } from "@/app/actions/auth";

export function RegisterForm() {
  const t = useTranslations("auth");
  const tv = useTranslations("validation");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(async () => {
          const result = await registerUser(data);
          if (result.error) {
            setError(result.error === "minPassword" || result.error === "invalidEmail" ? tv(result.error) : t(result.error));
            return;
          }
          const signed = await signIn("credentials", {
            email: result.email,
            password: result.password,
            redirect: false,
          });
          if (signed?.ok) {
            router.push("/");
            router.refresh();
          }
        });
      }}
    >
      <label className="block space-y-2">
        <span className="text-sm text-paper-muted">{t("name")}</span>
        <input
          name="name"
          required
          className="w-full rounded-xl border border-paper-line bg-paper-2 px-4 py-3 outline-none focus:border-paper-text"
        />
      </label>
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
          minLength={6}
          required
          className="w-full rounded-xl border border-paper-line bg-paper-2 px-4 py-3 outline-none focus:border-paper-text"
        />
      </label>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary btn-full"
      >
        {t("submitRegister")}
      </button>
      <p className="text-center text-sm text-paper-muted">
        {t("hasAccount")}{" "}
        <Link href="/login" className="underline underline-offset-2 hover:text-paper-text">
          {t("submitLogin")}
        </Link>
      </p>
    </form>
  );
}
