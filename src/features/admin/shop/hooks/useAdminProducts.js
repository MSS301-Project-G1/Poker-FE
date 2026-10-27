import { useState, useEffect, useCallback } from 'react'
import * as adminService from '../services/adminShopService'

export function useAdminProducts({ initialPage = 0, initialSize = 10 } = {}) {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadTrigger, setReloadTrigger] = useState(0)

  // Pagination & Filtering state
  const [page, setPage] = useState(initialPage)
  const [size, setSize] = useState(initialSize)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [selectedTier, setSelectedTier] = useState('ALL')

  useEffect(() => {
    let disposed = false
    async function load() {
      setLoading(true)
      try {
        const [prodRes, catRes] = await Promise.all([
          adminService.getAdminProducts({
            category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
            tier: selectedTier !== 'ALL' ? selectedTier : undefined,
            page,
            size,
          }),
          categories.length > 0 ? Promise.resolve({ data: categories }) : adminService.getCategories(),
        ])

        if (!disposed) {
          const pageData = prodRes?.data
          setProducts(pageData?.content || [])
          setTotalPages(pageData?.totalPages ?? 1)
          setTotalElements(pageData?.totalElements ?? 0)
          if (catRes?.data) {
            setCategories(catRes.data)
          }
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
  }, [page, size, selectedCategory, selectedTier, reloadTrigger])

  const refresh = useCallback(() => {
    setReloadTrigger(v => v + 1)
  }, [])

  const handleCategoryChange = useCallback((cat) => {
    setSelectedCategory(cat)
    setPage(0)
  }, [])

  const handleTierChange = useCallback((tier) => {
    setSelectedTier(tier)
    setPage(0)
  }, [])

  const handleSizeChange = useCallback((newSize) => {
    setSize(newSize)
    setPage(0)
  }, [])

  return {
    products,
    categories,
    loading,
    error,
    page,
    setPage,
    size,
    setSize: handleSizeChange,
    totalPages,
    totalElements,
    selectedCategory,
    setSelectedCategory: handleCategoryChange,
    selectedTier,
    setSelectedTier: handleTierChange,
    refreshProducts: refresh,
    createProduct: adminService.createProduct,
    updateProduct: adminService.updateProduct,
    deleteProduct: adminService.deleteProduct,
    uploadDeckSkinZip: adminService.uploadDeckSkinZip,
    uploadDeckSkinFiles: adminService.uploadDeckSkinFiles,
  }
}

