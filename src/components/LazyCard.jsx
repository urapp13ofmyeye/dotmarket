'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * 뷰포트에 가까워질 때까지 children 마운트를 지연
 * rootMargin: 300px → 스크롤 300px 전부터 미리 렌더링 시작
 */
export default function LazyCard({ children }) {
  const ref = useRef(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMounted(true)
          observer.disconnect()
        }
      },
      { rootMargin: '300px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  if (!mounted) {
    // 카드 자리 확보 (레이아웃 시프트 방지)
    return (
      <div
        ref={ref}
        className="rounded-2xl bg-white border border-pink-100"
        style={{ aspectRatio: '1 / 1.55' }}
      />
    )
  }

  return children
}
