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
        className: 'bg-tertiary/20 text-tertiary-fixed border border-tertiary/30 font-black',
      }
    case 'VIP':
      return {
        label: 'VIP',
        className: 'bg-primary-container/40 text-primary border border-primary/30 font-bold',
      }
    case 'NORMAL':
    default:
      return {
        label: 'Standard',
        className: 'bg-white/10 text-white/60 font-medium',
      }
  }
}
