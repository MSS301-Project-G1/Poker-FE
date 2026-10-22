import { gatewayRequest } from '@/shared/api/gatewayClient'

/**
 * Raw HTTP Service for User Wallet & Transactions
 */

export async function getMyWallet({ signal } = {}) {
  return gatewayRequest('/api/wallet/me', {
    signal,
    errorMessage: 'Không thể tải thông tin ví',
  })
}

export async function getMyTransactions({ page = 0, size = 20, signal } = {}) {
  return gatewayRequest(`/api/wallet/me/transactions?page=${page}&size=${size}`, {
    signal,
    errorMessage: 'Không thể tải lịch sử giao dịch ví',
  })
}
