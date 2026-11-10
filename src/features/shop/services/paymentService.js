import { gatewayRequest } from '@/shared/api/gatewayClient'

/**
 * Raw HTTP Service for VIP Coin Bundles & PayOS Payment Orders
 */

export async function getCoinBundles({ signal } = {}) {
  return gatewayRequest('/api/shop/bundles', {
    signal,
    auth: false,
    errorMessage: 'Không thể tải danh sách gói nạp',
  })
}

/**
 * Creates PayOS payment order for a VIP Coin bundle
 * Server returns ApiResponse<OrderResponse> with checkoutUrl and qrCode.
 */
export async function createBundleOrder(bundleId) {
  return gatewayRequest(`/api/payments/bundles/${bundleId}/orders`, {
    method: 'POST',
    errorMessage: 'Không thể tạo đơn hàng mua gói nạp',
  })
}

export async function getMyOrders({ signal } = {}) {
  return gatewayRequest('/api/payments/orders/me', {
    signal,
    errorMessage: 'Không thể tải lịch sử đơn hàng',
  })
}

export async function getPendingOrder({ signal } = {}) {
  return gatewayRequest('/api/payments/orders/pending', {
    signal,
    errorMessage: 'Không thể kiểm tra đơn hàng đang chờ',
  })
}

export async function getOrderDetail(orderId, { signal } = {}) {
  return gatewayRequest(`/api/payments/orders/${orderId}`, {
    signal,
    errorMessage: 'Không thể tải chi tiết đơn hàng',
  })
}

export async function cancelOrder(orderId) {
  return gatewayRequest(`/api/payments/orders/${orderId}/cancel`, {
    method: 'PUT',
    errorMessage: 'Không thể hủy đơn hàng',
  })
}

export async function syncOrder(orderId) {
  return gatewayRequest(`/api/payments/orders/${orderId}/sync`, {
    method: 'POST',
    errorMessage: 'Không thể đồng bộ trạng thái đơn hàng',
  })
}
