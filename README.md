# DOT 마켓

2026년 3월 31일(화) 일일 돗자리마켓을 위한 실시간 상품 관리 웹앱입니다.

손님은 상품을 둘러보고 장바구니에 담을 수 있고, 운영자는 관리자 모드에서 품절 처리와 가격 수정을 실시간으로 반영할 수 있습니다.

---

## 기능

- **상품 목록** — 캐릭터/카테고리 필터, 상품명 검색
- **이미지 캐러셀** — 상품당 여러 장, 터치 스와이프 지원
- **장바구니** — 담기/빼기, 합계 확인 (로컬 저장)
- **관리자 모드** — 비밀번호 인증, 품절 일괄 처리, 가격 인라인 수정
- **판매 결산** — 판매자별 판매 품목 및 합계 집계 (`/settlement`)

---

## 기술 스택

| 분류 | 사용 기술 |
|------|-----------|
| 프레임워크 | Next.js 14 (App Router) |
| 스타일 | Tailwind CSS |
| 데이터베이스 | Upstash Redis |
| 배포 | Vercel |

---

## 시작하기

```bash
npm install
npm run dev
```

`.env.local` 파일을 프로젝트 루트에 생성하고 아래 값을 채워주세요.

```
ADMIN_PASSWORD=관리자비밀번호
KV_REST_API_URL=https://...upstash.io
KV_REST_API_TOKEN=...
```

---

## 상품 추가 방법

`src/data/products.js`에 아래 형식으로 추가합니다.

```js
{
  id: 94,
  name: "상품명",
  price: 5000,
  character: "산리오",   // 산리오 | 치이카와 | 해리포터 | 죠죠 | 뱅드림 | 기타
  category: "키링",      // 가챠 | 피규어 | 키링 | 인형키링 | 뱃지 | 잡화 | 다꾸
  seller: "판매자이름",
  imageCount: 2,         // 0: 이모지만 표시, N: N장 캐러셀
}
```

이미지는 `/public/images/{id}-1.png`, `/public/images/{id}-2.png` 형식으로 추가합니다.

---

## 문서

자세한 기술 문서는 [`docs/TECHNICAL.md`](docs/TECHNICAL.md)를 참고하세요.
