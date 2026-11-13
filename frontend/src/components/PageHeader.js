// Big serif title with a short gold rule - the signature of every page.
export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="no-print mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-semibold text-brand-800 sm:text-4xl">{title}</h1>
        <div className="mt-3 h-0.5 w-12 bg-gold-500" />
        {subtitle && <p className="mt-3 max-w-prose text-sm text-ink-soft">{subtitle}</p>}
      </div>
      <div className="flex gap-2">{children}</div>
    </div>
  );
}
