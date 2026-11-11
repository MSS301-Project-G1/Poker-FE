export const dateTime = value => value ? new Date(value).toLocaleString('en-US') : '—'
export const errorMessage = error => error?.message || 'The request failed.'
export const inputClass = 'w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2.5 text-sm focus:outline-none focus:border-primary'
