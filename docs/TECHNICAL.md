# DOT 마켓 — 기술 문서

> 2026-03-31 일일 돗자리마켓을 위한 실시간 상품 관리 웹앱

---

## 1. 주요 기능

### 1-1. 상품 목록 조회

- 93개 상품을 2열(모바일) / 3열(태블릿) / 4열(데스크탑) 그리드로 표시
- 각 카드에 이미지 캐러셀, 카테고리, 상품명, 가격 표시
- 품절 상품은 카드 위에 오버레이 + 반투명 처리

**캐릭터 필터 / 카테고리 필터**
- 캐릭터: 산리오, 치이카와, 해리포터, 죠죠, 뱅드림, 기타
- 카테고리: 가챠, 피규어, 키링, 인형키링, 뱃지, 잡화, 다꾸
- 두 필터는 독립적으로 적용되며 중첩 가능

**상품명 검색**
- 입력과 동시에 실시간 필터링 (별도 API 호출 없음)
- 검색 중에는 캐릭터/카테고리 필터 비활성화(시각적으로 흐리게 처리)

---

### 1-2. 장바구니

- 각 상품 카드 우측 상단 버튼으로 담기/빼기
- 장바구니 아이콘에 담긴 수량 뱃지 표시
- `localStorage`에 저장 → 새로고침 후에도 유지
- 슬라이드업 드로어에서 목록 확인, 개별 제거, 전체 비우기, 합계 표시
- 관리자 모드 진입 시 장바구니 버튼 숨김

---

### 1-3. 관리자 모드

**인증 방식**
- 헤더 우측 "관리자" 버튼 클릭 → 비밀번호 모달
- `/api/admin` POST로 서버에서 `ADMIN_PASSWORD` 환경변수와 대조
- 인증 성공 시 비밀번호를 `sessionStorage`에 저장 → 페이지 이동/새로고침 후 자동 복원
- 탭/브라우저 닫으면 세션 만료

**품절 관리 (QuickMode)**
- 관리자 모드 진입 시 자동으로 QuickMode 활성화
- 카드를 탭하면 품절 처리/해제 선택 (붉은 테두리 = 품절 처리 예정, 파란 테두리 = 해제 예정)
- 하단 SoldOutDrawer에서 선택 목록 확인 후 "품절 관리" 버튼으로 일괄 확정
- 확정 시 Upstash Redis의 `soldout` Set에 전체 교체 방식으로 저장

**가격 수정**
- 관리자 모드에서 카드의 가격 영역 옆 ✏️ 버튼으로 인라인 편집
- 입력 후 Enter 또는 포커스 해제로 저장
- 원래 가격으로 되돌리면 오버라이드 삭제
- Redis Hash(`price_overrides`)에 `{상품id: 가격}` 형태로 저장
- 오버라이드된 가격은 주황색으로 표시, 원래 가격은 취소선으로 표시

---

### 1-4. 판매 결산 페이지 (`/settlement`)

- 관리자 비밀번호로 별도 인증 (메인과 같은 세션 공유)
- 품절된 상품을 판매자별로 그룹화
- 각 판매자 카드 탭하면 판매 품목 목록 펼침/접기
- 가격 오버라이드가 적용된 경우 수정된 가격 기준으로 집계
- `useMemo`로 판매 데이터 계산 메모이제이션

---

## 2. 코드 구조

```
src/
├── app/
│   ├── page.js              # 메인 페이지 (상품 목록, 필터, 상태 관리)
│   ├── layout.js            # 루트 레이아웃, 메타데이터
│   ├── globals.css          # 전역 스타일, 폰트 정의
│   ├── settlement/
│   │   └── page.js          # 판매 결산 페이지
│   └── api/
│       ├── admin/route.js   # 관리자 인증 API
│       ├── soldout/route.js # 품절 목록 조회/저장 API
│       └── prices/route.js  # 가격 오버라이드 조회/수정/삭제 API
│
├── components/
│   ├── ProductCard.jsx      # 상품 카드 (React.memo 적용)
│   ├── ImageCarousel.jsx    # 이미지 슬라이드 (터치 스와이프)
│   ├── FilterBar.jsx        # 캐릭터/카테고리 필터 탭
│   ├── CartDrawer.jsx       # 장바구니 슬라이드업 드로어
│   ├── SoldOutDrawer.jsx    # 품절 관리 하단 드로어
│   ├── AdminModal.jsx       # 관리자 비밀번호 입력 모달
│   └── LazyCard.jsx         # IntersectionObserver 기반 지연 마운트 래퍼
│
├── hooks/
│   └── useAdminAuth.js      # 관리자 인증 로직 훅
│
├── lib/
│   └── enrichProducts.js    # id 배열 → 상품 정보 변환 유틸
│
├── utils/
│   └── images.js            # 상품 이미지 경로 자동 생성
│
└── data/
    └── products.js          # 93개 상품 정적 데이터
```

### API 설계

| 엔드포인트 | 메서드 | 인증 | 설명 |
|-----------|--------|------|------|
| `/api/admin` | POST | — | 비밀번호 검증 |
| `/api/soldout` | GET | — | 품절 목록 조회 |
| `/api/soldout` | POST | ✅ | 품절 목록 전체 교체 |
| `/api/prices` | GET | — | 가격 오버라이드 전체 조회 |
| `/api/prices` | POST | ✅ | 가격 오버라이드 추가/수정 |
| `/api/prices` | DELETE | ✅ | 가격 오버라이드 삭제 (원래 가격 복원) |

### 데이터 저장 구조 (Upstash Redis)

| Key | 타입 | 내용 |
|-----|------|------|
| `soldout` | Set | 품절 상품 id 목록 |
| `price_overrides` | Hash | `{상품id: 수정가격}` |

### 폰트

- 헤더 로고(`DOT 마켓`): **Library** (CDN)
- 전체 본문: **은디나루 (UnDinaru)** — CORS 제한으로 로컬 파일 사용 (`/public/fonts/UnDinaru.ttf`)
- 자간: `-0.04em`

### CSS 적용 방식

- **Tailwind CSS** 유틸리티 클래스 위주
- 전역 스타일(`globals.css`)에 `@font-face` 및 `body` 기본값만 선언
- 컴포넌트별 커스텀 값은 `style={{ ... }}` 인라인으로 처리 (Tailwind 범위 벗어나는 값)
- 스크롤바 커스텀, 가로 스크롤 영역 등 공통 유틸 클래스는 `globals.css`에 정의

### 이미지 규칙

```
/public/images/{id}-1.png
/public/images/{id}-2.png  ← 여러 장이면 자동 캐러셀
```

`imageCount: 0` → 이모지 플레이스홀더 강제 표시
`imageCount: undefined` → 1장 자동 시도 (실패 시 이모지 fallback)
`imageCount: N` → N장 캐러셀

---

## 3. 주요 개선 사항

### 3-1. 버그 수정: 품절 토글 레이스 컨디션

**문제**
```js
// 수정 전: API 실패해도 UI가 먼저 바뀌어버림
setSoldOutIds(next);          // UI 즉시 변경
await fetch("/api/soldout");  // 이후 API 호출 → 실패해도 UI는 이미 틀린 상태
```

**해결**
```js
// 수정 후: API 성공 확인 후 상태 업데이트
const res = await fetch("/api/soldout", { ... });
if (res.ok) setSoldOutIds(next);
```

---

### 3-2. 관리자 인증 로직 통합 (`useAdminAuth`)

**문제**
`AdminModal.jsx`, `page.js`, `settlement/page.js` 세 곳에 `/api/admin` 호출 + 에러/로딩 상태 관리 코드가 중복 존재

**해결**
`src/hooks/useAdminAuth.js`로 추출. `sessionStorage` 키(`dot_admin_pw`)도 한 곳에서만 관리.

```js
const { verify, loading, error, setError, getSaved, save, clear } = useAdminAuth()
```

---

### 3-3. 상품 목록 변환 로직 통합 (`enrichProducts`)

**문제**
`CartDrawer`와 `SoldOutDrawer`에 "id 배열 → 가격 오버라이드 포함한 상품 정보" 변환 코드가 각각 존재 (SoldOutDrawer는 2곳)

**해결**
`src/lib/enrichProducts.js` 유틸 함수로 추출

---

### 3-4. 렌더링 성능 개선

#### LazyCard — 초기 마운트 수 ~80% 감소

```
수정 전: 93개 카드를 모두 한 번에 마운트
수정 후: 뷰포트 기준 300px 이내 카드만 마운트, 나머지는 빈 placeholder
```

IntersectionObserver를 사용해 스크롤이 가까워지면 미리 마운트 (`rootMargin: '300px'`). 한 번 마운트되면 observer disconnect → 메모리 낭비 없음.

#### 이미지 lazy loading

```html
<img loading="lazy" decoding="async" ... />
```
브라우저 네이티브 lazy loading. 화면 밖 이미지는 네트워크 요청 자체를 하지 않음.

#### React.memo + useCallback — 불필요한 리렌더 방지

**문제**
장바구니에 상품 1개 추가 시 → 93개 카드 전부 리렌더

**해결 구조**

```js
// page.js — 핸들러를 useCallback으로 안정화
const toggleCart = useCallback((id) => { ... }, [])
const toggleSoldOut = useCallback(async (id) => { ... }, [])

// mutable 값은 ref로 관리 (의존성 배열 없이 최신값 참조)
const adminPasswordRef = useRef(adminPassword)
const soldOutIdsRef = useRef(soldOutIds)
```

```js
// ProductCard — memo로 감싸고 내부에서 id 직접 전달
const ProductCard = memo(function ProductCard({ ... }) { ... })

// page.js — 핸들러 함수 참조를 직접 전달 (인라인 화살표 함수 제거)
<ProductCard onToggleCart={toggleCart} onQuickToggle={toggleQuickSelect} ... />
```

`showCart`, `showAdminModal`, `confirmingQuick` 등 UI 상태 변경 시 → ProductCard 리렌더 0회

#### sellerList 계산 O(n²) → O(n)

```js
// 수정 전: 판매자 수만큼 products 전체를 반복 filter
allSellers.map(seller => products.filter(p => p.seller === seller))

// 수정 후: 단일 패스로 판매자별 그룹핑
for (const p of products) {
  sellerMap[p.seller] = [..., p]
}
```

---

## 4. 기타 기록

### 이미지 없는 상품 처리

이미지 로드 실패 시 각 캐릭터별 이모지를 플레이스홀더로 표시. `onError` 이벤트로 실패한 인덱스를 `Set`으로 추적하며, 유효한 이미지만 캐러셀에 포함.

### 모바일 iOS Safari 대응

- 이미지 캐러셀에 `aspect-ratio` 대신 `padding-bottom: 100%` + `position: absolute` 방식 사용
  → iOS Safari에서 `aspect-ratio`의 `h-full` 버그 우회
- 드로어에 `touchAction: 'pan-y'` 설정으로 스와이프 중 의도치 않은 줌/스크롤 방지

### 세션 기반 품절 관리

`soldOutIds`(확정)와 `pendingSoldOut`(진행중)을 분리하여 관리.
카드를 탭할 때마다 즉시 API를 호출하지 않고, "품절 관리" 버튼으로 한 번에 확정.
→ API 호출 최소화, 실수로 탭했을 때 되돌리기 가능

### 환경변수

| 변수 | 용도 |
|------|------|
| `ADMIN_PASSWORD` | 관리자 인증 |
| `KV_REST_API_URL` | Upstash Redis URL |
| `KV_REST_API_TOKEN` | Upstash Redis 토큰 |

로컬: `.env.local` / 배포: Vercel 대시보드 Environment Variables
