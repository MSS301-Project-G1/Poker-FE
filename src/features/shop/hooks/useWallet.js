import { useState, useEffect } from 'react'
import * as walletService from '../services/walletService'

export function useWallet() {
  const [wallet, setWallet] = useState({ vipCoin: 0, coin: 0, status: 'ACTIVE' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadTrigger, setReloadTrigger] = useState(0)

  useEffect(() => {
    let disposed = false
    async function load() {
      try {
        const res = await walletService.getMyWallet()
        if (!disposed && res?.data) {
          setWallet(res.data)
          setLoading(false)
          setError(null)
        }
      } catch (err) {
        if (!disposed) {
          console.warn('Failed to fetch wallet info:', err)
          setError(err.message || 'Không thể lấy thông tin ví')
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

  return {
    wallet,
    vipCoin: wallet?.vipCoin ?? 0,
    coin: wallet?.coin ?? 0,
    loading,
    error,
    refreshWallet: () => setReloadTrigger(v => v + 1),
  }
}
