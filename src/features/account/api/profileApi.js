import { gatewayRequest } from '@/shared/api/gatewayClient'
import { uploadPresignedFile } from '@/shared/api/presignedUpload'

function resultOf(payload) {
  if (payload?.result === undefined) throw new Error('The server returned an invalid response.')
  return payload.result
}

export const fetchMyProfile = signal => gatewayRequest('/api/profiles/me', {
  signal, errorMessage: 'Unable to load your profile',
}).then(resultOf)

export const updateMyProfile = body => gatewayRequest('/api/profiles/me', {
  method: 'PUT', body, errorMessage: 'Unable to update your profile',
}).then(resultOf)

export const fetchProfilesByIds = (ids, signal) => {
  const query = new URLSearchParams({ ids: ids.join(',') })
  return gatewayRequest(`/api/profiles/batch?${query}`, {
    signal, errorMessage: 'Unable to load player profiles',
  }).then(resultOf)
}

export const fetchAvatarPresets = signal => gatewayRequest('/api/profiles/avatars', {
  signal, errorMessage: 'Unable to load avatars',
}).then(resultOf)

export const selectAvatarPreset = avatarId => gatewayRequest('/api/profiles/me/avatar', {
  method: 'PUT', body: { avatarId }, errorMessage: 'Unable to select this avatar',
}).then(resultOf)

export const presignMyAvatar = file => {
  const query = new URLSearchParams({
    fileName: file.name,
    contentType: file.type,
    fileSize: String(file.size),
  })
  return gatewayRequest(`/api/profiles/me/avatar/presign?${query}`, {
    errorMessage: 'Unable to prepare the image upload',
  }).then(resultOf)
}

export const confirmMyAvatar = key => gatewayRequest('/api/profiles/me/avatar', {
  method: 'POST', body: { key }, errorMessage: 'Unable to save the uploaded avatar',
}).then(resultOf)

export async function uploadMyAvatar(file) {
  const presign = await presignMyAvatar(file)
  await uploadPresignedFile(file, presign)
  return confirmMyAvatar(presign.key)
}
