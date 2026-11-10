/**
 * Utility formatters for Feature Shop & VIP Coins
 */

export function formatVipCoin(amount) {
  if (amount === undefined || amount === null) return '0'
  return new Intl.NumberFormat('en-US').format(amount)
}

export function formatVnd(amount) {
  if (amount === undefined || amount === null) return '₫0'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function getTierBadge(tier) {
  switch (tier) {
    case 'SUPER_VIP':
      return {
        label: 'Super VIP',
        className: 'bg-tertiary text-on-tertiary font-bold',
      }
    case 'VIP':
      return {
        label: 'VIP',
        className: 'bg-primary-container text-on-primary-container font-bold shadow-sm',
      }
    case 'NORMAL':
    default:
      return {
        label: 'Standard',
        className: 'bg-surface-container-high text-on-surface-variant font-medium',
      }
  }
}

export function isCardProduct(product) {
  if (!product) return false
  const code = String(product.categoryCode || '').toUpperCase()
  if (code) {
    return code === 'CARD_SKIN' || code === 'CARD' || code === 'DECK'
  }
  const name = String(product.categoryName || '').toLowerCase()
  if (name.includes('người chia bài') || name.includes('dealer')) return false
  const pName = String(product.name || '').toLowerCase()
  return (
    name.includes('bộ bài') ||
    name.includes('skin bài') ||
    name.includes('deck') ||
    pName.includes('bộ bài') ||
    pName.includes('lá bài')
  )
}

export function getCategoryIcon(code) {
  switch (code) {
    case 'CARD_SKIN':
      return 'style'
    case 'TABLE':
      return 'casino'
    case 'FRAME':
      return 'account_box'
    case 'DEALER':
      return 'person'
    case 'VICTORY_EFFECT':
      return 'celebration'
    case 'ALL_IN_EFFECT':
      return 'local_fire_department'
    case 'COIN_SKIN':
      return 'monetization_on'
    case 'EMOJI':
      return 'mood'
    case 'SOUND':
      return 'volume_up'
    default:
      return 'category'
  }
}
