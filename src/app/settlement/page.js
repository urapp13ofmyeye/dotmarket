"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import products from "@/data/products";

export default function SettlementPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [soldOutIds, setSoldOutIds] = useState([]);
  const [priceOverrides, setPriceOverrides] = useState({});
  const [openSellers, setOpenSellers] = useState({});

  const fetchAndAuth = async (pw) => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      if (!res.ok) {
        setError(true);
        setLoading(false);
        return;
      }
      const [soldoutRes, pricesRes] = await Promise.all([
        fetch("/api/soldout"),
        fetch("/api/prices"),
      ]);
      setSoldOutIds(await soldoutRes.json());
      setPriceOverrides(await pricesRes.json());
      setAuthed(true);
    } catch {
      setError(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    const saved = sessionStorage.getItem("dot_admin_pw");
    if (saved) {
      fetchAndAuth(saved).finally(() => setChecking(false));
    } else {
      setChecking(false);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    fetchAndAuth(password);
  };

  const toggleSeller = (seller) => {
    setOpenSellers((prev) => ({ ...prev, [seller]: !prev[seller] }));
  };

  const sellerList = useMemo(() => {
    const allSellers = [...new Set(products.map((p) => p.seller || "미지정"))];

    return allSellers
      .map((seller) => {
        const soldItems = products
          .filter(
            (p) =>
              (p.seller || "미지정") === seller && soldOutIds.includes(p.id),
          )
          .map((p) => {
            const price = priceOverrides[p.id]
              ? Number(priceOverrides[p.id])
              : p.price;
            return { ...p, finalPrice: price };
          });
        const count = soldItems.length;
        const subtotal = soldItems.reduce((sum, p) => sum + p.finalPrice, 0);
        return { seller, items: soldItems, count, subtotal };
      })
      .sort((a, b) => b.subtotal - a.subtotal);
  }, [soldOutIds, priceOverrides]);

  const grandTotal = sellerList.reduce((sum, s) => sum + s.subtotal, 0);
  const grandCount = sellerList.reduce((sum, s) => sum + s.count, 0);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#FFF5F8] flex items-center justify-center">
        <p className="text-sm text-gray-300">불러오는 중...</p>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#FFF5F8] flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-xs">
          <p className="text-center text-2xl mb-1">📊</p>
          <h2 className="text-center text-sm font-bold text-gray-600 mb-1">
            판매 결산
          </h2>
          <p className="text-center text-xs text-gray-400 mb-4">
            관리자 비밀번호를 입력하세요
          </p>
          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              className={`border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 transition ${
                error
                  ? "border-red-300 focus:ring-red-100"
                  : "border-pink-200 focus:ring-pink-100"
              }`}
              autoFocus
              disabled={loading}
            />
            {error && (
              <p className="text-xs text-red-400 text-center -mt-1">
                비밀번호가 틀렸어요
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="bg-pink-400 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-pink-500 transition disabled:opacity-60"
            >
              {loading ? "확인 중..." : "확인"}
            </button>
            <Link
              href="/"
              className="text-gray-300 text-xs text-center hover:text-gray-400 transition"
            >
              돌아가기
            </Link>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF5F8]">
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <header className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-base font-bold text-pink-400">📊 판매 결산</h1>
          <Link
            href="/"
            className="text-xs text-gray-400 hover:text-gray-500 border border-gray-200 px-3 py-1.5 rounded-full transition"
          >
            ← 돌아가기
          </Link>
        </header>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-5 pb-16 flex flex-col gap-3">
        {/* 판매자별 카드 */}
        {sellerList.map(({ seller, items, count, subtotal }) => {
          const isOpen = openSellers[seller];
          const hasSales = count > 0;
          return (
            <div
              key={seller}
              className="bg-white rounded-2xl shadow-sm border border-pink-100 overflow-hidden"
            >
              {/* 판매자 헤더 (항상 표시) */}
              <button
                onClick={() => hasSales && toggleSeller(seller)}
                className={`w-full px-5 py-3.5 flex items-center justify-between ${hasSales ? "cursor-pointer active:bg-gray-50" : "cursor-default"}`}
              >
                <span className="text-sm font-medium text-gray-700">
                  {seller}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">{count}개</span>
                  <span className="text-sm font-bold w-28 text-right text-pink-500">
                    {subtotal.toLocaleString()}원
                  </span>
                </div>
              </button>

              {/* 품목 목록 (토글) */}
              {isOpen && hasSales && (
                <div className="border-t border-gray-50 divide-y divide-gray-50">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="px-5 py-2.5 flex items-center justify-between bg-gray-50/50"
                    >
                      <span className="text-xs text-gray-500">{item.name}</span>
                      <span className="text-xs font-medium text-gray-500 w-24 text-right">
                        {item.finalPrice.toLocaleString()}원
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
}
