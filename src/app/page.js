'use client'

import { useState, useEffect, useMemo } from 'react'
import products from '@/data/products'
import FilterBar from '@/components/FilterBar'
import ProductCard from '@/components/ProductCard'
import AdminModal from '@/components/AdminModal'

export default function Home() {
  const [charFilter, setCharFilter] = useState(null)
  const [catFilter, setCatFilter] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [soldOutIds, setSoldOutIds] = useState(new Set())

  // 품절 상태 불러오기 (로컬스토리지)
  useEffect(() => {
    const saved = localStorage.getItem('dot_soldout')
    if (saved) setSoldOutIds(new Set(JSON.parse(saved)))
  }, [])

  const toggleSoldOut = (id) => {
    setSoldOutIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      localStorage.setItem('dot_soldout', JSON.stringify([...next]))
      return next
    })
  }

  // 필터 적용
  const filtered = useMemo(() => {
    return products.filter(p => {
      if (charFilter && p.character !== charFilter) return false
      if (catFilter && p.category !== catFilter) return false
      return true
    })
  }, [charFilter, catFilter])

  const characters = ['산리오', '치이카와', '해리포터', '죠죠', '뱅드림', '기타']
  const categories = ['가챠', '피규어', '키링', '인형키링', '뱃지', '잡화', '다꾸']

  const clearFilters = () => { setCharFilter(null); setCatFilter(null) }
  const isFiltered = charFilter || catFilter

  return (
    <div className="min-h-screen bg-[#FFF5F8]">

      {/* 헤더 + 필터바 묶어서 sticky */}
      <div className="sticky top-0 z-20 bg-white shadow-sm">
        {/* 헤더 */}
        <header className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-pink-400 leading-tight">🌸 DOT 마켓</h1>
            <p className="text-[11px] text-gray-400">일일 벼룩시장 · 돗자리마켓</p>
          </div>
          <button
            onClick={() => isAdmin ? setIsAdmin(false) : setShowAdminModal(true)}
            className={`text-xs px-3 py-1.5 rounded-full border transition ${
              isAdmin
                ? 'bg-pink-400 text-white border-pink-400'
                : 'text-gray-300 border-gray-200 hover:border-gray-300 hover:text-gray-400'
            }`}
          >
            {isAdmin ? '관리자 모드 ON' : '관리자'}
          </button>
        </header>

        {/* 필터바 */}
        <FilterBar
          characters={characters}
          categories={categories}
          charFilter={charFilter}
          catFilter={catFilter}
          setCharFilter={setCharFilter}
          setCatFilter={setCatFilter}
        />
      </div>

      {/* 메인 콘텐츠 */}
      <main className="max-w-4xl mx-auto px-4 pb-16 pt-4">
        {/* 결과 수 + 필터 초기화 */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-400">
            상품 <span className="font-semibold text-gray-500">{filtered.length}</span>개
          </p>
          {isFiltered && (
            <button onClick={clearFilters} className="text-xs text-pink-400 hover:underline">
              필터 초기화 ✕
            </button>
          )}
        </div>

        {/* 상품 그리드 */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-300">
            <p className="text-5xl mb-3">🔍</p>
            <p className="text-sm">해당하는 상품이 없어요</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filtered.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                isAdmin={isAdmin}
                isSoldOut={soldOutIds.has(product.id)}
                onToggleSoldOut={() => toggleSoldOut(product.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* 관리자 모달 */}
      {showAdminModal && (
        <AdminModal
          onSuccess={() => { setIsAdmin(true); setShowAdminModal(false) }}
          onClose={() => setShowAdminModal(false)}
        />
      )}
    </div>
  )
}
