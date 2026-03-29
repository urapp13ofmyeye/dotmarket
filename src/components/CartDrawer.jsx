'use client'

import { useEffect, useRef, useState } from 'react'
import products from '@/data/products'

export default function CartDrawer({ cartItems, priceOverrides, onUpdateQty, onClose }) {
  const [visible, setVisible] = useState(false)
  const touchStartY = useRef(null)

  // 마운트 시 슬라이드 업
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  // 배경 스크롤 막기
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 300)
  }

  const onTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY
  }
  const onTouchEnd = (e) => {
    if (touchStartY.current === null) return
    const delta = e.changedTouches[0].clientY - touchStartY.current
    if (delta > 72) handleClose()
    touchStartY.current = null
  }

  const cartList = Object.entries(cartItems)
    .map(([id]) => {
      const product = products.find(p => p.id === Number(id))
      if (!product) return null
      const price = priceOverrides[id] ? Number(priceOverrides[id]) : product.price
      return { ...product, price }
    })
    .filter(Boolean)

  const total = cartList.reduce((sum, item) => sum + item.price, 0)

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* 배경 딤 */}
      <div
        className="absolute inset-0 bg-black/30 transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
        onClick={handleClose}
      />

      {/* 드로어 */}
      <div
        className="relative bg-white rounded-t-3xl shadow-2xl max-h-[80vh] flex flex-col transition-transform duration-300 ease-out"
        style={{ transform: visible ? 'translateY(0)' : 'translateY(100%)' }}
      >
        {/* 스와이프 핸들 */}
        <div
          className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* 헤더 */}
        <div className="px-5 py-3 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-base">🛒</span>
            <h2 className="text-sm font-bold text-gray-700">장바구니</h2>
            {cartList.length > 0 && (
              <span className="text-xs bg-pink-100 text-pink-500 font-bold px-2 py-0.5 rounded-full">
                {cartList.length}
              </span>
            )}
          </div>
          <button onClick={handleClose} className="text-gray-300 hover:text-gray-400 text-lg leading-none">✕</button>
        </div>

        {/* 목록 */}
        <div className="overflow-y-auto flex-1 px-5 py-3 flex flex-col gap-3">
          {cartList.length === 0 ? (
            <div className="text-center py-16 text-gray-300">
              <p className="text-4xl mb-2">🛒</p>
              <p className="text-sm">담긴 상품이 없어요</p>
            </div>
          ) : (
            cartList.map(item => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-gray-400">{item.category}</p>
                  <p className="text-sm font-medium text-gray-700 leading-snug line-clamp-2">{item.name}</p>
                  <p className="text-sm font-bold text-pink-400 mt-0.5">{item.price.toLocaleString()}원</p>
                </div>
                <button
                  onClick={() => onUpdateQty(item.id, 0)}
                  className="shrink-0 w-7 h-7 rounded-full border border-gray-200 text-gray-300 flex items-center justify-center hover:border-red-300 hover:text-red-400 transition text-sm"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        {/* 합계 + 비우기 */}
        {cartList.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-100 bg-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">총 합계</span>
              <span className="text-lg font-bold text-pink-500">{total.toLocaleString()}원</span>
            </div>
            <button
              onClick={() => Object.keys(cartItems).forEach(id => onUpdateQty(id, 0))}
              className="w-full text-xs text-gray-300 hover:text-red-400 transition py-1"
            >
              장바구니 비우기
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
