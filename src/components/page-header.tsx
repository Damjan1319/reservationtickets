export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow ? <p className="text-sm font-medium text-cream/60">{eyebrow}</p> : null}
        <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-cream sm:text-3xl">{title}</h1>
        {description ? <p className="mt-2 max-w-xl text-sm leading-relaxed text-cream/70">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
