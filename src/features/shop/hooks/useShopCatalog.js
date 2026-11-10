import { useState, useEffect } from 'react'
import * as productService from '../services/productService'

// In-memory cache for static categories to avoid re-fetching on tab switches
let cachedCategories = null

export function useShopCatalog({ ownedProductIds = new Set(), onPurchaseSuccess } = {}) {
  const [categories, setCategories] = useState(cachedCategories || [])
  const [products, setProducts] = useState([])
  const [activeCategory, setActiveCategory] = useState('ALL')
  const [activeTier, setActiveTier] = useState('ALL')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [reloadTrigger, setReloadTrigger] = useState(0)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)

  // 1. Fetch Categories once
  useEffect(() => {
    if (cachedCategories && cachedCategories.length > 0) return

    let isMounted = true
    productService
      .getCategories()
      .then(res => {
        if (isMounted && res?.data) {
          cachedCategories = res.data
          setCategories(res.data)
        }
      })
      .catch(err => {
        console.error('Failed to load categories:', err)
      })

    return () => {
      isMounted = false
    }
  }, [])

  // 2. Fetch Products with Redis-friendly query params
  useEffect(() => {
    if (activeCategory === 'MY_INVENTORY' || activeCategory === 'MY_WALLET') {
      return
    }

    let disposed = false
    const controller = new AbortController()

    async function load() {
      try {
        const res = await productService.getProducts({
          categoryCode: activeCategory,
          tier: activeTier,
          page,
          size: 20,
          sort: 'createdAt,desc',
          signal: controller.signal,
        })

        if (!disposed) {
          const rawItems = res?.data?.content || []
          setTotalPages(res?.data?.totalPages ?? 1)
          setTotalElements(res?.data?.totalElements ?? 0)

          const hydrated = rawItems.map(item => ({
            ...item,
            isOwned: Boolean(item.isOwned || ownedProductIds.has(item.id)),
          }))

          setProducts(hydrated)
          setSelectedProduct(prev => {
            if (prev) {
              const stillThere = hydrated.find(p => p.id === prev.id)
              if (stillThere) return stillThere
            }
            return hydrated[0] || null
          })
          setLoading(false)
          setError(null)
        }
      } catch (err) {
        if (!disposed && err.name !== 'AbortError') {
          setError(err.message || 'Không thể tải danh sách sản phẩm')
          setLoading(false)
        }
      }
    }

    void load()
    return () => {
      disposed = true
      controller.abort()
    }
  }, [activeCategory, activeTier, page, reloadTrigger, ownedProductIds])

  const handleSelectCategory = (cat) => {
    setActiveCategory(cat)
    setPage(0)
  }

  const handleSelectTier = (tier) => {
    setActiveTier(tier)
    setPage(0)
  }

  // 3. Purchase handler (Anti-bypass: only sends productId)
  const handlePurchase = async product => {
    if (!product || isPurchasing) return

    setIsPurchasing(true)
    try {
      const res = await productService.purchaseProduct(product.id)
      if (onPurchaseSuccess) {
        await onPurchaseSuccess(product)
      }
      setReloadTrigger(v => v + 1)
      return res
    } finally {
      setIsPurchasing(false)
    }
  }

  return {
    categories,
    products,
    page,
    setPage,
    totalPages,
    totalElements,
    activeCategory,
    setActiveCategory: handleSelectCategory,
    activeTier,
    setActiveTier: handleSelectTier,
    selectedProduct,
    setSelectedProduct,
    loading,
    error,
    isPurchasing,
    refreshCatalog: () => setReloadTrigger(v => v + 1),
    purchaseProduct: handlePurchase,
  }
}
