# 🐛 Bug Report #2 — 버그 수정 및 코드 개선

> 커밋: `4a0de81`, `fb96190`
> 날짜: 2026-03-30

---

## 1. 품절 API 응답 전 UI 선반영 버그

**파일**: `src/app/page.js` — `toggleSoldOut()`

**문제**: `/api/soldout` POST 요청 전에 `setSoldOutIds(next)`를 먼저 호출하여, API 실패 시에도 UI에 품절 상태가 반영됨.

**수정**: API 응답(`res.ok`) 확인 후에만 상태 업데이트.

```js
// before
setSoldOutIds(next);
await fetch(...)

// after
const res = await fetch(...)
if (res.ok) setSoldOutIds(next);
```

---

## 2. 관리자 인증 로직 중복 — `useAdminAuth` 훅 추출

**파일**: `src/hooks/useAdminAuth.js` (신규)

**문제**: `AdminModal`, `SettlementPage`, `page.js` 세 곳에서 `/api/admin` fetch, sessionStorage 접근, loading/error 상태 관리를 각각 중복 구현.

**수정**: `useAdminAuth` 커스텀 훅으로 추출. `verify()`, `save()`, `clear()`, `getSaved()`, `loading`, `error` 제공. 모든 컴포넌트가 훅을 통해 일관되게 인증 처리.

---

## 3. 상품 목록 조회 로직 중복 — `enrichProducts` 유틸 추출

**파일**: `src/lib/enrichProducts.js` (신규)

**문제**: `CartDrawer`, `SoldOutDrawer` 두 곳에서 `products.find()` + 가격 오버라이드 적용 로직을 동일하게 구현.

**수정**: `enrichProducts(ids, priceOverrides)` 유틸 함수로 추출 후 공유 사용.

---

## 4. `ProductCard` 불필요한 리렌더링

**파일**: `src/components/ProductCard.jsx`

**문제**: `memo` 없이 구현되어 부모 상태 변경 시 전체 카드 목록이 매번 리렌더링됨.

**수정**: `React.memo`로 래핑하여 props가 바뀐 카드만 리렌더링되도록 최적화.

---

## 5. quickMode 카드 클릭 핸들러 버그

**파일**: `src/components/ProductCard.jsx`

**문제 1**: `quickMode` 활성 시 카드 클릭에 `onQuickToggle` 함수 참조만 넘겨 `id`가 전달되지 않는 버그.

**문제 2**: 장바구니 아이콘 클릭 이벤트가 카드까지 버블링되어 의도치 않은 품절 토글 발생.

**수정**:
```js
// before
onClick={quickMode ? onQuickToggle : undefined}

// after
onClick={quickMode ? () => onQuickToggle(id) : undefined}

// 장바구니 아이콘 — 이벤트 버블링 차단
onClick={(e) => { e.stopPropagation(); onToggleCart(id) }}
```

---

## 6. 카드 스타일 조건 로직 분리

**파일**: `src/components/ProductCard.jsx`

**문제**: 중첩 삼항 연산자로 카드 스타일 조건을 인라인 처리하여 가독성 저하 및 iOS Safari 렌더링 이슈.

**수정**: `getCardStyle()` 순수 함수로 분리하여 가독성 개선 및 iOS Safari 호환성 확보.

---

## 7. 결산 페이지 `sellerList` 연산 개선

**파일**: `src/app/settlement/page.js`

**문제**: `allSellers` 추출 → `.map()` → `.filter()` 체인 방식으로 불필요한 이중 순회 발생.

**수정**: `for...of` + `sellerMap` 객체 방식으로 단일 순회 집계로 개선.
