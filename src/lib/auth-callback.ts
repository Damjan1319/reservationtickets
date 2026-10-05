export function safeCallbackUrl(value: string | null | undefined, fallback = "/after-login") {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("://")) {
    return fallback;
  }
  return value;
}

export function googleAuthEnabled() {
  return Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
}
