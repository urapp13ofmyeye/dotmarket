'use client'

import { useState, useRef } from 'react'

export default function ImageCarousel({ images, fallbackEmoji, bg }) {
  const [current, setCurrent] = useState(0)
  const [failed, setFailed] = useState(new Set())
  const touchStartX = useRef(null)

  const go = (index) => setCurrent((index + images.length) % images.length)

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX }
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 30) go(current + (diff > 0 ? 1 : -1))
    touchStartX.current = null
  }

  const validImages = images.filter((_, i) => !failed.has(i))

  // 이미지 없거나 전부 실패 → 이모지 플레이스홀더
  if (!images || images.length === 0 || validImages.length === 0) {
    return (
      // padding-bottom 100% = 정사각형 (iOS Safari에서 aspect-ratio보다 안정적)
      <div className={`relative w-full ${bg}`} style={{ paddingBottom: '100%' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl select-none">{fallbackEmoji}</span>
        </div>
      </div>
    )
  }

  const safeIndex = Math.min(current, validImages.length - 1)

  return (
    // padding-bottom 100% 방식으로 정사각형 확보 → iOS Safari h-full 버그 우회
    <div
      className="relative w-full overflow-hidden bg-white"
      style={{ paddingBottom: '100%', touchAction: 'pan-y' }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* 슬라이드 트랙: absolute로 padding 공간 채우기 */}
      <div
        className="absolute inset-0 flex transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${safeIndex * 100}%)` }}
      >
        {images.map((src, i) => (
          !failed.has(i) && (
            // 각 슬라이드를 relative로 → 이미지를 absolute inset-0으로 채움
            <div key={i} className="relative min-w-full flex-shrink-0">
              <img
                src={src}
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
                onError={() => setFailed(prev => new Set([...prev, i]))}
              />
            </div>
          )
        ))}
      </div>

      {/* 점 인디케이터 (2장 이상일 때만) */}
      {validImages.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
          {validImages.map((_, i) => (
            <span
              key={i}
              className={`block rounded-full transition-all ${
                i === safeIndex ? 'w-2 h-2 bg-gray-500' : 'w-1.5 h-1.5 bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}

      {/* n/전체 뱃지 (2장 이상일 때만) */}
      {validImages.length > 1 && (
        <span className="absolute top-2 left-2 bg-black/30 text-white text-[10px] px-1.5 py-0.5 rounded-full pointer-events-none">
          {safeIndex + 1} / {validImages.length}
        </span>
      )}
    </div>
  )
}
