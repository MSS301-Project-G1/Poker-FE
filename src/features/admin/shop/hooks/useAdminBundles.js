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
          setBundles(Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []))
          setError(null)
        }
      } catch (err) {
        if (!disposed) {
          console.error('Failed to load admin bundles:', err)
          setError(err.message || 'Không thể tải danh sách gói nạp')
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
    toggleBundleActive: adminService.toggleBundleActive,
  }
}
