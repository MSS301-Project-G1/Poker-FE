import { gatewayRequest } from '@/shared/api/gatewayClient'

/** The caller's shop inventory: owned items with categoryCode, isEquipped, image links and JSON metadata. */
export const fetchMyInventory = signal =>
  gatewayRequest('/api/inventory/me', { errorMessage: 'Couldn’t load your items', signal })
