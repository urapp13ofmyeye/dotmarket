"use client";

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
}) {
  const { id, name, price, character, category, seller, imageCount } = product;
  const emoji = CHAR_EMOJI[character] || "⭐";
  const bg = CHAR_BG[character] || "bg-gray-50";
  const images = getProductImages(id, imageCount);

  return (
    <div
      className={`relative rounded-2xl bg-white border border-pink-100 shadow-sm overflow-hidden flex flex-col transition ${isSoldOut ? "opacity-60" : "hover:shadow-md"}`}
    >
      {/* 이미지 캐러셀 (이미지 없으면 이모지 표시) */}
      <div className="relative">
        <ImageCarousel images={images} fallbackEmoji={emoji} bg={bg} />

        {/* 품절 오버레이 */}
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
        <p className="text-sm font-medium text-gray-700 leading-snug line-clamp-2">
          {name}
        </p>
        <p className="text-sm font-bold text-pink-400 mt-auto pt-1">
          {price.toLocaleString()}원
        </p>
        {isAdmin && seller && (
          <p className="text-[10px] text-gray-300 mt-0.5">판매자: {seller}</p>
        )}
      </div>

      {/* 관리자 품절 토글 버튼 */}
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
