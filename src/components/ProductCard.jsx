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

  return (
    <div
      className={`relative rounded-2xl bg-white border border-pink-100 shadow-sm overflow-hidden flex flex-col transition ${isSoldOut ? "opacity-60" : "hover:shadow-md"}`}
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
