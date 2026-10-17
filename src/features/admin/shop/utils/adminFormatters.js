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
        className: 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-black',
      }
    case 'VIP':
      return {
        label: 'VIP',
        className: 'bg-primary-container/40 text-primary border border-primary/30 font-bold',
      }
    case 'NORMAL':
    default:
      return {
        label: 'STANDARD',
        className: 'bg-white/10 text-white/60 font-medium',
      }
  }
}
