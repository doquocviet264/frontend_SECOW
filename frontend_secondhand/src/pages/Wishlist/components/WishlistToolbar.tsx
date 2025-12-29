export default function WishlistToolbar() {
  const TABS = ["Tất cả", "Quần áo", "Phụ kiện", "Giày dép", "Điện tử"];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sticky top-0 bg-gray-50 dark:bg-gray-900 z-10 py-2">
      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 sm:pb-0">
        {TABS.map((tab, idx) => (
          <button
            key={tab}
            className={`
              px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors
              ${idx === 0 
                ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900" 
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-gray-400"
              }
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Sort Dropdown */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <span>Sắp xếp:</span>
        <button className="flex items-center gap-1 font-bold text-gray-900 dark:text-white hover:text-emerald-500 transition-colors">
          Mới thêm gần đây
          <span className="material-symbols-outlined text-[18px]">expand_more</span>
        </button>
      </div>
    </div>
  );
}