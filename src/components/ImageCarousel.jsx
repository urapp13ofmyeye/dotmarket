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

  // 로드 실패한 이미지 제외
  const validImages = images.filter((_, i) => !failed.has(i))

  // 이미지 없거나 전부 실패 → 이모지 플레이스홀더
  if (!images || images.length === 0 || validImages.length === 0) {
    return (
      <div className={`w-full aspect-square ${bg} flex items-center justify-center`}>
        <span className="text-5xl select-none">{fallbackEmoji}</span>
      </div>
    )
  }

  // 유효한 이미지 인덱스가 범위 벗어나지 않도록 보정
  const safeIndex = Math.min(current, validImages.length - 1)

  return (
    <div
      className="relative w-full aspect-square overflow-hidden bg-white"
      style={{ touchAction: 'pan-y' }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* 슬라이드 트랙 */}
      <div
        className="flex h-full transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${safeIndex * 100}%)` }}
      >
        {images.map((src, i) => (
          // 실패한 이미지는 렌더링에서 제외
          !failed.has(i) && (
            <div key={i} className="min-w-full h-full flex-shrink-0">
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover"
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
        <span className="absolute top-2 right-2 bg-black/30 text-white text-[10px] px-1.5 py-0.5 rounded-full pointer-events-none">
          {safeIndex + 1} / {validImages.length}
        </span>
      )}
    </div>
  )
}
