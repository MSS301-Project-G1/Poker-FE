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
    errorMessage: 'Không thể tải danh sách sản phẩm',
  })
}

export async function getProductById(id, { signal } = {}) {
  return gatewayRequest(`/api/shop/products/${id}`, {
    signal,
    auth: false,
    errorMessage: 'Không thể tải chi tiết sản phẩm',
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

export async function activateProduct(id) {
  return gatewayRequest(`/api/admin/products/${id}/activate`, {
    method: 'PUT',
    errorMessage: 'Không thể mở bán lại sản phẩm',
  })
}

export async function deleteProduct(id) {
  return gatewayRequest(`/api/admin/products/${id}`, {
    method: 'DELETE',
    errorMessage: 'Không thể xóa sản phẩm',
  })
}

export async function scheduleProductDeletion(id, { durationHours, durationMinutes, notice }) {
  return gatewayRequest(`/api/admin/products/${id}/schedule-deletion`, {
    method: 'POST',
    body: { durationHours, durationMinutes, notice },
    errorMessage: 'Không thể lên lịch xóa sản phẩm',
  })
}

export async function cancelScheduledProductDeletion(id) {
  return gatewayRequest(`/api/admin/products/${id}/cancel-deletion`, {
    method: 'POST',
    errorMessage: 'Không thể hủy lệnh xóa sản phẩm',
  })
}

export async function executeProductDeletion(id) {
  return gatewayRequest(`/api/admin/products/${id}/execute-deletion`, {
    method: 'POST',
    errorMessage: 'Không thể thực thi xóa và hoàn tiền sản phẩm',
  })
}

export async function getDeletingAnnouncements({ signal } = {}) {
  return gatewayRequest('/api/shop/products/deleting-announcements', {
    signal,
    auth: false,
    errorMessage: 'Không thể tải thông báo sản phẩm sắp xóa',
  })
}

export async function getCategories({ signal } = {}) {
  return gatewayRequest('/api/shop/categories', {
    signal,
    auth: false,
    errorMessage: 'Không thể tải danh mục sản phẩm',
  })
}

export async function createCategory(payload) {
  return gatewayRequest('/api/shop/categories', {
    method: 'POST',
    body: payload,
    errorMessage: 'Không thể tạo danh mục mới',
  })
}

export async function updateCategory(id, payload) {
  return gatewayRequest(`/api/shop/categories/${id}`, {
    method: 'PUT',
    body: payload,
    errorMessage: 'Không thể cập nhật danh mục',
  })
}

export async function deleteCategory(id) {
  return gatewayRequest(`/api/shop/categories/${id}`, {
    method: 'DELETE',
    errorMessage: 'Không thể xóa danh mục',
  })
}

export async function uploadDeckSkinZip(productId, file) {
  const formData = new FormData()
  formData.append('file', file)

  return gatewayRequest(`/api/admin/products/${productId}/deck-skin/upload-zip`, {
    method: 'POST',
    body: formData,
    errorMessage: 'Tải lên bộ skin bài thất bại',
  })
}

export async function uploadDeckSkinFiles(productId, files) {
  const formData = new FormData()
  files.forEach(file => formData.append('files', file))

  return gatewayRequest(`/api/admin/products/${productId}/deck-skin/upload-files`, {
    method: 'POST',
    body: formData,
    errorMessage: 'Tải lên danh sách ảnh skin thất bại',
  })
}

export async function uploadAssetFile(file, folder = 'assets') {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', folder)

  return gatewayRequest('/api/admin/products/upload-asset', {
    method: 'POST',
    body: formData,
    errorMessage: 'Tải lên tệp tài nguyên thất bại',
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

/**
 * Sound file management (mp3/ogg/wav, max 2MB)
 */
export async function uploadProductSound(productId, file) {
  const formData = new FormData()
  formData.append('file', file)

  return gatewayRequest(`/api/admin/products/${productId}/sound`, {
    method: 'POST',
    body: formData,
    errorMessage: 'Tải lên tệp âm thanh thất bại',
  })
}

export async function deleteProductSound(productId) {
  return gatewayRequest(`/api/admin/products/${productId}/sound`, {
    method: 'DELETE',
    errorMessage: 'Gỡ tệp âm thanh thất bại',
  })
}

/**
 * Chuyển sản phẩm sang trạng thái Bảo Trì (tạm dừng trên Shop, kho đồ người chơi bảo lưu 100%)
 */
export async function maintainProduct(productId) {
  return gatewayRequest(`/api/admin/products/${productId}/maintain`, {
    method: 'POST',
    errorMessage: 'Không thể chuyển sản phẩm sang trạng thái Bảo Trì',
  })
}
