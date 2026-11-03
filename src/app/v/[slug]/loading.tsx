export default function VenueLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-6">
      <div className="h-4 w-24 animate-pulse rounded bg-surface-2" />
      <div className="mt-4 h-56 animate-pulse rounded-xl bg-surface-2 sm:h-80" />
      <div className="space-y-4 py-8">
        <div className="h-4 w-32 animate-pulse rounded bg-surface-2" />
        <div className="h-9 w-2/3 animate-pulse rounded-lg bg-surface-2" />
        <div className="h-40 animate-pulse rounded-xl bg-surface-2" />
      </div>
    </div>
  );
}
