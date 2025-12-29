import type { WishlistItem } from "../types";

type Props = {
  item: WishlistItem;
};

const formatVND = (v: number) => new Intl.NumberFormat("vi-VN").format(v) + "₫";

export default function WishlistItemCard({ item }: Props) {
  // Map màu badge
  const badgeColors = {
    green: "bg-emerald-500 text-white",
    orange: "bg-amber-500 text-white", // Dành cho "Hàng sưu tầm"
    blue: "bg-blue-500 text-white",
  };

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl p-3 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 relative flex flex-col h-full">
      
      {/* 1. Image Area */}
      <div className="aspect-[4/5] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 relative mb-3">
        <img
          src={item.imageUrl}
          alt={item.name}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 
            ${item.isSoldOut ? "opacity-50 grayscale" : ""}
          `}
        />

        {/* Delete Button (Top Right) */}
        <button className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-white transition-colors shadow-sm z-10">
          <span className="material-symbols-outlined text-[18px]">delete</span>
        </button>

        {/* Status Badge (Top Left) */}
        {item.badge && !item.isSoldOut && (
          <span className={`absolute bottom-2 left-2 text-[10px] font-bold px-2 py-1 rounded shadow-sm ${badgeColors[item.badge.color]}`}>
            {item.badge.text}
          </span>
        )}

        {/* Sold Out Overlay */}
        {item.isSoldOut && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-black/70 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg uppercase tracking-wider">
              Đã bán
            </span>
          </div>
        )}
      </div>

      {/* 2. Content Info */}
      <div className="flex-1 flex flex-col">
        <div className="mb-1">
          <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1 text-sm sm:text-base">
            {item.name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {item.brand} • {item.category}
          </p>
        </div>

        <div className="flex items-center gap-2 mt-2 mb-4">
          <span className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {formatVND(item.price)}
          </span>
          {item.originalPrice && (
            <span className="text-xs text-gray-400 line-through">
              {formatVND(item.originalPrice)}
            </span>
          )}
        </div>

        {/* 3. Action Button (Modified: Only Add to Cart) */}
        <div className="mt-auto">
          <button
            disabled={item.isSoldOut}
            className={`
              w-full h-10 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all
              ${item.isSoldOut
                ? "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-gray-100 dark:bg-gray-700 hover:bg-emerald-500 hover:text-white text-gray-900 dark:text-white group-hover:bg-gray-200 dark:group-hover:bg-gray-600"
              }
            `}
          >
            {item.isSoldOut ? (
              "Hết hàng"
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
                Thêm vào giỏ
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}