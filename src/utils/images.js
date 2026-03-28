/**
 * 상품 ID와 이미지 수로 경로 배열을 자동 생성합니다.
 *
 * 이미지 파일명 규칙:
 *   /public/images/{id}-1.jpg
 *   /public/images/{id}-2.jpg
 *   /public/images/{id}-3.jpg  ...
 *
 * 예) id: 5, imageCount: 3  →  ["/images/5-1.jpg", "/images/5-2.jpg", "/images/5-3.jpg"]
 */
// imageCount: 0         → 이모지 강제 표시
// imageCount: undefined  → {id}-1.png 자동 시도 (없으면 컴포넌트에서 이모지로 fallback)
// imageCount: N          → {id}-1.png ~ {id}-N.png 캐러셀
export function getProductImages(id, imageCount) {
  if (imageCount === 0) return [];
  const count = imageCount ?? 1;
  return Array.from({ length: count }, (_, i) => `/images/${id}-${i + 1}.png`);
}
