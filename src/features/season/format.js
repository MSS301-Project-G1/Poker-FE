// SPEC §5.2: times are stored in UTC and shown in Vietnam time.
const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' })

export const formatDate = instant => dateFormat.format(new Date(instant))

export const formatCoins = amount => `${amount.toLocaleString()} coins`

/** Total coins and number of skins in a reward list. */
export function summarize(rewards) {
  return rewards.reduce((total, reward) => reward.rewardType === 'COIN'
    ? { ...total, coins: total.coins + reward.amount }
    : { ...total, items: total.items + 1 }, { coins: 0, items: 0 })
}
