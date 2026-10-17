import { request } from '@/shared/api/httpClient'

/**
 * Raw HTTP Service for VIP Coin Bundles & PayOS Payment Orders
 */

export async function getCoinBundles({ signal } = {}) {
  return request('/api/shop/bundles', {
    signal,
    errorMessage: 'Không thể tải danh sách gói nạp',
  })
}

/**
 * Creates PayOS payment order for a VIP Coin bundle
 * Server returns ApiResponse<OrderResponse> with checkoutUrl and qrCode.
 */
export async function createBundleOrder(bundleId) {
  return request(`/api/payments/bundles/${bundleId}/orders`, {
    method: 'POST',
    errorMessage: 'Không thể tạo đơn hàng mua gói nạp',
  })
}

export async function getMyOrders({ signal } = {}) {
  return request('/api/payments/orders/me', {
    signal,
    errorMessage: 'Không thể tải lịch sử đơn hàng',
  })
}

export async function getOrderDetail(orderId, { signal } = {}) {
  return request(`/api/payments/orders/${orderId}`, {
    signal,
    errorMessage: 'Không thể tải chi tiết đơn hàng',
  })
}

export async function cancelOrder(orderId) {
  return request(`/api/payments/orders/${orderId}/cancel`, {
    method: 'PUT',
    errorMessage: 'Không thể hủy đơn hàng',
  })
}

export async function syncOrder(orderId) {
  return request(`/api/payments/orders/${orderId}/sync`, {
    method: 'POST',
    errorMessage: 'Không thể đồng bộ trạng thái đơn hàng',
  })
}
