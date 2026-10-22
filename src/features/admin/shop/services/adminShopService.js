import { gatewayRequest } from '@/shared/api/gatewayClient'

/**
 * Raw HTTP Service for Admin Shop Management
 * Handles Products, Categories, 53-Card Deck Skin ZIP Ingestion, and VIP Coin Bundles.
 */

export async function getAdminProducts({ category, tier, page = 0, size = 50, signal } = {}) {
  const params = new URLSearchParams()
  if (category && category !== 'ALL') params.append('category', category)
  if (tier && tier !== 'ALL') params.append('tier', tier)
  params.append('page', String(page))
  params.append('size', String(size))

  return gatewayRequest(`/api/shop/products?${params.toString()}`, {
    signal,
    auth: false,
    errorMessage: 'Không thể tải danh sách sản phẩm',
  })
}

export async function createProduct(payload) {
  return gatewayRequest('/api/admin/products', {
    method: 'POST',
    body: payload,
    errorMessage: 'Không thể tạo sản phẩm mới',
  })
}

export async function updateProduct(id, payload) {
  return gatewayRequest(`/api/admin/products/${id}`, {
    method: 'PUT',
    body: payload,
    errorMessage: 'Không thể cập nhật sản phẩm',
  })
}

export async function deleteProduct(id) {
  return gatewayRequest(`/api/admin/products/${id}`, {
    method: 'DELETE',
    errorMessage: 'Không thể xóa sản phẩm',
  })
}

/**
 * Upload 53-card deck ZIP file to MinIO / S3 via Admin API
 */
export async function uploadDeckSkinZip(productId, file) {
  const formData = new FormData()
  formData.append('file', file)

  return gatewayRequest(`/api/admin/products/${productId}/deck-skin/upload-zip`, {
    method: 'POST',
    body: formData,
    errorMessage: 'Tải lên file ZIP thất bại',
  })
}

/**
 * Upload multiple individual card images to MinIO / S3 via Admin API
 */
export async function uploadDeckSkinFiles(productId, files) {
  const formData = new FormData()
  Array.from(files).forEach(file => {
    formData.append('files', file)
  })

  return gatewayRequest(`/api/admin/products/${productId}/deck-skin/upload-files`, {
    method: 'POST',
    body: formData,
    errorMessage: 'Tải lên danh sách ảnh skin thất bại',
  })
}

export async function getCategories({ signal } = {}) {
  return gatewayRequest('/api/shop/categories', {
    signal,
    auth: false,
    errorMessage: 'Không thể tải danh mục sản phẩm',
  })
}

export async function getAdminBundles({ signal } = {}) {
  return gatewayRequest('/api/admin/bundles', {
    signal,
    errorMessage: 'Không thể tải danh sách gói nạp',
  })
}

export async function createBundle(payload) {
  return gatewayRequest('/api/admin/bundles', {
    method: 'POST',
    body: payload,
    errorMessage: 'Không thể tạo gói nạp mới',
  })
}

export async function updateBundle(id, payload) {
  return gatewayRequest(`/api/admin/bundles/${id}`, {
    method: 'PUT',
    body: payload,
    errorMessage: 'Không thể cập nhật gói nạp',
  })
}

export async function toggleBundleActive(id, isActive) {
  return gatewayRequest(`/api/admin/bundles/${id}/active?isActive=${isActive}`, {
    method: 'PATCH',
    errorMessage: 'Không thể thay đổi trạng thái mở bán gói nạp',
  })
}
