import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SellerLayout from "./components/SellerLayout";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { storeService } from "@/services/storeService";

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Format order status
const getOrderStatusLabel = (status: string) => {
  const statusMap: Record<string, { label: string; className: string }> = {
    pending: { label: "Chờ xác nhận", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" },
    confirmed: { label: "Đã xác nhận", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" },
    packaged: { label: "Đã đóng gói", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400" },
    shipped: { label: "Đang giao", className: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400" },
    delivered: { label: "Hoàn tất", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" },
    cancelled: { label: "Đã hủy", className: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400" },
    rejected: { label: "Từ chối", className: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400" },
  };
  return statusMap[status] || { label: status, className: "bg-gray-100 text-gray-700" };
};

export default function SellerDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await storeService.getStoreStats();
        if (response.success && response.data?.stats) {
          setStats(response.data.stats);
        }
      } catch (error) {
        console.error("Error fetching store stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <SellerLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500">Đang tải dữ liệu...</div>
        </div>
      </SellerLayout>
    );
  }

  if (!stats) {
    return (
      <SellerLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500">Không có dữ liệu</div>
        </div>
      </SellerLayout>
    );
  }

  const revenueToday = stats.revenue?.today || 0;
  const revenueTodayChange = stats.revenue?.todayChange || 0;
  const revenueSevenDays = stats.revenue?.sevenDays || 0;
  const revenueSevenDaysChange = stats.revenue?.sevenDaysChange || 0;
  const revenueThirtyDays = stats.revenue?.thirtyDays || 0;
  const revenueThirtyDaysChange = stats.revenue?.thirtyDaysChange || 0;

  return (
    <SellerLayout>
      
      {/* 1. TOP STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-6xl text-emerald-500">payments</span>
           </div>
           <div className="text-sm text-gray-500 font-medium mb-1">Doanh thu hôm nay</div>
           <div className="text-3xl font-black text-gray-900 dark:text-white mb-2">{formatCurrency(revenueToday)}</div>
           <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded w-fit ${
             revenueTodayChange >= 0 
               ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" 
               : "text-red-600 bg-red-50 dark:bg-red-900/20"
           }`}>
              <span className="material-symbols-outlined text-[14px]">
                {revenueTodayChange >= 0 ? "trending_up" : "trending_down"}
              </span>
              {revenueTodayChange >= 0 ? "+" : ""}{revenueTodayChange.toFixed(1)}% 
              <span className="text-gray-500 font-medium ml-1">so với hôm qua</span>
           </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-6xl text-blue-500">calendar_view_week</span>
           </div>
           <div className="text-sm text-gray-500 font-medium mb-1">Doanh thu 7 ngày</div>
           <div className="text-3xl font-black text-gray-900 dark:text-white mb-2">{formatCurrency(revenueSevenDays)}</div>
           <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded w-fit ${
             revenueSevenDaysChange >= 0 
               ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" 
               : "text-red-600 bg-red-50 dark:bg-red-900/20"
           }`}>
              <span className="material-symbols-outlined text-[14px]">
                {revenueSevenDaysChange >= 0 ? "trending_up" : "trending_down"}
              </span>
              {revenueSevenDaysChange >= 0 ? "+" : ""}{revenueSevenDaysChange.toFixed(1)}% 
              <span className="text-gray-500 font-medium ml-1">so với tuần trước</span>
           </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-6xl text-orange-500">calendar_month</span>
           </div>
           <div className="text-sm text-gray-500 font-medium mb-1">Doanh thu 30 ngày</div>
           <div className="text-3xl font-black text-gray-900 dark:text-white mb-2">{formatCurrency(revenueThirtyDays)}</div>
           <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded w-fit ${
             revenueThirtyDaysChange >= 0 
               ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" 
               : "text-red-600 bg-red-50 dark:bg-red-900/20"
           }`}>
              <span className="material-symbols-outlined text-[14px]">
                {revenueThirtyDaysChange >= 0 ? "trending_up" : "trending_down"}
              </span>
              {revenueThirtyDaysChange >= 0 ? "+" : ""}{revenueThirtyDaysChange.toFixed(1)}% 
              <span className="text-gray-500 font-medium ml-1">so với tháng trước</span>
           </div>
        </div>
      </div>

      {/* 2. ORDER STATUS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
         {[
            { label: "Chờ xác nhận", count: stats.orders?.pending || 0, color: "text-amber-600", icon: "pending_actions", border: "border-l-4 border-amber-500" },
            { label: "Đã xác nhận", count: stats.orders?.confirmed || 0, color: "text-blue-600", icon: "check_circle_outline", border: "border-l-4 border-blue-500" },
            { label: "Hoàn tất", count: stats.orders?.delivered || 0, color: "text-emerald-600", icon: "check_circle", border: "border-l-4 border-emerald-500" },
            { label: "Đơn hủy", count: stats.orders?.cancelled || 0, color: "text-red-600", icon: "cancel", border: "border-l-4 border-red-500" },
         ].map((item, idx) => (
            <div key={idx} className={`bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between ${item.border}`}>
               <div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{item.label}</div>
                  <div className="text-2xl font-black text-gray-900 dark:text-white">{item.count}</div>
               </div>
               <span className={`material-symbols-outlined text-3xl opacity-20 ${item.color}`}>{item.icon}</span>
            </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* 3. MAIN CHART (Left - 2 cols) */}
         <div className="lg:col-span-2 space-y-8">
            {/* Chart Container */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">Biểu đồ doanh thu</h3>
                  <select className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold px-3 py-1.5 outline-none">
                     <option>Tuần này</option>
                     <option>Tháng này</option>
                  </select>
               </div>
               
               <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={stats.chartData || []}>
                        <defs>
                           <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} />
                        <Tooltip 
                           contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                           itemStyle={{color: '#10B981', fontWeight: 'bold'}}
                           formatter={(value: number) => formatCurrency(value)}
                        />
                        <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">Đơn hàng mới nhất</h3>
                  <button 
                     onClick={() => navigate("/seller/orders")}
                     className="text-sm font-bold text-emerald-600 hover:underline"
                  >
                     Xem tất cả
                  </button>
               </div>
               
               <div className="overflow-x-auto">
                  {stats.recentOrders && stats.recentOrders.length > 0 ? (
                     <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 uppercase font-bold text-xs">
                           <tr>
                              <th className="px-4 py-3 rounded-l-lg">Mã đơn</th>
                              <th className="px-4 py-3">Sản phẩm</th>
                              <th className="px-4 py-3">Tổng tiền</th>
                              <th className="px-4 py-3">Trạng thái</th>
                              <th className="px-4 py-3 rounded-r-lg">Hành động</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                           {stats.recentOrders.map((order: any) => {
                              const statusInfo = getOrderStatusLabel(order.status);
                              const firstItem = order.items?.[0];
                              return (
                                 <tr key={order._id} className="group hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                    <td className="px-4 py-4 font-bold">#{order.orderNumber}</td>
                                    <td className="px-4 py-4">
                                       <div className="flex items-center gap-3">
                                          {firstItem?.productImage ? (
                                             <img 
                                                src={firstItem.productImage} 
                                                className="w-10 h-10 rounded-lg object-cover" 
                                                alt={firstItem.productName} 
                                             />
                                          ) : (
                                             <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-gray-400 text-lg">image</span>
                                             </div>
                                          )}
                                          <div className="min-w-0">
                                             <span className="font-medium truncate max-w-[150px] block">
                                                {firstItem?.productName || "Sản phẩm"}
                                             </span>
                                             {order.items.length > 1 && (
                                                <span className="text-xs text-gray-500">+{order.items.length - 1} sản phẩm khác</span>
                                             )}
                                          </div>
                                       </div>
                                    </td>
                                    <td className="px-4 py-4 font-bold">{formatCurrency(order.totalAmount)}</td>
                                    <td className="px-4 py-4">
                                       <span className={`px-2 py-1 rounded text-xs font-bold ${statusInfo.className}`}>
                                          {statusInfo.label}
                                       </span>
                                    </td>
                                    <td className="px-4 py-4">
                                       {order.status === "pending" && (
                                          <button 
                                             onClick={() => navigate(`/seller/orders`)}
                                             className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                                          >
                                             Xác nhận
                                          </button>
                                       )}
                                    </td>
                                 </tr>
                              );
                           })}
                        </tbody>
                     </table>
                  ) : (
                     <div className="text-center py-8 text-gray-500">
                        Chưa có đơn hàng nào
                     </div>
                  )}
               </div>
            </div>
         </div>

         {/* 4. SIDE WIDGETS (Right - 1 col) */}
         <div className="space-y-6">
            
            {/* Notifications */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
               <div className="flex items-center gap-2 mb-4 text-red-500">
                  <span className="material-symbols-outlined">notifications_active</span>
                  <h3 className="font-bold text-gray-900 dark:text-white">Thông báo quan trọng</h3>
               </div>
               
               <div className="space-y-3">
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-800">
                     <div className="flex gap-2">
                        <span className="material-symbols-outlined text-red-500 text-lg mt-0.5">warning</span>
                        <div>
                           <div className="text-sm font-bold text-gray-900 dark:text-white">Sản phẩm bị từ chối</div>
                           <p className="text-xs text-gray-500 mt-1 line-clamp-2">"Váy hoa nhí vintage" vi phạm chính sách hình ảnh.</p>
                           <button className="text-xs font-bold text-red-600 mt-2 hover:underline">Xem chi tiết</button>
                        </div>
                     </div>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-800">
                     <div className="flex gap-2">
                        <span className="material-symbols-outlined text-blue-500 text-lg mt-0.5">star</span>
                        <div>
                           <div className="text-sm font-bold text-gray-900 dark:text-white">Đánh giá mới</div>
                           <p className="text-xs text-gray-500 mt-1">Bạn nhận được 5 sao từ khách hàng Nguyen Van A.</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Product Status Stats */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
               <h3 className="font-bold text-gray-900 dark:text-white mb-4">Trạng thái sản phẩm</h3>
               <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-xl text-center">
                     <div className="text-2xl font-black text-gray-900 dark:text-white">{stats.products?.active || 0}</div>
                     <div className="text-xs text-gray-500 font-bold mt-1">Đang bán</div>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl text-center">
                     <div className="text-2xl font-black text-red-600">{stats.products?.outOfStock || 0}</div>
                     <div className="text-xs text-gray-500 font-bold mt-1">Hết hàng</div>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl text-center">
                     <div className="text-2xl font-black text-amber-600">{stats.products?.pending || 0}</div>
                     <div className="text-xs text-gray-500 font-bold mt-1">Chờ duyệt</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-xl text-center border border-red-100">
                     <div className="text-2xl font-black text-red-500">{stats.products?.violation || 0}</div>
                     <div className="text-xs text-gray-500 font-bold mt-1">Bị từ chối</div>
                  </div>
               </div>
            </div>

            {/* Top Products */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-900 dark:text-white">Top Sản phẩm</h3>
                  <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
                     <button className="px-2 py-1 text-[10px] font-bold bg-white dark:bg-gray-600 rounded shadow-sm">Bán chạy</button>
                     <button className="px-2 py-1 text-[10px] font-bold text-gray-500">Xem nhiều</button>
                  </div>
               </div>
               
               <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                     <div key={i} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-gray-200 shrink-0 overflow-hidden">
                           <img src={`https://source.unsplash.com/random/100x100?clothing&sig=${i}`} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="text-sm font-bold truncate">Quần Jean Levi's 501</div>
                           <div className="text-xs text-gray-500">Đã bán: 12</div>
                        </div>
                        <div className="font-black text-sm text-gray-300">#{i}</div>
                     </div>
                  ))}
               </div>
            </div>

         </div>
      </div>
    </SellerLayout>
  );
}