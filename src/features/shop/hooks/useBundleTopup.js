import { useState, useEffect } from 'react'
import * as paymentService from '../services/paymentService'

let cachedBundles = null

export function useBundleTopup() {
  const [bundles, setBundles] = useState(cachedBundles || [])
  const [loading, setLoading] = useState(!cachedBundles)
  const [error, setError] = useState(null)
  const [orderingBundleId, setOrderingBundleId] = useState(null)
  const [orderError, setOrderError] = useState(null)
  const [reloadTrigger, setReloadTrigger] = useState(0)

  useEffect(() => {
    if (cachedBundles && cachedBundles.length > 0) return

    let disposed = false
    async function load() {
      try {
        const res = await paymentService.getCoinBundles()
        if (!disposed && res?.data) {
          cachedBundles = res.data
          setBundles(res.data)
          setLoading(false)
        }
      } catch (err) {
        if (!disposed) {
          console.error('Failed to load coin bundles:', err)
          setError(err.message || 'Không thể tải danh sách gói nạp')
          setLoading(false)
        }
      }
    }

    void load()
    return () => {
      disposed = true
    }
  }, [reloadTrigger])

  // Riot Games-style: Create order and direct redirect to PayOS checkoutUrl
  const purchaseBundle = async bundleId => {
    if (orderingBundleId) return

    setOrderingBundleId(bundleId)
    setOrderError(null)

    try {
      const res = await paymentService.createBundleOrder(bundleId)
      const checkoutUrl = res?.data?.checkoutUrl

      if (checkoutUrl) {
        window.location.href = checkoutUrl
      } else {
        throw new Error('Không nhận được liên kết thanh toán từ PayOS')
      }
    } catch (err) {
      console.error('Failed to create bundle order:', err)
      setOrderError(err.message || 'Tạo đơn hàng thanh toán thất bại')
      setOrderingBundleId(null)
      throw err
    }
  }

  return {
    bundles,
    loading,
    error,
    orderingBundleId,
    orderError,
    purchaseBundle,
    refreshBundles: () => setReloadTrigger(v => v + 1),
  }
}
