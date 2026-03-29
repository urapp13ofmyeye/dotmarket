"use client";

import { useState } from "react";
import ImageCarousel from "./ImageCarousel";
import { getProductImages } from "@/utils/images";

const CHAR_EMOJI = {
  산리오: "🎀",
  치이카와: "🐭",
  해리포터: "⚡",
  죠죠: "👊",
  뱅드림: "🎸",
  기타: "⭐",
};

const CHAR_BG = {
  산리오: "bg-pink-50",
  치이카와: "bg-yellow-50",
  해리포터: "bg-amber-50",
  죠죠: "bg-purple-50",
  뱅드림: "bg-rose-50",
  기타: "bg-emerald-50",
};

export default function ProductCard({
  product,
  isAdmin,
  isSoldOut,
  onToggleSoldOut,
  priceOverride,
  onUpdatePrice,
  cartQty,
  onToggleCart,
}) {
  const { id, name, price, character, category, seller, imageCount } = product;
  const emoji = CHAR_EMOJI[character] || "⭐";
  const bg = CHAR_BG[character] || "bg-gray-50";
  const images = getProductImages(id, imageCount);

  const displayPrice = priceOverride ?? price;
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  const startEdit = () => {
    setEditValue(String(displayPrice));
    setEditing(true);
  };

  const savePrice = async () => {
    const newPrice = parseInt(editValue);
    if (isNaN(newPrice) || newPrice <= 0 || newPrice === displayPrice) {
      setEditing(false);
      return;
    }
    setSaving(true);
    // 원래 가격으로 복원 시 override 삭제
    await onUpdatePrice(id, newPrice === price ? null : newPrice);
    setSaving(false);
    setEditing(false);
  };

  const inCart = cartQty > 0;

  return (
    <div
      className={`relative rounded-2xl bg-white overflow-hidden flex flex-col transition-all duration-200 ${
        isSoldOut
          ? "opacity-60 border border-pink-100 shadow-sm"
          : inCart
          ? "border-2 border-pink-400 shadow-md shadow-pink-100"
          : "border border-pink-100 shadow-sm hover:shadow-md"
      }`}
    >
      {/* 이미지 캐러셀 */}
      <div className="relative">
        <ImageCarousel images={images} fallbackEmoji={emoji} bg={bg} />
        {isSoldOut && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center pointer-events-none">
            <span className="bg-gray-500 text-white text-xs font-bold px-3 py-1 rounded-full -rotate-12 shadow">
              품절
            </span>
          </div>
        )}
        {/* 장바구니 아이콘 버튼 (우측 상단) */}
        {!isAdmin && !isSoldOut && (
          <button
            onClick={onToggleCart}
            className={`absolute top-1.5 right-1.5 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
              inCart
                ? 'bg-pink-400 shadow-md'
                : 'bg-white/80 shadow-sm'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
              className={`w-4 h-4 transition-colors duration-200 ${inCart ? 'text-white' : 'text-gray-300'}`}
            >
              <path d="M2.25 2.25a.75.75 0 0 0 0 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 0 0-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 0 0 0-1.5H5.378A2.25 2.25 0 0 1 7.5 15h11.218a.75.75 0 0 0 .674-.421 60.358 60.358 0 0 0 2.96-7.228.75.75 0 0 0-.525-.965A60.864 60.864 0 0 0 5.68 4.509l-.232-.867A1.875 1.875 0 0 0 3.636 2.25H2.25ZM16.5 18a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM7.5 18a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
            </svg>
          </button>
        )}
      </div>

      {/* 상품 정보 */}
      <div className="p-2.5 flex flex-col gap-0.5 flex-1">
        <span className="text-[10px] text-gray-400">{category}</span>
        <p className="text-sm font-medium text-gray-700 leading-snug line-clamp-2">{name}</p>

        {/* 가격 - 관리자 모드에서 탭하면 수정 가능 */}
        {isAdmin && editing ? (
          <div className="flex items-center gap-1 mt-auto pt-1">
            <input
              type="number"
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onBlur={savePrice}
              onKeyDown={e => e.key === 'Enter' && savePrice()}
              className="w-full text-sm font-bold text-pink-400 border-b border-pink-300 outline-none bg-transparent"
              autoFocus
              disabled={saving}
            />
            <span className="text-sm font-bold text-pink-400 shrink-0">원</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 mt-auto pt-1">
            <p className={`text-sm font-bold ${priceOverride ? 'text-orange-400' : 'text-pink-400'}`}>
              {displayPrice.toLocaleString()}원
            </p>
            {priceOverride && (
              <span className="text-[9px] text-gray-300 line-through">{price.toLocaleString()}</span>
            )}
            {isAdmin && (
              <button
                onClick={startEdit}
                className="ml-auto text-[10px] text-gray-300 hover:text-gray-400 transition"
              >
                ✏️
              </button>
            )}
          </div>
        )}

        {isAdmin && seller && (
          <p className="text-[10px] text-gray-300 mt-0.5">판매자: {seller}</p>
        )}
      </div>

      {/* 관리자 품절 토글 */}
      {isAdmin && (
        <button
          onClick={onToggleSoldOut}
          className={`w-full text-xs py-2 font-medium border-t transition ${
            isSoldOut
              ? "bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-400 border-gray-100"
              : "bg-pink-50 text-pink-400 hover:bg-pink-100 border-pink-100"
          }`}
        >
          {isSoldOut ? "↩ 품절 취소" : "품절 처리"}
        </button>
      )}
    </div>
  );
}
