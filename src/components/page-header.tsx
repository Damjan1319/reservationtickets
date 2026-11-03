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
        {eyebrow ? <p className="text-sm font-medium text-muted">{eyebrow}</p> : null}
        <h1 className="mt-0.5 text-2xl font-semibold tracking-[-0.02em] text-cream">{title}</h1>
        {description ? <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
