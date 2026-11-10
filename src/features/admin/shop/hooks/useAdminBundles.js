import { useState, useEffect, useCallback } from 'react'
import * as adminService from '../services/adminShopService'

export function useAdminBundles() {
  const [bundles, setBundles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadTrigger, setReloadTrigger] = useState(0)

  useEffect(() => {
    let disposed = false
    async function load() {
      try {
        const res = await adminService.getAdminBundles()
        if (!disposed) {
          const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
          const sorted = [...list].sort((a, b) => (Number(a.priceVnd) || 0) - (Number(b.priceVnd) || 0))
          setBundles(sorted)
          setError(null)
        }
      } catch (err) {
        if (!disposed) {
          console.error('Failed to load admin bundles:', err)
          setError(err.message || 'Couldn’t load coin packs')
        }
      } finally {
        if (!disposed) {
          setLoading(false)
        }
      }
    }
    void load()
    return () => {
      disposed = true
    }
  }, [reloadTrigger])

  const refresh = useCallback(() => {
    setReloadTrigger(v => v + 1)
  }, [])

  return {
    bundles,
    loading,
    error,
    refreshBundles: refresh,
    createBundle: adminService.createBundle,
    updateBundle: adminService.updateBundle,
    deleteBundle: adminService.deleteBundle,
    toggleBundleActive: adminService.toggleBundleActive,
  }
}
