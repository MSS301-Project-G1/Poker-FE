export default function DetailSection({ title, actions, children }) {
  return <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-low p-space-lg" aria-label={title}>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="font-headline-md text-headline-md">{title}</h2>{actions}</div>
    {children}
  </section>
}
