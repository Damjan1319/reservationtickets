import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <p className="text-sm font-medium text-muted">404</p>
      <h1 className="mt-2 text-2xl font-semibold">Ulaznice</h1>
      <Link href="/" className="mt-8 inline-block text-sm text-muted hover:text-cream">
        ←
      </Link>
    </div>
  );
}
