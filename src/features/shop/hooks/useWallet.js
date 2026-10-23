import { useState, useEffect } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import * as walletService from '../services/walletService'

export function useWallet() {
  const { status } = useAuth()
  const isAuth = status === 'authenticated'

  const [wallet, setWallet] = useState(null)
  const [loading, setLoading] = useState(isAuth)
  const [error, setError] = useState(null)
  const [reloadTrigger, setReloadTrigger] = useState(0)

  useEffect(() => {
    let disposed = false

    if (!isAuth) {
      setWallet(null)
      setLoading(false)
      setError(null)
      return
    }

    async function load() {
      try {
        setLoading(true)
        const res = await walletService.getMyWallet()
        if (!disposed && res?.data) {
          setWallet(res.data)
          setLoading(false)
          setError(null)
        }
      } catch (err) {
        if (!disposed) {
          setWallet(null)
          setError(err.status === 401 ? 'UNAUTHORIZED' : (err.message || 'Chưa đăng nhập'))
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      disposed = true
    }
  }, [isAuth, reloadTrigger])

  return {
    wallet,
    isLoggedIn: isAuth,
    vipCoin: wallet?.vipCoinBalance ?? wallet?.vipCoin ?? (isAuth ? 0 : null),
    coin: wallet?.coinBalance ?? wallet?.balance ?? wallet?.coin ?? (isAuth ? 0 : null),
    loading,
    error,
    refreshWallet: () => setReloadTrigger(v => v + 1),
  }
}
