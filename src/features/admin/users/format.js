export const dateTime = value => value ? new Date(value).toLocaleString('vi-VN') : '—'
export const errorMessage = error => error?.requestId ? `${error.message} (Mã: ${error.requestId})` : error?.message || 'Không thực hiện được yêu cầu.'
export const inputClass = 'w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2.5 text-sm focus:outline-none focus:border-primary'
