export default function DetailField({ label, children }) {
  return <div className="min-w-0"><dt className="text-xs text-on-surface-variant">{label}</dt><dd className="break-words">{children ?? '—'}</dd></div>
}
