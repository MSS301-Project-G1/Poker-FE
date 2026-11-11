export function isPaymentComplete(order) {
  return order?.status === 'PAID' && order.fulfillmentStatus === 'FULFILLED'
}

export function shouldPollOrder(order) {
  return order?.status === 'PENDING' || (order?.status === 'PAID'
    && !['FULFILLED', 'REVIEW_REQUIRED'].includes(order.fulfillmentStatus))
}

export function needsOrderAttention(order) {
  return order?.status === 'PENDING' || (order?.status === 'PAID' && !isPaymentComplete(order))
}

export function canPayOrder(order, now = Date.now()) {
  return order?.status === 'PENDING' && Date.parse(order.expiresAt) > now
}

export function paymentPresentation(order, now = Date.now()) {
  if (!order) return { title: 'Checking payment', description: 'Confirming this order with the server.', icon: 'sync', tone: 'pending' }
  if (isPaymentComplete(order)) return { title: 'Payment complete', description: 'Your payment and delivery are confirmed. Refresh your wallet or inventory to see the result.', icon: 'check_circle', tone: 'success' }
  if (order.status === 'PAID') {
    if (order.fulfillmentStatus === 'REVIEW_REQUIRED') return { title: 'Payment needs review', description: 'Payment was received, but delivery needs support review. Keep your order number and contact support. Do not pay this order again.', icon: 'support_agent', tone: 'pending' }
    return { title: 'Payment received', description: 'Your payment is confirmed. VIP Coin or item delivery is still processing. You do not need to pay again.', icon: 'pending_actions', tone: 'pending' }
  }
  if (order.status === 'CANCELLED') return { title: 'Payment cancelled', description: 'The server confirmed this payment was cancelled.', icon: 'cancel', tone: 'error' }
  if (order.status === 'EXPIRED') return { title: 'Payment expired', description: 'The server confirmed this payment expired.', icon: 'hourglass_disabled', tone: 'error' }
  if (canPayOrder(order, now)) return { title: 'Awaiting payment', description: 'Complete payment using the QR code or checkout link for this order.', icon: 'qr_code_2', tone: 'pending' }
  return { title: 'Confirming payment status', description: 'The payment window has ended. We are checking the final status; do not pay this order again.', icon: 'sync', tone: 'pending' }
}

// This stores only an order reference, never credentials or a payment result.
export function rememberPaymentOrder(order) {
  if (!order?.id || !order.accountId) return
  try {
    sessionStorage.setItem(`poker.payment.order.${order.accountId}`, order.id)
  } catch { /* Checkout can still work when browser storage is unavailable. */ }
}

export function recalledPaymentOrderId(accountId) {
  if (!accountId) return null
  try { return sessionStorage.getItem(`poker.payment.order.${accountId}`) } catch { return null }
}
