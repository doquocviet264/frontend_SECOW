import { useNavigate } from "react-router-dom";
import type { Seller } from "../types";

type Props = {
  seller: Seller;
  storeId?: string | null;
};

export default function SellerCard({ seller, storeId }: Props) {
  const navigate = useNavigate();
  const initials = seller.name.trim().slice(0, 1).toUpperCase();

  const handleViewProfile = () => {
    if (storeId) {
      // Nếu có storeId, điều hướng đến trang seller profile với storeId
      navigate(`/seller-profile/${storeId}`);
    } else if (seller.id) {
      // Nếu không có storeId nhưng có sellerId, điều hướng đến trang seller profile với sellerId
      // SellerProfilePage sẽ tự động thử lấy store từ sellerId
      navigate(`/seller-profile/${seller.id}`);
    }
  };

  return (
    <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-xl border border-border-color dark:border-white/10 flex items-center gap-4 shadow-sm">
      <div className="relative">
        {seller.avatarUrl ? (
          <img src={seller.avatarUrl} alt={seller.name} className="w-14 h-14 rounded-full object-cover" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
            {initials}
          </div>
        )}
        {seller.isOnline && (
          <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <h4 className="font-bold text-text-main dark:text-white truncate">{seller.name}</h4>
          {(storeId || seller.id) && (
            <button 
              type="button" 
              onClick={handleViewProfile}
              className="text-xs font-semibold text-primary hover:underline cursor-pointer"
            >
              Xem trang
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
          <span className="material-symbols-outlined text-[14px] text-amber-400">star</span>
          <span className="font-medium text-gray-700 dark:text-gray-300">{seller.rating.toFixed(1)}</span>
          <span>({seller.totalReviews} đánh giá)</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span>Tham gia {seller.joinedYears} năm</span>
        </div>
      </div>
    </div>
  );
}
