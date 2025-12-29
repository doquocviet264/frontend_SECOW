import type { ShopProfile } from "../types";

type Props = {
  shop: ShopProfile;
};

export default function SellerSidebar({ shop }: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-fit sticky top-6">
      {/* 1. Avatar & Info */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="relative mb-3">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-50 dark:border-gray-700 shadow-sm">
            <img src={shop.avatarUrl} alt={shop.name} className="w-full h-full object-cover" />
          </div>
          {shop.isTrusted && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white dark:border-gray-800 flex items-center gap-1 shadow-sm">
              <span className="material-symbols-outlined text-[12px]">verified_user</span>
              UY TÍN
            </span>
          )}
        </div>
        
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{shop.name}</h1>
        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
          <span className="material-symbols-outlined text-[16px]">location_on</span>
          {shop.location}
        </div>
      </div>

      {/* 2. Action Buttons */}
      <div className="flex gap-3 mb-8">
        <button className="flex-1 h-10 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-95">
          <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
          Chat
        </button>
        <button className="flex-1 h-10 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all">
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Follow
        </button>
      </div>

      {/* 3. Stats Grid */}
      <div className="space-y-3">
        {/* Rating */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
               <span className="material-symbols-outlined">star</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Đánh giá</div>
          </div>
          <div className="text-right">
             <div className="font-bold text-gray-900 dark:text-white">{shop.stats.rating}/5.0</div>
             <div className="text-[10px] text-gray-400">({shop.stats.reviewCount})</div>
          </div>
        </div>

        {/* Sold Count */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
               <span className="material-symbols-outlined">shopping_bag</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Đã bán</div>
          </div>
          <div className="font-bold text-gray-900 dark:text-white">{shop.stats.soldCount}+</div>
        </div>

        {/* Response */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
               <span className="material-symbols-outlined">schedule</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Phản hồi</div>
          </div>
          <div className="text-right">
             <div className="font-bold text-gray-900 dark:text-white">{shop.stats.responseTime}</div>
             <div className="text-[10px] text-gray-400">{shop.stats.responseRate}%</div>
          </div>
        </div>
      </div>

      {/* 4. Footer Meta */}
      <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 space-y-3 text-sm text-gray-500 dark:text-gray-400">
         <div className="flex justify-between">
            <span>Tham gia:</span>
            <span className="font-semibold text-gray-900 dark:text-white">{shop.stats.joinedDate}</span>
         </div>
         <div className="flex justify-between">
            <span>Người theo dõi:</span>
            <span className="font-semibold text-gray-900 dark:text-white">{new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(shop.stats.followerCount)}</span>
         </div>
      </div>
    </div>
  );
}