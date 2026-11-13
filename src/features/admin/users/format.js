export const dateTime = value => value ? new Date(value).toLocaleString('en-US') : '—'
export const errorMessage = error => error?.message || 'The request failed.'
export const inputClass = 'w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2.5 text-sm focus:outline-none focus:border-primary'
export const fieldGridClass = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
export const titleCase = value => value ? value.charAt(0) + value.slice(1).toLowerCase().replaceAll('_', ' ') : null
