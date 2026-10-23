import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/features/auth'
import * as inventoryService from '../services/inventoryService'

export function useInventory() {
  const { status } = useAuth()
  const isAuth = status === 'authenticated'

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(isAuth)
  const [error, setError] = useState(null)
  const [actionInProgressId, setActionInProgressId] = useState(null)
  const [reloadTrigger, setReloadTrigger] = useState(0)

  useEffect(() => {
    let disposed = false

    if (!isAuth) {
      setItems([])
      setLoading(false)
      setError(null)
      return
    }

    async function load() {
      try {
        setLoading(true)
        const res = await inventoryService.getMyInventory()
        if (!disposed && res?.data) {
          setItems(res.data)
          setLoading(false)
          setError(null)
        }
      } catch (err) {
        if (!disposed) {
          setItems([])
          setError(err.status === 401 ? 'UNAUTHORIZED' : (err.message || 'Không thể tải túi đồ'))
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      disposed = true
    }
  }, [isAuth, reloadTrigger])

  // Fast set lookup for owned products
  const ownedProductIds = useMemo(() => {
    const set = new Set()
    items.forEach(item => {
      if (item.productId) set.add(item.productId)
    })
    return set
  }, [items])

  // Fast set lookup for equipped products
  const equippedProductIds = useMemo(() => {
    const set = new Set()
    items.forEach(item => {
      if ((item.isEquipped || item.equipped) && item.productId) {
        set.add(item.productId)
      }
    })
    return set
  }, [items])

  const isProductEquipped = (productId) => equippedProductIds.has(productId)

  // Optimistic Equip: supports either inventoryItem.id OR product.id
  const equip = async idOrProductId => {
    if (actionInProgressId) return
    setActionInProgressId(idOrProductId)

    const previousItems = [...items]
    const targetItem = items.find(i => i.id === idOrProductId || i.productId === idOrProductId)
    if (!targetItem) {
      setActionInProgressId(null)
      return
    }

    setItems(prev =>
      prev.map(item => {
        if (item.categoryCode === targetItem.categoryCode) {
          const matched = item.id === targetItem.id
          return { ...item, isEquipped: matched, equipped: matched }
        }
        return item
      })
    )

    try {
      await inventoryService.equipItem(targetItem.productId)
    } catch (err) {
      console.error('Equip failed, rolling back:', err)
      setItems(previousItems)
      throw err
    } finally {
      setActionInProgressId(null)
    }
  }

  // Optimistic Unequip: supports either inventoryItem.id OR product.id
  const unequip = async idOrProductId => {
    if (actionInProgressId) return
    setActionInProgressId(idOrProductId)

    const previousItems = [...items]
    const targetItem = items.find(i => i.id === idOrProductId || i.productId === idOrProductId)
    if (!targetItem) {
      setActionInProgressId(null)
      return
    }

    setItems(prev =>
      prev.map(item =>
        item.id === targetItem.id
          ? { ...item, isEquipped: false, equipped: false }
          : item
      )
    )

    try {
      await inventoryService.unequipItem(targetItem.productId)
    } catch (err) {
      console.error('Unequip failed, rolling back:', err)
      setItems(previousItems)
      throw err
    } finally {
      setActionInProgressId(null)
    }
  }

  return {
    items,
    ownedProductIds,
    equippedProductIds,
    isProductEquipped,
    loading,
    error,
    actionInProgressId,
    equipItem: equip,
    unequipItem: unequip,
    refreshInventory: () => setReloadTrigger(v => v + 1),
  }
}
