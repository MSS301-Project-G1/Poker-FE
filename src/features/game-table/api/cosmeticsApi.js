import { gatewayRequest } from '@/shared/api/gatewayClient'

/** The caller's shop inventory: owned items with categoryCode, isEquipped, image links and JSON metadata. */
export const fetchMyInventory = signal =>
  gatewayRequest('/api/inventory/me', { errorMessage: 'Không tải được vật phẩm của bạn', signal })
