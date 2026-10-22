import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import * as walletService from '../services/walletService'

export function useWalletTransactions() {
  const { status } = useAuth()
  const isAuth = status === 'authenticated'

  const [transactions, setTransactions] = useState([])
  const [page, setPage] = useState(0)
  const [pageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(isAuth)
  const [error, setError] = useState(null)
  const [reloadTrigger, setReloadTrigger] = useState(0)
  const [currencyFilter, setCurrencyFilter] = useState('ALL') // 'ALL' | 'VIP_COIN' | 'COIN' | 'CHIP'

  const loadTransactions = useCallback(async (signal) => {
    if (!isAuth) {
      setTransactions([])
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    try {
      const res = await walletService.getMyTransactions({ page, size: pageSize, signal })
      if (res?.data) {
        setTransactions(res.data.content || [])
        setTotalPages(res.data.totalPages || 1)
        setTotalElements(res.data.totalElements || 0)
        setError(null)
      }
    } catch (err) {
      if (err?.name !== 'AbortError') {
        setError(err.message || 'Không thể tải lịch sử giao dịch')
      }
    } finally {
      setLoading(false)
    }
  }, [isAuth, page, pageSize])

  useEffect(() => {
    const controller = new AbortController()
    void loadTransactions(controller.signal)
    return () => {
      controller.abort()
    }
  }, [loadTransactions, reloadTrigger])

  const filteredTransactions = transactions.filter(tx => {
    if (currencyFilter === 'ALL') return true
    return tx.currencyType === currencyFilter
  })

  return {
    transactions: filteredTransactions,
    rawTransactions: transactions,
    page,
    setPage,
    totalPages,
    totalElements,
    loading,
    error,
    currencyFilter,
    setCurrencyFilter,
    refresh: () => setReloadTrigger(v => v + 1),
  }
}
