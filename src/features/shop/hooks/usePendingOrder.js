import { useState, useEffect, useCallback, useRef } from 'react'
import * as paymentService from '../services/paymentService'
import { useAuth } from '@/features/auth'

export function usePendingOrder({ pollInterval = 0 } = {}) {
  const { status } = useAuth()
  const isAuth = status === 'authenticated'

  const [pendingOrder, setPendingOrder] = useState(null)
  const [loading, setLoading] = useState(isAuth)
  const [actionInProgress, setActionInProgress] = useState(false)

  const pendingOrderRef = useRef(null)
  pendingOrderRef.current = pendingOrder

  const checkPendingOrder = useCallback(async () => {
    if (!isAuth) {
      setPendingOrder(null)
      setLoading(false)
      return null
    }
    try {
      const res = await paymentService.getPendingOrder()
      const order = res?.data
      if (order && order.status === 'PENDING') {
        const expiresAt = new Date(order.expiresAt).getTime()
        if (expiresAt > Date.now()) {
          setPendingOrder(order)
          return order
        }
      }
      setPendingOrder(null)
      return null
    } catch {
      setPendingOrder(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [isAuth])

  useEffect(() => {
    void checkPendingOrder()
  }, [checkPendingOrder])

  // Optional background polling if enabled
  useEffect(() => {
    if (!pollInterval || !pendingOrder || !isAuth) return
    const intervalId = setInterval(() => {
      void checkPendingOrder()
    }, pollInterval)
    return () => clearInterval(intervalId)
  }, [pollInterval, pendingOrder, isAuth, checkPendingOrder])

  const cancelPendingOrder = useCallback(async (explicitOrderId) => {
    const targetId = explicitOrderId || pendingOrderRef.current?.id
    if (!targetId) return null
    setActionInProgress(true)
    try {
      const res = await paymentService.cancelOrder(targetId)
      setPendingOrder(null)
      return res?.data
    } finally {
      setActionInProgress(false)
    }
  }, [])

  const syncPendingOrder = useCallback(async (explicitOrderId) => {
    const targetId = explicitOrderId || pendingOrderRef.current?.id
    if (!targetId) return null
    setActionInProgress(true)
    try {
      const res = await paymentService.syncOrder(targetId)
      const updated = res?.data
      if (updated?.status !== 'PENDING') {
        setPendingOrder(null)
      } else {
        setPendingOrder(updated)
      }
      return updated
    } finally {
      setActionInProgress(false)
    }
  }, [])


  return {
    pendingOrder,
    loading,
    actionInProgress,
    checkPendingOrder,
    cancelPendingOrder,
    syncPendingOrder,
    setPendingOrder,
  }
}
