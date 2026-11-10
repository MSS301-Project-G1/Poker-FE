import { gatewayRequest } from '@/shared/api/gatewayClient'

/**
 * Raw HTTP Service for User Inventory, Equipping & Refund Tickets
 */

export async function getMyInventory({ signal } = {}) {
  return gatewayRequest('/api/inventory/me', {
    signal,
    errorMessage: 'Couldn’t load the player’s inventory',
  })
}

export async function getMyInventoryItem(productId, { signal } = {}) {
  return gatewayRequest(`/api/inventory/${productId}`, {
    signal,
    errorMessage: 'Couldn’t load the inventory item',
  })
}

export async function equipItem(productId) {
  return gatewayRequest(`/api/inventory/${productId}/equip`, {
    method: 'PUT',
    errorMessage: 'Couldn’t equip the item',
  })
}

export async function unequipItem(productId) {
  return gatewayRequest(`/api/inventory/${productId}/equip`, {
    method: 'DELETE',
    errorMessage: 'Couldn’t unequip the item',
  })
}


