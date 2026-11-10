import { gatewayRequest } from '@/shared/api/gatewayClient'

/**
 * Raw HTTP Service for VIP Coin Bundles & PayOS Payment Orders
 */

export async function getCoinBundles({ signal } = {}) {
  return gatewayRequest('/api/shop/bundles', {
    signal,
    auth: false,
    errorMessage: 'Couldn’t load coin packs',
  })
}

/**
 * Creates PayOS payment order for a VIP Coin bundle
 * Server returns ApiResponse<OrderResponse> with checkoutUrl and qrCode.
 */
export async function createBundleOrder(bundleId) {
  return gatewayRequest(`/api/payments/bundles/${bundleId}/orders`, {
    method: 'POST',
    errorMessage: 'Couldn’t create the pack order',
  })
}

export async function getMyOrders({ signal } = {}) {
  return gatewayRequest('/api/payments/orders/me', {
    signal,
    errorMessage: 'Couldn’t load order history',
  })
}

export async function getPendingOrder({ signal } = {}) {
  return gatewayRequest('/api/payments/orders/pending', {
    signal,
    errorMessage: 'Couldn’t check pending orders',
  })
}

export async function getOrderDetail(orderId, { signal } = {}) {
  return gatewayRequest(`/api/payments/orders/${orderId}`, {
    signal,
    errorMessage: 'Couldn’t load order details',
  })
}

export async function cancelOrder(orderId) {
  return gatewayRequest(`/api/payments/orders/${orderId}/cancel`, {
    method: 'PUT',
    errorMessage: 'Couldn’t cancel the order',
  })
}

export async function syncOrder(orderId) {
  return gatewayRequest(`/api/payments/orders/${orderId}/sync`, {
    method: 'POST',
    errorMessage: 'Couldn’t sync the order status',
  })
}
