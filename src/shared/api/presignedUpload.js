import { ApiError } from './httpClient'

export const allowedAvatarTypes = new Set(['image/png', 'image/jpeg'])
export const maxAvatarBytes = 2 * 1024 * 1024

export function avatarFileError(file) {
  if (!file) return 'Choose an image to upload.'
  if (!allowedAvatarTypes.has(file.type)) return 'Choose a PNG or JPEG image.'
  if (file.size <= 0 || file.size > maxAvatarBytes) return 'The image must be no larger than 2 MB.'
  return ''
}

export async function uploadPresignedFile(file, presign) {
  const response = await fetch(presign.uploadUrl, {
    method: presign.method,
    credentials: 'omit',
    headers: presign.headers,
    body: file,
  })
  if (!response.ok) {
    throw new ApiError(`Image upload failed (${response.status}).`, { status: response.status })
  }
}
