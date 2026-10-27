/**
 * Utility formatters for Feature Shop & VIP Coins
 */

export function formatVipCoin(amount) {
  if (amount === undefined || amount === null) return '0'
  return new Intl.NumberFormat('vi-VN').format(amount)
}

export function formatVnd(amount) {
  if (amount === undefined || amount === null) return '0 đ'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function getTierBadge(tier) {
  switch (tier) {
    case 'SUPER_VIP':
      return {
        label: 'SUPER VIP',
        className: 'bg-gradient-to-r from-amber-500 to-yellow-300 text-slate-950 font-black shadow-md shadow-amber-500/20',
      }
    case 'VIP':
      return {
        label: 'VIP',
        className: 'bg-primary-container text-on-primary-container font-bold shadow-sm',
      }
    case 'NORMAL':
    default:
      return {
        label: 'STANDARD',
        className: 'bg-surface-container-high text-on-surface-variant font-medium',
      }
  }
}

export function isCardProduct(product) {
  if (!product) return false
  const code = String(product.categoryCode || '').toUpperCase()
  const name = String(product.categoryName || '').toLowerCase()
  const pName = String(product.name || '').toLowerCase()
  return (
    code.includes('CARD') ||
    code.includes('DECK') ||
    name.includes('bài') ||
    name.includes('card') ||
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
