// SPEC §5.2: times are stored in UTC and shown in Vietnam time.
const dateTimeFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh',
})
const timeFormat = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' })
const MINUTE = 60 * 1000
const DAY_MINUTES = 24 * 60

export const formatDateTime = instant => dateTimeFormat.format(new Date(instant))

export const formatTime = instant => timeFormat.format(new Date(instant))

export const formatCoins = amount => `${amount.toLocaleString()} coins`

export const formatFee = fee => fee > 0 ? formatCoins(fee) : 'Free'

/** "in 3 days", "in 2 h 5 min", "in 4 min"; "now" once the time has come. */
export function timeUntil(instant, now) {
  const minutes = Math.ceil((Date.parse(instant) - now) / MINUTE)
  if (minutes <= 0) return 'now'
  if (minutes >= DAY_MINUTES) {
    const days = Math.floor(minutes / DAY_MINUTES)
    return `in ${days} ${days === 1 ? 'day' : 'days'}`
  }
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return `in ${[hours && `${hours} h`, rest && `${rest} min`].filter(Boolean).join(' ')}`
}

export const placeLabel = place => `${place}${{ 1: 'st', 2: 'nd', 3: 'rd' }[place] || 'th'}`

export const playerName = (profiles, accountId) => profiles[accountId]?.displayName || `Player ${accountId.slice(-6)}`

export const typeLabels = { ELITE: 'Elite', OPEN: 'Open' }

export const statusLabels = {
  SCHEDULED: 'Scheduled', QUALIFYING: 'Qualifiers live', FINAL: 'Final live', FINISHED: 'Finished', CANCELLED: 'Cancelled',
}

export const entryLabels = {
  INVITED: 'Invited', CONFIRMED: 'Confirmed', REGISTERED: 'Registered', ELIMINATED: 'Knocked out', EXPIRED: 'Expired',
}

/** Entries that hold a place: registered OPEN players and confirmed ELITE invitees. */
export const holdsPlace = entry => entry.status === 'REGISTERED' || entry.status === 'CONFIRMED'
