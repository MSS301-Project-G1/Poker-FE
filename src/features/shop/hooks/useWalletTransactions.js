import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/features/auth'
import * as walletService from '../services/walletService'

export function useWalletTransactions() {
  const { status } = useAuth()
  const isAuth = status === 'authenticated'

  const [rawTransactions, setRawTransactions] = useState([])
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(5) // default 5 items per page for clear pagination
  const [loading, setLoading] = useState(isAuth)
  const [error, setError] = useState(null)
  const [reloadTrigger, setReloadTrigger] = useState(0)
  const [currencyFilter, setCurrencyFilter] = useState('ALL') // 'ALL' | 'VIP_COIN' | 'COIN' | 'CHIP'

  const loadTransactions = useCallback(async (signal) => {
    if (!isAuth) {
      setRawTransactions([])
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    try {
      // Fetch recent transactions (up to 100) to allow instant filtering and fluid pagination
      const res = await walletService.getMyTransactions({ page: 0, size: 100, signal })
      if (res?.data) {
        setRawTransactions(res.data.content || [])
        setError(null)
      }
    } catch (err) {
      if (err?.name !== 'AbortError') {
        setError(err.message || 'Không thể tải lịch sử giao dịch')
      }
    } finally {
      setLoading(false)
    }
  }, [isAuth])

  useEffect(() => {
    const controller = new AbortController()
    void loadTransactions(controller.signal)
    return () => {
      controller.abort()
    }
  }, [loadTransactions, reloadTrigger])

  // Filter transactions by currency type
  const filteredTransactions = useMemo(() => {
    if (currencyFilter === 'ALL') return rawTransactions
    return rawTransactions.filter(tx => tx.currencyType === currencyFilter)
  }, [rawTransactions, currencyFilter])

  // Calculate pagination metrics
  const totalElements = filteredTransactions.length
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize))
  const safePage = Math.min(page, Math.max(0, totalPages - 1))

  // Paginated slice for current page
  const paginatedTransactions = useMemo(() => {
    const start = safePage * pageSize
    return filteredTransactions.slice(start, start + pageSize)
  }, [filteredTransactions, safePage, pageSize])

  const handleSetCurrencyFilter = useCallback((newFilter) => {
    setCurrencyFilter(newFilter)
    setPage(0)
  }, [])

  const handleSetPageSize = useCallback((newSize) => {
    setPageSize(newSize)
    setPage(0)
  }, [])

  return {
    transactions: paginatedTransactions,
    rawTransactions,
    totalWalletCount: rawTransactions.length,
    page: safePage,
    setPage,
    pageSize,
    setPageSize: handleSetPageSize,
    totalPages,
    totalElements,
    loading,
    error,
    currencyFilter,
    setCurrencyFilter: handleSetCurrencyFilter,
    refresh: () => setReloadTrigger(v => v + 1),
  }
}

