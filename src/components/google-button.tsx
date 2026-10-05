"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export function GoogleButton({
  callbackUrl,
  label,
  pendingLabel,
}: {
  callbackUrl: string;
  label: string;
  pendingLabel: string;
}) {
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        setPending(true);
        void signIn("google", { callbackUrl });
      }}
      className="btn btn-ghost btn-full gap-2"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
        <path
          fill="#4285F4"
          d="M23.49 12.27c0-.82-.07-1.64-.23-2.43H12v4.6h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.55-5.17 3.55-8.79Z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.96-1.07 7.95-2.94l-3.88-3c-1.08.74-2.47 1.18-4.07 1.18-3.13 0-5.78-2.11-6.73-4.96H1.27v3.09A12 12 0 0 0 12 24Z"
        />
        <path
          fill="#FBBC05"
          d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.63H1.27A12 12 0 0 0 0 12c0 1.94.46 3.78 1.27 5.37l4-3.09Z"
        />
        <path
          fill="#EA4335"
          d="M12 4.75c1.76 0 3.34.61 4.58 1.8l3.43-3.43C17.95 1.19 15.23 0 12 0 7.31 0 3.24 2.69 1.27 6.63l4 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
        />
      </svg>
      {pending ? pendingLabel : label}
    </button>
  );
}
