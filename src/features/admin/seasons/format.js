import { tierOrder } from '@/features/ranking'

// SPEC §5.2: times are stored in UTC and entered and shown in Vietnam time, which has no daylight saving.
const VIETNAM_OFFSET = '+07:00'
const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh',
})
// sv-SE prints "2026-10-24 03:28", the shape a datetime-local input expects once the space becomes "T".
const inputFormat = new Intl.DateTimeFormat('sv-SE', {
  year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'Asia/Ho_Chi_Minh',
})
const DAY = 24 * 60 * 60 * 1000

export const formatDate = instant => dateFormat.format(new Date(instant))

export const toVietnamInput = instant => inputFormat.format(new Date(instant)).replace(' ', 'T')

export const fromVietnamInput = value => new Date(`${value}:00${VIETNAM_OFFSET}`).toISOString()

export const addDays = (instant, days) => new Date(Date.parse(instant) + days * DAY).toISOString()

export const productName = (products, id) => products.items.find(product => product.id === id)?.name || `Skin ${id.slice(-6)}`

export const statusLabels = { UPCOMING: 'Upcoming', ACTIVE: 'Active', ENDED: 'Ended' }

/** Editor rows per tier: coins as typed text and the skin product ids. */
export function toDraft(rewards) {
  const draft = Object.fromEntries(tierOrder.map(tier => [tier, { coins: '', products: [] }]))
  for (const reward of rewards) {
    if (reward.rewardType === 'COIN') draft[reward.tier].coins = String(reward.amount)
    else draft[reward.tier].products.push(reward.productId)
  }
  return draft
}

/** The request body for the draft: one COIN reward per tier with coins, one PRODUCT reward per skin. */
export const fromDraft = draft => tierOrder.flatMap(tier => [
  ...(Number(draft[tier].coins) > 0 ? [{ tier, rewardType: 'COIN', amount: Number(draft[tier].coins) }] : []),
  ...draft[tier].products.map(productId => ({ tier, rewardType: 'PRODUCT', productId })),
])

/** Total coins and number of skins in a reward list. */
export const summarize = rewards => rewards.reduce((total, reward) => reward.rewardType === 'COIN'
  ? { ...total, coins: total.coins + reward.amount }
  : { ...total, items: total.items + 1 }, { coins: 0, items: 0 })
