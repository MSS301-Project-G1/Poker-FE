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
 * Category Management APIs
 */
export async function getCategories({ signal } = {}) {
  return gatewayRequest('/api/shop/categories', {
    signal,
    auth: false,
    errorMessage: 'Không thể tải danh sách danh mục',
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
 * AI Model Configurations (Gemini, OpenAI, etc.)
 */
export async function getAiModels({ signal } = {}) {
  return gatewayRequest('/api/admin/ai-models', {
    signal,
    errorMessage: 'Không thể tải danh sách cấu hình AI Model',
  })
}

export async function getActiveAiModels({ signal } = {}) {
  return gatewayRequest('/api/admin/ai-models/active', {
    signal,
    errorMessage: 'Không thể tải danh sách AI Model khả dụng',
  })
}

export async function setDefaultAiModel(id) {
  return gatewayRequest(`/api/admin/ai-models/${id}/set-default`, {
    method: 'POST',
    errorMessage: 'Không thể đặt AI Model mặc định',
  })
}

export async function toggleAiModelActive(id, active) {
  return gatewayRequest(`/api/admin/ai-models/${id}/toggle-active?active=${active}`, {
    method: 'PATCH',
    errorMessage: 'Không thể đổi trạng thái AI Model',
  })
}

export async function syncAiModels(provider = 'GEMINI') {
  return gatewayRequest(`/api/admin/ai-models/sync?provider=${provider}`, {
    method: 'POST',
    errorMessage: 'Không thể đồng bộ danh sách AI Model',
  })
}

/**
 * AI Asset Generator
 */
export async function getPromptPresets(categoryCode, { signal } = {}) {
  const query = categoryCode ? `?categoryCode=${encodeURIComponent(categoryCode)}` : ''
  return gatewayRequest(`/api/admin/asset-generator/prompt-presets${query}`, {
    signal,
    errorMessage: 'Không thể tải Prompt Presets mẫu',
  })
}

export async function previewPrompt(categoryCode, options) {
  return gatewayRequest(`/api/admin/asset-generator/prompt-preview?categoryCode=${encodeURIComponent(categoryCode || 'CARD_SKIN')}`, {
    method: 'POST',
    body: options,
    errorMessage: 'Không thể xem trước cấu trúc prompt',
  })
}

export async function generateAiAssets({ categoryCode, options, referenceImage, soundFile }) {
  const formData = new FormData()
  formData.append('categoryCode', categoryCode || 'CARD_SKIN')
  if (options) {
    formData.append('optionsJson', JSON.stringify(options))
  }
  if (referenceImage) {
    formData.append('referenceImage', referenceImage)
  }
  if (soundFile) {
    formData.append('soundFile', soundFile)
  }

  return gatewayRequest('/api/admin/asset-generator/generate', {
    method: 'POST',
    body: formData,
    errorMessage: 'Sinh tài nguyên AI thất bại',
  })
}

export async function refineAiBatch(batchId, feedback) {
  return gatewayRequest(`/api/admin/asset-generator/${batchId}/refine`, {
    method: 'POST',
    body: { feedback },
    errorMessage: 'Tinh chỉnh gói tài nguyên thất bại',
  })
}

export async function applyAiBatch(batchId, payload) {
  return gatewayRequest(`/api/admin/asset-generator/${batchId}/apply`, {
    method: 'POST',
    body: payload,
    errorMessage: 'Áp dụng tài nguyên vào sản phẩm thất bại',
  })
}

export async function deleteAiBatch(batchId) {
  return gatewayRequest(`/api/admin/asset-generator/${batchId}`, {
    method: 'DELETE',
    errorMessage: 'Xóa Batch tài nguyên thất bại',
  })
}

export async function getRecentAiBatches({ signal } = {}) {
  return gatewayRequest('/api/admin/asset-generator/batches', {
    signal,
    errorMessage: 'Không thể tải lịch sử sinh tài nguyên',
  })
}


