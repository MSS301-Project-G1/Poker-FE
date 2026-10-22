import { gatewayRequest, loadCsrf } from '@/shared/api/gatewayClient'

function resultOf(payload) {
  if (payload?.result === undefined) throw new Error('The server returned an invalid response.')
  return payload.result
}

export const initializeAuth = () => loadCsrf()

export const fetchWebSocketToken = () => gatewayRequest('/api/auth/ws-token', {
  errorMessage: 'Unable to authorize the realtime connection',
}).then(resultOf)

export const registerAccount = body => gatewayRequest('/api/auth/register', {
  method: 'POST', body, auth: false, errorMessage: 'Unable to create the account',
}).then(resultOf)

export const verifyRegistrationOtp = body => gatewayRequest('/api/auth/register/verify-otp', {
  method: 'POST', body, auth: false, errorMessage: 'Unable to verify the code',
}).then(resultOf)

export const resendRegistrationOtp = body => gatewayRequest('/api/auth/register/resend-otp', {
  method: 'POST', body, auth: false, errorMessage: 'Unable to resend the code',
}).then(resultOf)

export const loginAccount = body => gatewayRequest('/api/auth/login', {
  method: 'POST', body, auth: false, errorMessage: 'Unable to sign in',
}).then(resultOf)

export const fetchCurrentUser = signal => gatewayRequest('/api/auth/me', {
  signal, errorMessage: 'Unable to load the current account',
}).then(resultOf)

export const logoutAccount = () => gatewayRequest('/api/auth/logout', {
  method: 'POST', auth: false, errorMessage: 'Unable to sign out',
})

export const forgotPassword = body => gatewayRequest('/api/auth/password/forgot', {
  method: 'POST', body, auth: false, errorMessage: 'Unable to request a recovery code',
})

export const resetPassword = body => gatewayRequest('/api/auth/password/reset', {
  method: 'POST', body, auth: false, errorMessage: 'Unable to reset the password',
})

export const changePassword = body => gatewayRequest('/api/auth/password/change', {
  method: 'POST', body, errorMessage: 'Unable to change the password',
})
