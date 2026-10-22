import { gatewayRequest } from '@/shared/api/gatewayClient'
import { uploadPresignedFile } from '@/shared/api/presignedUpload'

function resultOf(payload) {
  if (payload?.result === undefined) throw new Error('The server returned an invalid response.')
  return payload.result
}

export const fetchAdminAvatars = signal => gatewayRequest('/api/admin/avatars', {
  signal, errorMessage: 'Unable to load avatar presets',
}).then(resultOf)

export const presignAdminAvatar = file => {
  const query = new URLSearchParams({
    fileName: file.name,
    contentType: file.type,
    fileSize: String(file.size),
  })
  return gatewayRequest(`/api/admin/avatars/presign?${query}`, {
    errorMessage: 'Unable to prepare the preset upload',
  }).then(resultOf)
}

export const createAdminAvatar = body => gatewayRequest('/api/admin/avatars', {
  method: 'POST', body, errorMessage: 'Unable to create the avatar preset',
}).then(resultOf)

export const updateAdminAvatar = (avatarId, body) => gatewayRequest(`/api/admin/avatars/${avatarId}`, {
  method: 'PUT', body, errorMessage: 'Unable to update the avatar preset',
}).then(resultOf)

export async function uploadAdminAvatar(name, file) {
  const presign = await presignAdminAvatar(file)
  await uploadPresignedFile(file, presign)
  return createAdminAvatar({ name, key: presign.key })
}
