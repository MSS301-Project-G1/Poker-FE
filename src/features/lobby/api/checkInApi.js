import { gatewayRequest } from '@/shared/api/gatewayClient'

function resultOf(payload) {
  if (payload?.result === undefined) throw new Error('The server returned an invalid response.')
  return payload.result
}

export const fetchCheckInCalendar = (month, signal) => {
  const query = new URLSearchParams({ month })
  return gatewayRequest(`/api/checkin/calendar?${query}`, {
    signal, errorMessage: 'Unable to load the check-in calendar',
  }).then(resultOf)
}

export const createCheckIn = () => gatewayRequest('/api/checkin', {
  method: 'POST', errorMessage: 'Unable to check in today',
}).then(resultOf)
