import { useState, useEffect, useCallback } from 'react'
import * as adminService from '../services/adminShopService'

export function useAdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadTrigger, setReloadTrigger] = useState(0)

  useEffect(() => {
    let disposed = false
    async function load() {
      try {
        const [prodRes, catRes] = await Promise.all([
          adminService.getAdminProducts({ page: 0, size: 50 }),
          adminService.getCategories(),
        ])

        if (!disposed) {
          setProducts(prodRes?.data?.content || [])
          setCategories(catRes?.data || [])
          setLoading(false)
          setError(null)
        }
      } catch (err) {
        if (!disposed) {
          console.error('Failed to load admin products:', err)
          setError(err.message || 'Không thể tải dữ liệu quản trị sản phẩm')
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
    products,
    categories,
    loading,
    error,
    refreshProducts: refresh,
    createProduct: adminService.createProduct,
    updateProduct: adminService.updateProduct,
    deleteProduct: adminService.deleteProduct,
    uploadDeckSkinZip: adminService.uploadDeckSkinZip,
  }
}
