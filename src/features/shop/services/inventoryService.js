import { request } from '@/shared/api/httpClient'

/**
 * Raw HTTP Service for User Inventory & Item Equipping
 */

export async function getMyInventory({ signal } = {}) {
  return request('/api/inventory/me', {
    signal,
    errorMessage: 'Không thể tải túi đồ người chơi',
  })
}

export async function getMyInventoryItem(productId, { signal } = {}) {
  return request(`/api/inventory/${productId}`, {
    signal,
    errorMessage: 'Không thể tải chi tiết vật phẩm trong túi đồ',
  })
}

export async function equipItem(productId) {
  return request(`/api/inventory/${productId}/equip`, {
    method: 'PUT',
    errorMessage: 'Không thể trang bị vật phẩm',
  })
}

export async function unequipItem(productId) {
  return request(`/api/inventory/${productId}/equip`, {
    method: 'DELETE',
    errorMessage: 'Không thể gỡ trang bị vật phẩm',
  })
}
