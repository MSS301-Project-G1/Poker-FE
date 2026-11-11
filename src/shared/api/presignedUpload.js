import { ApiError } from './httpClient'

export const allowedAvatarTypes = new Set(['image/png', 'image/jpeg'])
export const maxAvatarBytes = 2 * 1024 * 1024
export const maxAvatarDimension = 2048
export const avatarFileAccept = '.png,.jpg,.jpeg,image/png,image/jpeg'

function avatarContentType(file) {
  const type = (file.type || '').trim().toLowerCase()
  return type === 'image/jpg' || type === 'image/pjpeg' ? 'image/jpeg' : type
}

export function avatarFileError(file) {
  if (!file) return 'Choose an image to upload.'
  if (file.size <= 0) return 'The image file is empty. Choose another PNG or JPG image.'
  if (file.size > maxAvatarBytes) return 'The image must be no larger than 2 MB.'
  const type = avatarContentType(file)
  // Some file pickers return an empty type. The actual bytes are checked before requesting a URL.
  if (type && !allowedAvatarTypes.has(type)) return 'Choose a PNG or JPG/JPEG image.'
  return ''
}

async function imageDimensions(file) {
  const url = URL.createObjectURL(file)
  try {
    return await new Promise((resolve, reject) => {
      const image = new Image()
      image.onload = () => {
        if (image.naturalWidth > 0 && image.naturalHeight > 0) {
          resolve({ width: image.naturalWidth, height: image.naturalHeight })
        } else {
          reject(new Error('This image cannot be read. Export it as PNG or JPG and try again.'))
        }
      }
      image.onerror = () => reject(new Error('This image cannot be read. Export it as PNG or JPG and try again.'))
      image.src = url
    })
  } finally { URL.revokeObjectURL(url) }
}

export async function prepareAvatarFile(file) {
  const error = avatarFileError(file)
  if (error) throw new Error(error)
  let bytes
  try { bytes = new Uint8Array(await file.slice(0, 8).arrayBuffer()) } catch {
    throw new Error('Unable to read this image. Choose the file again.')
  }
  const png = [137, 80, 78, 71, 13, 10, 26, 10]
  const detected = png.every((byte, index) => bytes[index] === byte) ? 'image/png'
    : bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 ? 'image/jpeg' : null
  if (!detected) throw new Error('The file is not a valid PNG or JPG image. Changing its filename does not convert the image.')
  const declared = avatarContentType(file)
  if (declared && declared !== detected) {
    throw new Error('The image contents do not match its file type. Export it as PNG or JPG and try again.')
  }
  // Keep the original bytes; only normalize missing/legacy MIME metadata for S3 signing.
  const prepared = file.type === detected ? file : new File([file], file.name, { type: detected, lastModified: file.lastModified })
  const { width, height } = await imageDimensions(prepared)
  if (width > maxAvatarDimension || height > maxAvatarDimension) {
    throw new Error(`The image is ${width} × ${height} px. Each side must be at most ${maxAvatarDimension} px.`)
  }
  return prepared
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
