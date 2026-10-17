import { request } from '@/shared/api/httpClient'

/**
 * Raw HTTP Service for User Wallet & Transactions
 */

export async function getMyWallet({ signal } = {}) {
  return request('/api/wallet/me', {
    signal,
    errorMessage: 'Không thể tải thông tin ví',
  })
}

export async function getMyTransactions({ page = 0, size = 20, signal } = {}) {
  return request(`/api/wallet/me/transactions?page=${page}&size=${size}`, {
    signal,
    errorMessage: 'Không thể tải lịch sử giao dịch ví',
  })
}
