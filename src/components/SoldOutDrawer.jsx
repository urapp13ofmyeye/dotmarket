"use client";

import { useEffect, useRef, useState } from "react";
import products from "@/data/products";

export default function SoldOutDrawer({
  sessionItems,
  removedItems,
  priceOverrides,
  onToggleItem,
  onConfirm,
  onCancel,
  confirming,
}) {
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(false);
  const touchStartY = useRef(null);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const selectedList = [...sessionItems]
    .map((id) => {
      const product = products.find((p) => p.id === Number(id));
      if (!product) return null;
      const price = priceOverrides[id]
        ? Number(priceOverrides[id])
        : product.price;
      return { ...product, price };
    })
    .filter(Boolean);

  const total = selectedList.reduce((sum, item) => sum + item.price, 0);

  const removedList = [...(removedItems || [])]
    .map((id) => {
      const product = products.find((p) => p.id === Number(id));
      if (!product) return null;
      const price = priceOverrides[id]
        ? Number(priceOverrides[id])
        : product.price;
      return { ...product, price };
    })
    .filter(Boolean);

  const handleCancel = () => {
    onCancel();
  };

  const handleConfirm = async () => {
    await onConfirm();
  };

  const onTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e) => {
    if (touchStartY.current === null) return;
    const delta = e.changedTouches[0].clientY - touchStartY.current;
    if (delta > 60) setExpanded(false);
    if (delta < -60) setExpanded(true);
    touchStartY.current = null;
  };

  return (
    <>
      {/* 배경 딤 (확장 시) */}
      {expanded && (
        <div
          className="fixed inset-0 z-30 bg-black/20 transition-opacity duration-300"
          onClick={() => setExpanded(false)}
        />
      )}

      <div
        className="fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 ease-out"
        style={{ transform: visible ? "translateY(0)" : "translateY(100%)" }}
      >
        <div className="bg-white border-t-2 border-red-100 shadow-2xl rounded-t-2xl max-w-4xl mx-auto">
          {/* 핸들 + 요약 바 (항상 표시) */}
          <button
            className="w-full px-5 pt-3 pb-3 flex items-center justify-between"
            onClick={() => setExpanded((v) => !v)}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-gray-200 rounded-full mr-1" />
              <span className="text-xs font-bold text-red-500">품절 목록</span>
            </div>
            <div className="flex items-center gap-3">
              {selectedList.length > 0 && (
                <span className="text-sm font-bold text-red-500">
                  {selectedList.length}개 · {total.toLocaleString()}원
                </span>
              )}
              <span className="text-gray-300 text-xs">
                {expanded ? "▼" : "▲"}
              </span>
            </div>
          </button>

          {/* 확장 영역: 선택 목록 */}
          <div
            className="overflow-hidden transition-all duration-300 ease-out"
            style={{ maxHeight: expanded ? "50vh" : "0px" }}
          >
            <div
              className="overflow-y-auto px-5 pb-2 flex flex-col gap-2.5"
              style={{ maxHeight: "40vh" }}
            >
              {selectedList.length === 0 && removedList.length === 0 ? (
                <div className="text-center py-8 text-gray-300">
                  <p className="text-sm">선택된 상품이 없어요</p>
                  <p className="text-xs mt-1">
                    카드를 탭해서 품절/해제할 상품을 선택하세요
                  </p>
                </div>
              ) : (
                <>
                  {selectedList.length > 0 && (
                    <>
                      <p className="text-[10px] font-bold text-red-400 mt-1">
                        품절 처리
                      </p>
                      {selectedList.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-gray-400">
                              {item.category}
                            </p>
                            <p className="text-sm font-medium text-gray-700 leading-snug line-clamp-1">
                              {item.name}
                            </p>
                            <p className="text-sm font-bold text-red-400 mt-0.5">
                              {item.price.toLocaleString()}원
                            </p>
                          </div>
                          <button
                            onClick={() => onToggleItem(item.id)}
                            className="shrink-0 w-7 h-7 rounded-full border border-gray-200 text-gray-300 flex items-center justify-center hover:border-red-300 hover:text-red-400 transition text-sm"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </>
                  )}
                  {removedList.length > 0 && (
                    <>
                      <p className="text-[10px] font-bold text-blue-400 mt-1 text-right">
                        품절 해제
                      </p>
                      {removedList.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 opacity-70"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-gray-400">
                              {item.category}
                            </p>
                            <p className="text-sm font-medium text-gray-500 leading-snug line-clamp-1 line-through">
                              {item.name}
                            </p>
                            <p className="text-sm font-bold text-blue-400 mt-0.5">
                              {item.price.toLocaleString()}원
                            </p>
                          </div>
                          <button
                            onClick={() => onToggleItem(item.id)}
                            className="shrink-0 w-7 h-7 rounded-full border border-gray-200 text-gray-300 flex items-center justify-center hover:border-blue-300 hover:text-blue-400 transition text-sm"
                          >
                            ↩
                          </button>
                        </div>
                      ))}
                    </>
                  )}
                </>
              )}
            </div>

            {/* 합계 */}
            {selectedList.length > 0 && (
              <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  판매 합계 ({selectedList.length}개)
                </span>
                <span className="text-base font-bold text-red-500">
                  {total.toLocaleString()}원
                </span>
              </div>
            )}
          </div>

          {/* 하단 버튼 */}
          <div className="px-5 pb-6 pt-2 flex gap-2.5">
            <button
              onClick={handleCancel}
              className="w-20 text-sm py-3 rounded-2xl border border-gray-200 text-gray-400 hover:bg-gray-50 transition shrink-0"
            >
              취소
            </button>
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="flex-1 text-sm bg-red-400 text-white font-bold py-3 rounded-2xl hover:bg-red-500 transition disabled:opacity-50"
            >
              {confirming ? "저장 중..." : "품절 관리"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
