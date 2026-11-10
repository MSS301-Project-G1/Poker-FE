import { useState, useEffect, useCallback } from 'react'
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
          const list = Array.isArray(res.data) ? res.data : []
          const sorted = [...list].sort((a, b) => (Number(a.priceVnd) || 0) - (Number(b.priceVnd) || 0))
          cachedBundles = sorted
          setBundles(sorted)
          setLoading(false)
        }
      } catch (err) {
        if (!disposed) {
          console.error('Failed to load coin bundles:', err)
          setError(err.message || 'Couldn’t load coin packs')
          setLoading(false)
        }
      }
    }

    void load()
    return () => {
      disposed = true
    }
  }, [reloadTrigger])

  const clearOrderingState = useCallback(() => {
    setOrderingBundleId(null)
    setOrderError(null)
  }, [])

  const refreshBundles = useCallback(() => {
    setReloadTrigger(v => v + 1)
  }, [])

  // Reset ordering state if user navigated back via browser history (BFCache) or tab focused
  useEffect(() => {
    window.addEventListener('pageshow', clearOrderingState)
    window.addEventListener('focus', clearOrderingState)
    return () => {
      window.removeEventListener('pageshow', clearOrderingState)
      window.removeEventListener('focus', clearOrderingState)
    }
  }, [clearOrderingState])

  // Riot Games-style: Create order and direct redirect to PayOS checkoutUrl
  const purchaseBundle = useCallback(async bundleId => {
    setOrderingBundleId(bundleId)
    setOrderError(null)

    try {
      const res = await paymentService.createBundleOrder(bundleId)
      const checkoutUrl = res?.data?.checkoutUrl

      if (checkoutUrl) {
        window.location.href = checkoutUrl
      } else {
        throw new Error('PayOS didn’t return a payment link')
      }
    } catch (err) {
      console.error('Failed to create bundle order:', err)
      setOrderError(err.message || 'Couldn’t create the order')
      setOrderingBundleId(null)
      throw err
    }
  }, [])

  return {
    bundles,
    loading,
    error,
    orderingBundleId,
    orderError,
    purchaseBundle,
    clearOrderingState,
    refreshBundles,
  }
}


