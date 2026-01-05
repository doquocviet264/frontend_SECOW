import { useNavigate, useSearchParams } from "react-router-dom";
import StatCard from "./StatCard";
import type { ProfileTabKey } from "../types";

type Props = {
  stats: {
    delivering: number;
    selling: number;
    newProductsThisWeek: number;
  };
  rating: {
    score: number;
    total: number;
    bars: { star: number; percent: number }[];
  };
  userRole: string;
  onTabChange: (tab: ProfileTabKey) => void;
};

export default function OverviewTab({ stats, rating, userRole, onTabChange }: Props) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const hintText = stats.newProductsThisWeek > 0 
    ? `+${stats.newProductsThisWeek} sản phẩm mới tuần này`
    : "Chưa có sản phẩm mới tuần này";

  const handleDeliveringClick = () => {
    onTabChange("orders");
    // Update URL params to filter by shipped status
    setSearchParams({ status: "shipped" });
  };

  const handleSellingClick = () => {
    if (userRole === "seller" || userRole === "admin") {
      navigate("/seller/products");
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard 
          title="Đơn đang giao" 
          value={String(stats.delivering)} 
          icon="local_shipping" 
          tone="green"
          onClick={handleDeliveringClick}
        />
        <StatCard 
          title="Sản phẩm đang bán" 
          value={String(stats.selling)} 
          hint={hintText}
          icon="inventory_2" 
          tone="orange"
          onClick={handleSellingClick}
        />
      </div>

      {/* Rating Section */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Đánh giá cộng đồng</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tổng hợp phản hồi từ khách hàng</p>
          </div>
          <button className="text-blue-600 dark:text-blue-400 text-sm font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 px-4 py-2 rounded-xl transition-colors">
            Xem chi tiết
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
          {/* Big Score Circle */}
          <div className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-700/50 rounded-2xl min-w-[160px]">
            <div className="text-6xl font-black text-gray-900 dark:text-white tracking-tighter">
              {rating.score.toFixed(1)}
            </div>
            <div className="flex items-center gap-1 my-2 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <span 
                  key={i} 
                  className={`material-symbols-outlined text-[20px] ${i < Math.round(rating.score) ? 'fill-current' : 'text-gray-300 dark:text-gray-600'}`}
                  style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                >
                  star
                </span>
              ))}
            </div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {rating.total} lượt đánh giá
            </div>
          </div>

          {/* Progress Bars */}
          <div className="flex-1 w-full space-y-4 pt-2">
            {rating.bars.map((b) => (
              <div key={b.star} className="flex items-center gap-4 group">
                <div className="w-6 text-sm font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  {b.star} <span className="text-[10px] opacity-50">★</span>
                </div>
                <div className="flex-1 h-3 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  <div 
                    className="h-full bg-amber-400 rounded-full transition-all duration-500 ease-out group-hover:bg-amber-300" 
                    style={{ width: `${b.percent}%` }} 
                  />
                </div>
                <div className="w-12 text-sm font-medium text-gray-600 dark:text-gray-300 text-right">
                  {b.percent}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}