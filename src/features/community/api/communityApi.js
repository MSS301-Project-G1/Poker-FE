import { gatewayRequest } from '@/shared/api/gatewayClient'

const call = (path, options) => gatewayRequest(path, options)
export const communityApi = {
  socketToken: () => call('/api/auth/ws-token').then(payload => {
    if (!payload?.result?.accessToken) throw new Error('Không lấy được token WebSocket.')
    return payload.result
  }),
  party: signal => call('/api/party/me', { signal }),
  createParty: () => call('/api/party/create', { method: 'POST' }),
  joinParty: partyCode => call('/api/party/join', { method: 'POST', body: { partyCode } }),
  invite: inviteeId => call('/api/party/invite', { method: 'POST', body: { inviteeId } }),
  kick: accountId => call('/api/party/kick', { method: 'POST', body: { accountId } }),
  leaveParty: () => call('/api/party/leave', { method: 'DELETE' }),
  friends: (page, signal) => call(`/api/friends?page=${page}&size=20`, { signal }),
  requests: (direction, page, signal) => call(`/api/friends/requests?direction=${direction}&page=${page}&size=20`, { signal }),
  blocks: (page, signal) => call(`/api/blocks?page=${page}&size=20`, { signal }),
  addFriend: addresseeId => call('/api/friends/requests', { method: 'POST', body: { addresseeId } }),
  respond: (id, action) => call(`/api/friends/requests/${id}/${action}`, { method: 'POST' }),
  cancel: id => call(`/api/friends/requests/${id}`, { method: 'DELETE' }),
  removeFriend: id => call(`/api/friends/${id}`, { method: 'DELETE' }),
  block: id => call(`/api/blocks/${id}`, { method: 'POST' }),
  unblock: id => call(`/api/blocks/${id}`, { method: 'DELETE' }),
  conversations: (page, signal) => call(`/api/chat/conversations?page=${page}&size=20`, { signal }),
  conversation: (id, signal) => call(`/api/chat/conversations/${id}`, { signal }),
  direct: accountId => call('/api/chat/conversations/direct', { method: 'POST', body: { accountId } }),
  history: (id, cursor, signal) => call(`/api/chat/conversations/${id}/messages?limit=20${cursor ? `&before=${encodeURIComponent(cursor)}` : ''}`, { signal }),
  send: (id, body) => call(`/api/chat/conversations/${id}/messages`, { method: 'POST', body }),
}
