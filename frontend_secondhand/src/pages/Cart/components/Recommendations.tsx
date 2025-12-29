import type { RecommendationItem } from "../types";

type Props = {
  items: RecommendationItem[];
};

const formatVND = (v: number) => new Intl.NumberFormat("vi-VN").format(v) + "₫";

export default function Recommendations({ items }: Props) {
  return (
    <div className="mt-16 mb-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-text-main dark:text-white">Có thể bạn cũng thích</h2>
        <a className="text-primary font-medium hover:underline text-sm flex items-center gap-1" href="#">
          Xem tất cả
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((it, idx) => (
          <div key={it.id} className={["group cursor-pointer", idx === 4 ? "hidden lg:block" : ""].join(" ")}>
            <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-gray-100 mb-3">
              <div
                className="bg-center bg-no-repeat bg-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                style={{ backgroundImage: `url("${it.imageUrl}")` }}
              />
              <button
                type="button"
                className="absolute top-2 right-2 p-2 bg-white/80 dark:bg-black/50 hover:bg-primary hover:text-black rounded-full text-gray-700 dark:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">favorite</span>
              </button>
            </div>

            <h3 className="font-medium text-text-main dark:text-white text-sm truncate">{it.title}</h3>

            <div className="flex items-center gap-2 mt-1">
              <span className="text-primary font-bold text-base">{formatVND(it.price)}</span>
              {typeof it.oldPrice === "number" ? (
                <span className="text-xs text-gray-400 line-through">{it.oldPrice >= 1000 ? formatVND(it.oldPrice) : it.oldPrice}</span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
