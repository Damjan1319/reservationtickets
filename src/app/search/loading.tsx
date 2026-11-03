export default function SearchLoading() {
  return (
    <div>
      <div className="border-b border-line">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="h-12 animate-pulse rounded-xl bg-surface" />
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="h-11 animate-pulse rounded-xl bg-surface lg:hidden" />
        <div className="mt-6 h-8 w-48 animate-pulse rounded-lg bg-surface" />
        <div className="mt-6 grid gap-4">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="h-48 animate-pulse rounded-xl bg-surface" />
          ))}
        </div>
      </div>
    </div>
  );
}
