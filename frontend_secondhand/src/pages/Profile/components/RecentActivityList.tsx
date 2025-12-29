import type { ActivityItem } from "../types";

const formatVND = (v: number) => new Intl.NumberFormat("vi-VN").format(v) + "k";

// Hàm lấy class màu cho Badge dựa trên tone
function getBadgeStyles(tone: ActivityItem["badgeTone"]) {
  switch (tone) {
    case "green":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30";
    case "blue":
      return "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30";
    case "yellow":
      return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30";
    default:
      return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600";
  }
}

type Props = {
  items: ActivityItem[];
};

export default function RecentActivityList({ items }: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-gray-700 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Hoạt động gần đây</h3>
        <button 
          type="button" 
          className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded-lg transition-colors"
        >
          Xem tất cả
        </button>
      </div>

      {/* List Items */}
      <div className="space-y-2">
        {items.map((it) => (
          <div 
            key={it.id} 
            className="group flex items-center gap-4 p-3 -mx-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-all duration-200"
          >
            {/* Image / Icon */}
            <div className="relative w-12 h-12 shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 flex items-center justify-center">
              {it.imageUrl ? (
                <img 
                  src={it.imageUrl} 
                  alt={it.title} 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300" 
                />
              ) : (
                <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 text-[24px]">
                  image
                </span>
              )}
            </div>

            {/* Content Text */}
            <div className="min-w-0 flex-1">
              <div className="font-bold text-sm text-gray-900 dark:text-white truncate">
                {it.title}
              </div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate mt-0.5">
                {it.subtitle}
              </div>
            </div>

            {/* Amount & Badge */}
            <div className="text-right shrink-0 flex flex-col items-end gap-1">
              <div className="text-sm font-bold text-gray-900 dark:text-white">
                {typeof it.amount === "number" ? formatVND(it.amount) : "-"}
              </div>
              <div className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${getBadgeStyles(it.badgeTone)}`}>
                {it.badgeText}
              </div>
            </div>
          </div>
        ))}
        
        {/* Empty State (Optional) */}
        {items.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            Chưa có hoạt động nào.
          </div>
        )}
      </div>
    </div>
  );
}