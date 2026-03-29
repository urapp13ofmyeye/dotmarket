'use client'

import { useState, useEffect, useMemo } from 'react'
import products from '@/data/products'
import FilterBar from '@/components/FilterBar'
import ProductCard from '@/components/ProductCard'
import AdminModal from '@/components/AdminModal'

export default function Home() {
  const [charFilter, setCharFilter] = useState(null)
  const [catFilter, setCatFilter] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [soldOutIds, setSoldOutIds] = useState(new Set())
  const [priceOverrides, setPriceOverrides] = useState({})

  // 품절 상태 불러오기
  useEffect(() => {
    const saved = localStorage.getItem('dot_soldout')
    if (saved) setSoldOutIds(new Set(JSON.parse(saved)))
  }, [])

  // 가격 오버라이드 불러오기
  useEffect(() => {
    fetch('/api/prices')
      .then(r => r.json())
      .then(data => setPriceOverrides(data))
      .catch(() => {})
  }, [])

  const toggleSoldOut = (id) => {
    setSoldOutIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      localStorage.setItem('dot_soldout', JSON.stringify([...next]))
      return next
    })
  }

  const updatePrice = async (id, newPrice) => {
    const res = await fetch('/api/prices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: adminPassword, id, price: newPrice }),
    })
    if (res.ok) {
      setPriceOverrides(prev => ({ ...prev, [id]: newPrice }))
    }
  }

  const handleSearch = (value) => {
    setSearchQuery(value)
    if (value.trim()) {
      setCharFilter(null)
      setCatFilter(null)
    }
  }

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      return products.filter(p => p.name.toLowerCase().includes(q))
    }
    return products.filter(p => {
      if (charFilter && p.character !== charFilter) return false
      if (catFilter && p.category !== catFilter) return false
      return true
    })
  }, [charFilter, catFilter, searchQuery])

  const characters = ['산리오', '치이카와', '해리포터', '죠죠', '뱅드림', '기타']
  const categories = ['가챠', '피규어', '키링', '인형키링', '뱃지', '잡화', '다꾸']

  const isFiltered = charFilter || catFilter
  const isSearching = searchQuery.trim().length > 0

  return (
    <div className="min-h-screen bg-[#FFF5F8]">

      <div className="sticky top-0 z-20 bg-white shadow-sm">
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

        <div className="max-w-4xl mx-auto px-4 pb-2.5">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              placeholder="상품명 검색..."
              className="w-full pl-8 pr-8 py-2 text-sm rounded-full border border-pink-100 bg-pink-50/50 outline-none focus:border-pink-300 focus:bg-white transition placeholder:text-gray-300"
            />
            {isSearching && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-400 text-sm"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className={`transition-opacity ${isSearching ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
          <FilterBar
            characters={characters}
            categories={categories}
            charFilter={charFilter}
            catFilter={catFilter}
            setCharFilter={setCharFilter}
            setCatFilter={setCatFilter}
          />
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 pb-16 pt-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-400">
            {isSearching
              ? <><span className="text-pink-400 font-medium">"{searchQuery}"</span> 검색 결과 <span className="font-semibold text-gray-500">{filtered.length}</span>개</>
              : <>상품 <span className="font-semibold text-gray-500">{filtered.length}</span>개</>
            }
          </p>
          {isFiltered && !isSearching && (
            <button
              onClick={() => { setCharFilter(null); setCatFilter(null) }}
              className="text-xs text-pink-400 hover:underline"
            >
              필터 초기화 ✕
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-300">
            <p className="text-5xl mb-3">🔍</p>
            <p className="text-sm">
              {isSearching ? `"${searchQuery}"에 해당하는 상품이 없어요` : '해당하는 상품이 없어요'}
            </p>
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
                priceOverride={priceOverrides[product.id] ? Number(priceOverrides[product.id]) : null}
                onUpdatePrice={updatePrice}
              />
            ))}
          </div>
        )}
      </main>

      {showAdminModal && (
        <AdminModal
          onSuccess={(pw) => { setIsAdmin(true); setAdminPassword(pw); setShowAdminModal(false) }}
          onClose={() => setShowAdminModal(false)}
        />
      )}
    </div>
  )
}
