import { Link } from "react-router-dom";
import type { RecommendationItem } from "../types";

type Props = {
  items: RecommendationItem[];
  loading?: boolean;
};

const formatVND = (v: number) => new Intl.NumberFormat("vi-VN").format(v) + "₫";

export default function Recommendations({ items, loading = false }: Props) {
  // Không hiển thị nếu không có items và không đang loading
  if (!loading && items.length === 0) {
    return null;
  }

  return (
    <div className="mt-16 mb-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-text-main dark:text-white">Có thể bạn cũng thích</h2>
        <Link
          to="/products"
          className="text-primary font-medium hover:underline text-sm flex items-center gap-1"
        >
          Xem tất cả
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className={idx === 4 ? "hidden lg:block" : ""}>
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 mb-3 animate-pulse" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((it, idx) => (
            <Link
              key={it.id}
              to={`/products/${it.id}`}
              className={["group cursor-pointer", idx === 4 ? "hidden lg:block" : ""].join(" ")}
            >
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-3">
                <div
                  className="bg-center bg-no-repeat bg-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                  style={{ backgroundImage: `url("${it.imageUrl}")` }}
                />
              </div>

              <h3 className="font-medium text-text-main dark:text-white text-sm truncate">{it.title}</h3>

              <div className="flex items-center gap-2 mt-1">
                <span className="text-primary font-bold text-base">{formatVND(it.price)}</span>
                {typeof it.oldPrice === "number" && it.oldPrice > 0 ? (
                  <span className="text-xs text-gray-400 line-through">
                    {it.oldPrice >= 1000 ? formatVND(it.oldPrice) : it.oldPrice}
                  </span>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
