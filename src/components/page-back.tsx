import Link from "next/link";

export function PageBack({
  href,
  label,
  onImage,
}: {
  href: string;
  label: string;
  onImage?: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        onImage
          ? "flex items-center gap-1.5 text-sm font-medium text-cream/80 hover:text-white"
          : "mb-8 flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-cream"
      }
    >
      <svg
        width="8"
        height="13"
        viewBox="0 0 8 13"
        aria-hidden
        className="shrink-0"
        style={{ width: 8, height: 13 }}
      >
        <path
          d="M6.5 1.5 1.5 6.5l5 5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {label}
    </Link>
  );
}
