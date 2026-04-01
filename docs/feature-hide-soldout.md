# ✨ Feature: 품절 숨기기 기능 추가 (일반 구매자용)

## 개요

품절 처리된 품목이 목록에 그대로 노출되어, 구매자가 살 수 없는 품목이 섞여 보이는 불편함이 있었습니다.
관리자용 "품절 보기" 필터와 별개로, 일반 구매자가 품절 품목을 직접 숨길 수 있는 기능을 추가했습니다.

---

## 변경 사항

### `src/app/page.js`
- `hideSoldOut` state 추가 (`useState(false)`)
- `filtered` useMemo 로직에 `hideSoldOut` 조건 반영
  - 일반 검색 시에도 품절 품목 필터링 적용
  - `showSoldOut`(관리자 품절 보기) 모드와 독립적으로 동작
- 결과 카운트 영역에 **"품절 숨기기" 체크박스 UI** 추가
  - `isAdmin`이 아닌 경우에만 렌더링
  - 기존 "필터 초기화" 버튼과 같은 행에 배치

### `src/components/FilterBar.jsx`
- `hideSoldOut`, `setHideSoldOut` props 추가

---

## 동작 방식

| 상태 | 동작 |
|------|------|
| `hideSoldOut = false` (기본) | 품절 품목 포함하여 전체 표시 |
| `hideSoldOut = true` | 품절 품목 숨김 (검색 결과에도 적용) |
| 관리자 모드 (`isAdmin = true`) | 체크박스 비노출, 해당 기능 비활성 |
| `showSoldOut = true` (관리자 품절 보기) | `hideSoldOut`과 독립적으로 동작 |

---

## 연관 버그 수정: 세션 복원 시 `pendingSoldOut` 레이스 컨디션

**커밋**: `6bb7b36`

**문제**: 세션 스토리지로 자동 로그인될 때, `soldOutIds` fetch 완료 전에 `isAdmin`이 `true`로 설정됨.
이 경우 `pendingSoldOut`이 빈 Set으로 초기화되어, 빠른 품절 모드 상태가 실제 품절 목록과 불일치하는 버그 발생.

**해결**: `fromSession` ref를 도입하여 세션 복원 경로를 구분.
fetch 완료 후 `pendingSoldOut`을 초기화하도록 순서 보장.
