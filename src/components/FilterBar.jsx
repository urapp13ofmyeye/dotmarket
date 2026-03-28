"use client";

const CHAR_STYLE = {
  산리오: {
    on: "bg-pink-300 text-white",
    off: "bg-pink-50 text-pink-400 border border-pink-200",
  },
  치이카와: {
    on: "bg-yellow-300 text-white",
    off: "bg-yellow-50 text-yellow-500 border border-yellow-200",
  },
  해리포터: {
    on: "bg-amber-400 text-white",
    off: "bg-amber-50 text-amber-500 border border-amber-200",
  },
  죠죠: {
    on: "bg-purple-300 text-white",
    off: "bg-purple-50 text-purple-400 border border-purple-200",
  },
  뱅드림: {
    on: "bg-rose-300 text-white",
    off: "bg-rose-50 text-rose-400 border border-rose-200",
  },
  기타: {
    on: "bg-emerald-300 text-white",
    off: "bg-emerald-50 text-emerald-500 border border-emerald-200",
  },
};

export default function FilterBar({
  characters,
  categories,
  charFilter,
  catFilter,
  setCharFilter,
  setCatFilter,
}) {
  return (
    <div className="border-b border-pink-100">
      {/* 캐릭터 필터 */}
      <div className="scroll-x">
        <div className="flex gap-2 px-4 py-2.5 min-w-max">
          <button
            onClick={() => setCharFilter(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition whitespace-nowrap ${
              !charFilter
                ? "bg-pink-400 text-white"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            전체
          </button>
          {characters.map((char) => {
            const s = CHAR_STYLE[char] || CHAR_STYLE["기타"];
            const active = charFilter === char;
            return (
              <button
                key={char}
                onClick={() => setCharFilter(active ? null : char)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition whitespace-nowrap ${active ? s.on : s.off}`}
              >
                {char}
              </button>
            );
          })}
        </div>
      </div>

      {/* 품목 필터 */}
      <div className="scroll-x border-t border-pink-50">
        <div className="flex gap-2 px-4 py-2.5 min-w-max">
          <button
            onClick={() => setCatFilter(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition whitespace-nowrap ${
              !catFilter
                ? "bg-purple-300 text-white"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            전체
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCatFilter(catFilter === cat ? null : cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition whitespace-nowrap ${
                catFilter === cat
                  ? "bg-purple-300 text-white"
                  : "bg-purple-50 text-purple-400 border border-purple-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
