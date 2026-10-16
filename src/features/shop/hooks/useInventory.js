import { useState, useEffect, useMemo } from 'react'
import * as inventoryService from '../services/inventoryService'

export function useInventory() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionInProgressId, setActionInProgressId] = useState(null)
  const [reloadTrigger, setReloadTrigger] = useState(0)

  useEffect(() => {
    let disposed = false
    async function load() {
      try {
        const res = await inventoryService.getMyInventory()
        if (!disposed && res?.data) {
          setItems(res.data)
          setLoading(false)
          setError(null)
        }
      } catch (err) {
        if (!disposed) {
          console.warn('Failed to fetch inventory:', err)
          setError(err.message || 'Không thể tải túi đồ')
          setLoading(false)
        }
      }
    }

    void load()

    const handleAccountChange = () => {
      setReloadTrigger(v => v + 1)
    }
    window.addEventListener('dev_user_changed', handleAccountChange)

    return () => {
      disposed = true
      window.removeEventListener('dev_user_changed', handleAccountChange)
    }
  }, [reloadTrigger])

  // Fast set lookup for owned products
  const ownedProductIds = useMemo(() => {
    const set = new Set()
    items.forEach(item => {
      if (item.productId) set.add(item.productId)
    })
    return set
  }, [items])

  // Optimistic Equip
  const equip = async inventoryItemId => {
    if (actionInProgressId) return
    setActionInProgressId(inventoryItemId)

    const previousItems = [...items]
    const targetItem = items.find(i => i.id === inventoryItemId)
    if (!targetItem) {
      setActionInProgressId(null)
      return
    }

    setItems(prev =>
      prev.map(item => {
        if (item.categoryCode === targetItem.categoryCode) {
          return { ...item, isEquipped: item.id === inventoryItemId }
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

  // Optimistic Unequip
  const unequip = async inventoryItemId => {
    if (actionInProgressId) return
    setActionInProgressId(inventoryItemId)

    const previousItems = [...items]
    const targetItem = items.find(i => i.id === inventoryItemId)
    if (!targetItem) {
      setActionInProgressId(null)
      return
    }

    setItems(prev =>
      prev.map(item => (item.id === inventoryItemId ? { ...item, isEquipped: false } : item))
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
    loading,
    error,
    actionInProgressId,
    equipItem: equip,
    unequipItem: unequip,
    refreshInventory: () => setReloadTrigger(v => v + 1),
  }
}
