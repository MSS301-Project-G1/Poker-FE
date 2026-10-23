// SPEC §5.2: times are stored in UTC and entered and shown in Vietnam time, which has no daylight saving.
const VIETNAM_OFFSET = '+07:00'
const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh',
})
// sv-SE prints "2026-10-24 03:28", the shape a datetime-local input expects once the space becomes "T".
const inputFormat = new Intl.DateTimeFormat('sv-SE', {
  year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'Asia/Ho_Chi_Minh',
})

export const formatDateTime = instant => dateFormat.format(new Date(instant))

export const toVietnamInput = instant => inputFormat.format(new Date(instant)).replace(' ', 'T')

export const fromVietnamInput = value => new Date(`${value}:00${VIETNAM_OFFSET}`).toISOString()

export const formatCoins = amount => `${amount.toLocaleString()} coins`

export const formatFee = fee => fee > 0 ? formatCoins(fee) : 'Free'

export const typeLabels = { ELITE: 'Elite', OPEN: 'Open' }

export const statusLabels = {
  SCHEDULED: 'Scheduled', QUALIFYING: 'Qualifiers live', FINAL: 'Final live', FINISHED: 'Finished', CANCELLED: 'Cancelled',
}
