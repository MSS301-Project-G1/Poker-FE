import { useState, useEffect, useCallback, useRef } from 'react'
import * as paymentService from '../services/paymentService'
import { useAuth } from '@/features/auth'
import { needsOrderAttention, rememberPaymentOrder, recalledPaymentOrderId } from '../utils/paymentStatus'

export function usePendingOrder() {
  const { status, user } = useAuth()
  const accountId = status === 'authenticated' ? user?.accountId : null
  const [pendingOrder, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionInProgress, setActionInProgress] = useState(false)
  const orderRef = useRef(null)
  const checkRef = useRef(null)

  const setPendingOrder = useCallback(order => {
    orderRef.current = order
    setOrder(order)
    rememberPaymentOrder(order)
    setError(null)
    return order
  }, [])

  const checkPendingOrder = useCallback(async () => {
    if (!accountId) return null
    if (checkRef.current?.accountId === accountId) return checkRef.current.promise
    const promise = (async () => {
      try {
        // Keep following the original order after PAID; /pending no longer returns it.
        const trackedId = orderRef.current?.accountId === accountId && needsOrderAttention(orderRef.current)
          ? orderRef.current.id : recalledPaymentOrderId(accountId)
        if (trackedId) {
          try {
            const tracked = (await paymentService.getOrderDetail(trackedId))?.data
            if (needsOrderAttention(tracked)) return setPendingOrder(tracked)
          } catch (err) {
            if (err.status !== 404) throw err
          }
        }
        const active = (await paymentService.getPendingOrder())?.data
        if (active) return setPendingOrder(active)
        // /pending can confirm payment itself. Recover outstanding delivery from history.
        const history = (await paymentService.getMyOrders())?.data
        if (!Array.isArray(history)) throw new Error('The server did not confirm your order history. Try again before paying.')
        const outstanding = history.find(needsOrderAttention)
        return setPendingOrder(outstanding || null)
      } catch (err) {
        setError(err.message || 'Couldn’t confirm the order status. Try again.')
        throw err
      } finally { setLoading(false) }
    })()
    checkRef.current = { accountId, promise }
    try { return await promise } finally {
      if (checkRef.current?.promise === promise) checkRef.current = null
    }
  }, [accountId, setPendingOrder])

  useEffect(() => {
    if (accountId) void checkPendingOrder().catch(() => {})
  }, [accountId, checkPendingOrder])

  const cancelPendingOrder = useCallback(async explicitOrderId => {
    const targetId = explicitOrderId || orderRef.current?.id
    if (!targetId) throw new Error('Select an order before cancelling.')
    setActionInProgress(true)
    try {
      const updated = (await paymentService.cancelOrder(targetId))?.data
      if (!updated?.id) throw new Error('The server did not confirm the order status.')
      return setPendingOrder(updated)
    } finally { setActionInProgress(false) }
  }, [setPendingOrder])

  const syncPendingOrder = useCallback(async explicitOrderId => {
    const targetId = explicitOrderId || orderRef.current?.id
    if (!targetId) throw new Error('Select an order before checking payment.')
    setActionInProgress(true)
    try {
      const updated = (await paymentService.syncOrder(targetId))?.data
      if (!updated?.id) throw new Error('The server did not confirm the order status.')
      return setPendingOrder(updated)
    } finally { setActionInProgress(false) }
  }, [setPendingOrder])

  return {
    pendingOrder: pendingOrder?.accountId === accountId ? pendingOrder : null,
    loading: Boolean(accountId) && loading, error, actionInProgress,
    checkPendingOrder, cancelPendingOrder, syncPendingOrder, setPendingOrder,
  }
}
