"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import products from "@/data/products";
import FilterBar from "@/components/FilterBar";
import ProductCard from "@/components/ProductCard";
import AdminModal from "@/components/AdminModal";
import CartDrawer from "@/components/CartDrawer";
import SoldOutDrawer from "@/components/SoldOutDrawer";
import LazyCard from "@/components/LazyCard";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export default function Home() {
  const { save: saveAdminPw, clear: clearAdminPw, getSaved } = useAdminAuth();
  const [charFilter, setCharFilter] = useState(null);
  const [catFilter, setCatFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");

  // useCallback에서 최신 값을 읽기 위한 ref
  const adminPasswordRef = useRef(adminPassword);
  const soldOutIdsRef = useRef(new Set());
  useEffect(() => { adminPasswordRef.current = adminPassword; }, [adminPassword]);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [soldOutIds, setSoldOutIds] = useState(new Set());
  const [priceOverrides, setPriceOverrides] = useState({});
  const [cartItems, setCartItems] = useState({});
  const [showCart, setShowCart] = useState(false);

  // 품절 숨기기 (일반 구매자용)
  const [hideSoldOut, setHideSoldOut] = useState(false);

  // 품절 모드
  const [quickMode, setQuickMode] = useState(false);
  const [pendingSoldOut, setPendingSoldOut] = useState(new Set());
  const [confirmingQuick, setConfirmingQuick] = useState(false);
  const [showSoldOut, setShowSoldOut] = useState(false);

  // 관리자 세션 복원
  useEffect(() => {
    const saved = getSaved();
    if (saved) {
      setAdminPassword(saved);
      setIsAdmin(true);
    }
  }, []);

  // 품절 상태 불러오기 (Redis)
  useEffect(() => {
    fetch("/api/soldout")
      .then((r) => r.json())
      .then((ids) => {
        const s = new Set(ids);
        soldOutIdsRef.current = s;
        setSoldOutIds(s);
      })
      .catch(() => {});
  }, []);

  // 관리자 모드 진입/퇴장 시 품절처리 모드 자동 연동
  useEffect(() => {
    if (isAdmin) {
      setPendingSoldOut(new Set(soldOutIds));
      setQuickMode(true);
    } else {
      setQuickMode(false);
      setPendingSoldOut(new Set());
      setShowSoldOut(false);
      setCharFilter(null);
      setCatFilter(null);
    }
  }, [isAdmin]);

  // 가격 오버라이드 불러오기
  useEffect(() => {
    fetch("/api/prices")
      .then((r) => r.json())
      .then((data) => setPriceOverrides(data))
      .catch(() => {});
  }, []);

  // 장바구니 불러오기
  useEffect(() => {
    const saved = localStorage.getItem("dot_cart");
    if (saved) setCartItems(JSON.parse(saved));
  }, []);

  // 단일 품절 토글 (관리자 카드 버튼)
  const toggleSoldOut = useCallback(async (id) => {
    const current = soldOutIdsRef.current;
    const next = new Set(current);
    next.has(id) ? next.delete(id) : next.add(id);
    const res = await fetch("/api/soldout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: adminPasswordRef.current, ids: [...next] }),
    });
    if (res.ok) {
      soldOutIdsRef.current = next;
      setSoldOutIds(next);
    }
  }, []);

  // 빠른 품절 모드 진입
  const enterQuickMode = () => {
    setPendingSoldOut(new Set(soldOutIds));
    setQuickMode(true);
  };

  // 품절 선택 초기화 (확정된 상태로 되돌리기)
  const cancelQuickMode = () => {
    setPendingSoldOut(new Set(soldOutIds));
  };

  // 빠른 품절 모드 - 카드 탭
  const toggleQuickSelect = useCallback((id) => {
    setPendingSoldOut((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  // 이번 거래에서 새로 선택한 항목 (pendingSoldOut - soldOutIds)
  const sessionItems = useMemo(() => {
    const items = new Set();
    for (const id of pendingSoldOut) {
      if (!soldOutIds.has(id)) items.add(id);
    }
    return items;
  }, [pendingSoldOut, soldOutIds]);

  // 품절 해제 예정 항목 (soldOutIds - pendingSoldOut)
  const removedItems = useMemo(() => {
    const items = new Set();
    for (const id of soldOutIds) {
      if (!pendingSoldOut.has(id)) items.add(id);
    }
    return items;
  }, [pendingSoldOut, soldOutIds]);

  // 빠른 품절 모드 - 확정 후 세션 초기화
  const confirmQuickSoldOut = async () => {
    setConfirmingQuick(true);
    const res = await fetch("/api/soldout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password: adminPassword,
        ids: [...pendingSoldOut],
      }),
    });
    if (res.ok) {
      const next = new Set(pendingSoldOut);
      setSoldOutIds(next);
      setPendingSoldOut(new Set(next)); // 세션 초기화 → 다음 거래 깨끗하게 시작
    }
    setConfirmingQuick(false);
  };

  const updatePrice = useCallback(async (id, newPrice) => {
    const isReset = newPrice === null;
    const pw = adminPasswordRef.current;
    const res = await fetch("/api/prices", {
      method: isReset ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        isReset ? { password: pw, id } : { password: pw, id, price: newPrice },
      ),
    });
    if (res.ok) {
      setPriceOverrides((prev) => {
        const next = { ...prev };
        if (isReset) delete next[id];
        else next[id] = newPrice;
        return next;
      });
    }
  }, []);

  const updateCart = useCallback((id, qty) => {
    setCartItems((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      localStorage.setItem("dot_cart", JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleCart = useCallback((id) => {
    setCartItems((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = 1;
      localStorage.setItem("dot_cart", JSON.stringify(next));
      return next;
    });
  }, []);

  const cartCount = Object.values(cartItems).reduce((sum, q) => sum + q, 0);

  const handleSearch = (value) => {
    setSearchQuery(value);
    if (value.trim()) {
      setCharFilter(null);
      setCatFilter(null);
    }
  };

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      return products.filter((p) => {
        if (hideSoldOut && soldOutIds.has(p.id)) return false;
        return p.name.toLowerCase().includes(q);
      });
    }
    return products.filter((p) => {
      if (showSoldOut) return soldOutIds.has(p.id);
      if (hideSoldOut && soldOutIds.has(p.id)) return false;
      if (charFilter && p.character !== charFilter) return false;
      if (catFilter && p.category !== catFilter) return false;
      return true;
    });
  }, [charFilter, catFilter, searchQuery, showSoldOut, soldOutIds, hideSoldOut]);

  const characters = ["산리오", "치이카와", "해리포터", "죠죠", "뱅드림", "기타"];
  const categories = ["가챠", "피규어", "키링", "인형키링", "뱃지", "잡화", "다꾸"];

  const isFiltered = charFilter || catFilter;
  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="min-h-screen bg-[#FFF5F8]">
      <div className="sticky top-0 z-20 bg-white shadow-sm">
        <header className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1
              className="text-lg font-bold text-pink-400 leading-tight"
              style={{ fontFamily: "'Library', sans-serif" }}
            >
              DOT 마켓
            </h1>
            <p className="text-[9px] text-gray-400">3/31(화) 10AM~4PM | 일일 돗자리마켓</p>
          </div>
          <div className="flex items-center gap-2">
            {/* 장바구니 버튼 */}
            {!isAdmin && (
              <button
                onClick={() => setShowCart(true)}
                className="relative text-gray-400 hover:text-pink-400 transition p-1"
              >
                <span className="text-xl">🛒</span>
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-pink-400 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>
            )}
            {isAdmin && (
              <Link
                href="/settlement"
                className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-400 hover:bg-gray-50 transition"
              >
                📊 결산
              </Link>
            )}
            <button
              onClick={() => {
                if (isAdmin) {
                  setIsAdmin(false);
                  clearAdminPw();
                } else {
                  setShowAdminModal(true);
                }
              }}
              className={`text-xs px-3 py-1.5 rounded-full border transition ${
                isAdmin
                  ? "bg-pink-400 text-white border-pink-400"
                  : "text-gray-300 border-gray-200 hover:border-gray-300 hover:text-gray-400"
              }`}
            >
              {isAdmin ? "관리자 모드 ON" : "관리자"}
            </button>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 pb-2.5">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="상품명 검색..."
              className="w-full pl-8 pr-8 py-2 text-sm rounded-full border border-pink-100 bg-pink-50/50 outline-none focus:border-pink-300 focus:bg-white transition placeholder:text-gray-300"
            />
            {isSearching && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-400 text-sm"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className={`transition-opacity ${isSearching ? "opacity-30 pointer-events-none" : "opacity-100"}`}>
          <FilterBar
            characters={characters}
            categories={categories}
            charFilter={charFilter}
            catFilter={catFilter}
            setCharFilter={setCharFilter}
            setCatFilter={setCatFilter}
            isAdmin={isAdmin}
            showSoldOut={showSoldOut}
            setShowSoldOut={setShowSoldOut}
            hideSoldOut={hideSoldOut}
            setHideSoldOut={setHideSoldOut}
          />
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 pb-16 pt-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-400">
            {isSearching ? (
              <>
                <span className="text-pink-400 font-medium">"{searchQuery}"</span> 검색 결과{" "}
                <span className="font-semibold text-gray-500">{filtered.length}</span>개
              </>
            ) : (
              <>
                상품 <span className="font-semibold text-gray-500">{filtered.length}</span>개
              </>
            )}
          </p>
          <div className="flex items-center gap-3">
            {!isAdmin && (
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hideSoldOut}
                  onChange={() => setHideSoldOut(v => !v)}
                  className="accent-gray-500 w-3.5 h-3.5 cursor-pointer"
                />
                <span className="text-xs text-gray-400 whitespace-nowrap">품절 숨기기</span>
              </label>
            )}
            {isFiltered && !isSearching && (
              <button
                onClick={() => {
                  setCharFilter(null);
                  setCatFilter(null);
                }}
                className="text-xs text-pink-400 hover:underline"
              >
                필터 초기화 ✕
              </button>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-300">
            <p className="text-5xl mb-3">🔍</p>
            <p className="text-sm">
              {isSearching ? `"${searchQuery}"에 해당하는 상품이 없어요` : "해당하는 상품이 없어요"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filtered.map((product) => (
              <LazyCard key={product.id}>
                <ProductCard
                  product={product}
                  isAdmin={isAdmin}
                  isSoldOut={soldOutIds.has(product.id)}
                  onToggleSoldOut={toggleSoldOut}
                  priceOverride={priceOverrides[product.id] ? Number(priceOverrides[product.id]) : null}
                  onUpdatePrice={updatePrice}
                  cartQty={cartItems[product.id] || 0}
                  onToggleCart={toggleCart}
                  quickMode={quickMode}
                  isQuickSelected={sessionItems.has(product.id)}
                  isQuickRemoved={removedItems.has(product.id)}
                  onQuickToggle={toggleQuickSelect}
                />
              </LazyCard>
            ))}
          </div>
        )}
      </main>

      {isAdmin && (
        <SoldOutDrawer
          sessionItems={sessionItems}
          removedItems={removedItems}
          priceOverrides={priceOverrides}
          onToggleItem={toggleQuickSelect}
          onConfirm={confirmQuickSoldOut}
          onCancel={cancelQuickMode}
          confirming={confirmingQuick}
        />
      )}

      {showAdminModal && (
        <AdminModal
          onSuccess={(pw) => {
            setIsAdmin(true);
            setAdminPassword(pw);
            setShowAdminModal(false);
            saveAdminPw(pw);
          }}
          onClose={() => setShowAdminModal(false)}
        />
      )}

      {showCart && (
        <CartDrawer
          cartItems={cartItems}
          priceOverrides={priceOverrides}
          onUpdateQty={updateCart}
          onClose={() => setShowCart(false)}
        />
      )}
    </div>
  );
}
