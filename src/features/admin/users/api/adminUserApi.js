import { gatewayRequest } from '@/shared/api/gatewayClient'

const resultOf = payload => {
  if (payload?.result === undefined) throw new Error('The server returned an invalid response.')
  return payload.result
}

export const fetchAdminUsers = ({ keyword = '', banned = '', page = 0, signal } = {}) => {
  const query = new URLSearchParams({ keyword, page: String(page), size: '20' })
  if (banned !== '') query.set('banned', banned)
  return gatewayRequest(`/api/admin/users?${query}`, { signal }).then(resultOf)
}

export const fetchAdminUser = (accountId, signal) => gatewayRequest(`/api/admin/users/${accountId}`, { signal }).then(resultOf)

export const fetchBanHistory = (accountId, page, signal) => gatewayRequest(
  `/api/admin/users/${accountId}/bans?page=${page}&size=20`, { signal },
).then(resultOf)

export const banUser = (accountId, body) => gatewayRequest(`/api/admin/users/${accountId}/ban`, { method: 'POST', body }).then(resultOf)
export const unbanUser = (accountId, body) => gatewayRequest(`/api/admin/users/${accountId}/unban`, { method: 'POST', body }).then(resultOf)
