import { gatewayRequest } from '@/shared/api/gatewayClient'

/**
 * Raw HTTP Service for Admin Shop Management
 * Handles Products, Categories, 53-Card Deck Skin ZIP Ingestion, and VIP Coin Bundles.
 */

export async function getAdminProducts({ category, tier, status, page = 0, size = 50, signal } = {}) {
  const params = new URLSearchParams()
  if (category && category !== 'ALL') params.append('category', category)
  if (tier && tier !== 'ALL') params.append('tier', tier)
  if (status && status !== 'ALL') params.append('status', status)
  params.append('page', String(page))
  params.append('size', String(size))

  return gatewayRequest(`/api/admin/products?${params.toString()}`, {
    signal,
    errorMessage: 'Couldn’t load products',
  })
}

export async function getProductById(id, { signal } = {}) {
  return gatewayRequest(`/api/shop/products/${id}`, {
    signal,
    auth: false,
    errorMessage: 'Couldn’t load product details',
  })
}

export async function createProduct(payload) {
  return gatewayRequest('/api/admin/products', {
    method: 'POST',
    body: payload,
    errorMessage: 'Couldn’t create the product',
  })
}

export async function updateProduct(id, payload) {
  return gatewayRequest(`/api/admin/products/${id}`, {
    method: 'PUT',
    body: payload,
    errorMessage: 'Couldn’t update the product',
  })
}

export async function activateProduct(id) {
  return gatewayRequest(`/api/admin/products/${id}/activate`, {
    method: 'PUT',
    errorMessage: 'Couldn’t put the product back on sale',
  })
}

export async function deleteProduct(id) {
  return gatewayRequest(`/api/admin/products/${id}`, {
    method: 'DELETE',
    errorMessage: 'Couldn’t delete the product',
  })
}

export async function scheduleProductDeletion(id, { durationHours, durationMinutes, notice }) {
  return gatewayRequest(`/api/admin/products/${id}/schedule-deletion`, {
    method: 'POST',
    body: { durationHours, durationMinutes, notice },
    errorMessage: 'Couldn’t schedule the deletion',
  })
}

export async function cancelScheduledProductDeletion(id) {
  return gatewayRequest(`/api/admin/products/${id}/cancel-deletion`, {
    method: 'POST',
    errorMessage: 'Couldn’t cancel the deletion',
  })
}

export async function executeProductDeletion(id) {
  return gatewayRequest(`/api/admin/products/${id}/execute-deletion`, {
    method: 'POST',
    errorMessage: 'Couldn’t delete and refund the product',
  })
}

export async function getDeletingAnnouncements({ signal } = {}) {
  return gatewayRequest('/api/shop/products/deleting-announcements', {
    signal,
    auth: false,
    errorMessage: 'Couldn’t load removal notices',
  })
}

export async function getCategories({ signal } = {}) {
  return gatewayRequest('/api/shop/categories', {
    signal,
    auth: false,
    errorMessage: 'Couldn’t load categories',
  })
}

export async function createCategory(payload) {
  return gatewayRequest('/api/shop/categories', {
    method: 'POST',
    body: payload,
    errorMessage: 'Couldn’t create the category',
  })
}

export async function updateCategory(id, payload) {
  return gatewayRequest(`/api/shop/categories/${id}`, {
    method: 'PUT',
    body: payload,
    errorMessage: 'Couldn’t update the category',
  })
}

export async function deleteCategory(id) {
  return gatewayRequest(`/api/shop/categories/${id}`, {
    method: 'DELETE',
    errorMessage: 'Couldn’t delete the category',
  })
}

export async function uploadDeckSkinZip(productId, file) {
  const formData = new FormData()
  formData.append('file', file)

  return gatewayRequest(`/api/admin/products/${productId}/deck-skin/upload-zip`, {
    method: 'POST',
    body: formData,
    errorMessage: 'Card skin upload failed',
  })
}

export async function uploadDeckSkinFiles(productId, files) {
  const formData = new FormData()
  files.forEach(file => formData.append('files', file))

  return gatewayRequest(`/api/admin/products/${productId}/deck-skin/upload-files`, {
    method: 'POST',
    body: formData,
    errorMessage: 'Skin image upload failed',
  })
}

export async function uploadAssetFile(file, folder = 'assets') {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', folder)

  return gatewayRequest('/api/admin/products/upload-asset', {
    method: 'POST',
    body: formData,
    errorMessage: 'Asset upload failed',
  })
}

export async function getAdminBundles({ signal } = {}) {
  return gatewayRequest('/api/admin/bundles', {
    signal,
    errorMessage: 'Couldn’t load coin packs',
  })
}

export async function createBundle(payload) {
  return gatewayRequest('/api/admin/bundles', {
    method: 'POST',
    body: payload,
    errorMessage: 'Couldn’t create the coin pack',
  })
}

export async function updateBundle(id, payload) {
  return gatewayRequest(`/api/admin/bundles/${id}`, {
    method: 'PUT',
    body: payload,
    errorMessage: 'Couldn’t update the coin pack',
  })
}

export async function deleteBundle(id) {
  return gatewayRequest(`/api/admin/bundles/${id}`, {
    method: 'DELETE',
    errorMessage: 'Couldn’t delete the coin pack',
  })
}

export async function toggleBundleActive(id, isActive) {
  const query = typeof isActive === 'boolean' ? `?isActive=${isActive}` : ''
  return gatewayRequest(`/api/admin/bundles/${id}/toggle${query}`, {
    method: 'PATCH',
    errorMessage: 'Couldn’t change the pack’s sale status',
  })
}

/**
 * Sound file management (mp3/ogg/wav, max 2MB)
 */
export async function uploadProductSound(productId, file) {
  const formData = new FormData()
  formData.append('file', file)

  return gatewayRequest(`/api/admin/products/${productId}/sound`, {
    method: 'POST',
    body: formData,
    errorMessage: 'Sound upload failed',
  })
}

export async function deleteProductSound(productId) {
  return gatewayRequest(`/api/admin/products/${productId}/sound`, {
    method: 'DELETE',
    errorMessage: 'Couldn’t remove the sound',
  })
}

/**
 * Chuyển sản phẩm sang trạng thái Bảo Trì (tạm dừng trên Shop, kho đồ người chơi bảo lưu 100%)
 */
export async function maintainProduct(productId) {
  return gatewayRequest(`/api/admin/products/${productId}/maintain`, {
    method: 'POST',
    errorMessage: 'Couldn’t suspend the product',
  })
}
