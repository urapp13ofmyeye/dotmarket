import products from '@/data/products'

/**
 * id 배열과 가격 오버라이드를 받아 상품 정보를 합쳐 반환
 * CartDrawer, SoldOutDrawer에서 공통 사용
 */
export function enrichProducts(ids, priceOverrides) {
  return [...ids]
    .map((id) => {
      const product = products.find((p) => p.id === Number(id))
      if (!product) return null
      const price = priceOverrides[id] ? Number(priceOverrides[id]) : product.price
      return { ...product, price }
    })
    .filter(Boolean)
}
