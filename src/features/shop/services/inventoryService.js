import { gatewayRequest } from '@/shared/api/gatewayClient'

/**
 * Raw HTTP Service for User Inventory & Item Equipping
 */

export async function getMyInventory({ signal } = {}) {
  return gatewayRequest('/api/inventory/me', {
    signal,
    errorMessage: 'Không thể tải túi đồ người chơi',
  })
}

export async function getMyInventoryItem(productId, { signal } = {}) {
  return gatewayRequest(`/api/inventory/${productId}`, {
    signal,
    errorMessage: 'Không thể tải chi tiết vật phẩm trong túi đồ',
  })
}

export async function equipItem(productId) {
  return gatewayRequest(`/api/inventory/${productId}/equip`, {
    method: 'PUT',
    errorMessage: 'Không thể trang bị vật phẩm',
  })
}

export async function unequipItem(productId) {
  return gatewayRequest(`/api/inventory/${productId}/equip`, {
    method: 'DELETE',
    errorMessage: 'Không thể gỡ trang bị vật phẩm',
  })
}
