import { gatewayRequest } from '@/shared/api/gatewayClient'

/**
 * Raw HTTP Service for Shop Catalog & Products
 * Minimal payloads - Server is single source of truth (Anti-Bypass).
 */

export async function getProducts({
  categoryCode,
  tier,
  page = 0,
  size = 20,
  sort = 'createdAt,desc',
  signal,
} = {}) {
  const params = new URLSearchParams()
  if (categoryCode && categoryCode !== 'ALL') params.append('category', categoryCode)
  if (tier && tier !== 'ALL') params.append('tier', tier)
  params.append('page', String(page))
  params.append('size', String(size))
  params.append('sort', sort)

  return gatewayRequest(`/api/shop/products?${params.toString()}`, {
    signal,
    auth: false,
    errorMessage: 'Không thể tải danh sách sản phẩm',
  })
}

export async function getCategories({ signal } = {}) {
  return gatewayRequest('/api/shop/categories', {
    signal,
    auth: false,
    errorMessage: 'Không thể tải danh mục sản phẩm',
  })
}

export async function getProductDetail(productId, { signal } = {}) {
  return gatewayRequest(`/api/shop/products/${productId}`, {
    signal,
    auth: false,
    errorMessage: 'Không thể tải thông tin sản phẩm',
  })
}

/**
 * Purchase product with VIP Coin
 * Anti-bypass: Only sends productId in path. Never sends userId, price, or isOwned.
 */
export async function purchaseProduct(productId) {
  return gatewayRequest(`/api/shop/products/${productId}/purchase`, {
    method: 'POST',
    errorMessage: 'Giao dịch mua vật phẩm không thành công',
  })
}
