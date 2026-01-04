import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SellerLayout from "./components/SellerLayout";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { storeService } from "@/services/storeService";
import { productService } from "@/services/productService";
import { reviewService } from "@/services/reviewService";
import { authService } from "@/services/authService";

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
  const [rejectedProducts, setRejectedProducts] = useState<any[]>([]);
  const [newReviews, setNewReviews] = useState<any[]>([]);
  
  // Khởi tạo với 7 ngày gần nhất
  const getDefaultDates = () => {
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  };
  
  const [dateRange, setDateRange] = useState(getDefaultDates());
  const [dateError, setDateError] = useState<string>("");

  useEffect(() => {
    // Chỉ fetch khi không có lỗi validation
    if (dateError) {
      return;
    }
    
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch stats với tham số startDate và endDate
        const response = await storeService.getStoreStats(dateRange.startDate, dateRange.endDate);
        if (response.success && response.data?.stats) {
          setStats(response.data.stats);
        }

        // Fetch rejected products
        try {
          const rejectedResponse = await productService.getSellerProducts({
            status: "violation",
            limit: 5,
            page: 1,
          });
          if (rejectedResponse.success && rejectedResponse.data?.products) {
            setRejectedProducts(rejectedResponse.data.products);
          }
        } catch (error) {
          console.error("Error fetching rejected products:", error);
        }

        // Fetch new reviews
        try {
          const storeResponse = await storeService.getMyStore();
          if (storeResponse.success && storeResponse.data?.store) {
            const sellerId = typeof storeResponse.data.store.seller === 'string' 
              ? storeResponse.data.store.seller 
              : storeResponse.data.store.seller._id;
            
            if (sellerId) {
              const reviewsResponse = await reviewService.getSellerReviews(sellerId, {
                limit: 5,
                page: 1,
              });
              if (reviewsResponse.success && reviewsResponse.data?.reviews) {
                setNewReviews(reviewsResponse.data.reviews);
              }
            }
          }
        } catch (error) {
          console.error("Error fetching reviews:", error);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [dateRange.startDate, dateRange.endDate, dateError]);

  // Hàm xử lý thay đổi ngày bắt đầu
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    if (!dateRange.endDate) {
      setDateError("");
      setDateRange({ ...dateRange, startDate: newStartDate });
      return;
    }
    
    const start = new Date(newStartDate + 'T00:00:00');
    const end = new Date(dateRange.endDate + 'T23:59:59');
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 để tính cả ngày đầu và ngày cuối
    
    if (diffDays > 7) {
      // Tự động điều chỉnh endDate về đúng 7 ngày từ startDate
      const adjustedEndDate = new Date(start);
      adjustedEndDate.setDate(adjustedEndDate.getDate() + 6);
      setDateError("");
      setDateRange({ 
        startDate: newStartDate, 
        endDate: adjustedEndDate.toISOString().split('T')[0] 
      });
    } else if (diffDays < 1) {
      setDateError("Ngày bắt đầu không được sau ngày kết thúc");
    } else {
      setDateError("");
      setDateRange({ ...dateRange, startDate: newStartDate });
    }
  };

  // Hàm xử lý thay đổi ngày kết thúc
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value;
    if (!dateRange.startDate) {
      setDateError("");
      setDateRange({ ...dateRange, endDate: newEndDate });
      return;
    }
    
    const start = new Date(dateRange.startDate + 'T00:00:00');
    const end = new Date(newEndDate + 'T23:59:59');
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 để tính cả ngày đầu và ngày cuối
    
    if (diffDays > 7) {
      // Tự động điều chỉnh startDate về đúng 7 ngày trước endDate
      const adjustedStartDate = new Date(end);
      adjustedStartDate.setDate(adjustedStartDate.getDate() - 6);
      setDateError("");
      setDateRange({ 
        startDate: adjustedStartDate.toISOString().split('T')[0],
        endDate: newEndDate 
      });
    } else if (diffDays < 1) {
      setDateError("Ngày kết thúc không được trước ngày bắt đầu");
    } else {
      setDateError("");
      setDateRange({ ...dateRange, endDate: newEndDate });
    }
  };

  // Format ngày để hiển thị
  const formatDateDisplay = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  };

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
               <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-lg text-gray-900 dark:text-white">Biểu đồ doanh thu</h3>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 ml-1">
                           Từ ngày
                        </label>
                        <div className="relative">
                           <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                              calendar_today
                           </span>
                           <input
                              type="date"
                              value={dateRange.startDate}
                              onChange={handleStartDateChange}
                              max={dateRange.endDate || new Date().toISOString().split('T')[0]}
                              className="w-full h-10 pl-10 pr-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-bold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                           />
                        </div>
                     </div>
                     <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 ml-1">
                           Đến ngày (tối đa 7 ngày)
                        </label>
                        <div className="relative">
                           <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                              event
                           </span>
                           <input
                              type="date"
                              value={dateRange.endDate}
                              onChange={handleEndDateChange}
                              min={dateRange.startDate}
                              max={(() => {
                                 if (!dateRange.startDate) return new Date().toISOString().split('T')[0];
                                 const maxDate = new Date(dateRange.startDate);
                                 maxDate.setDate(maxDate.getDate() + 6);
                                 const today = new Date();
                                 return maxDate > today ? today.toISOString().split('T')[0] : maxDate.toISOString().split('T')[0];
                              })()}
                              className="w-full h-10 pl-10 pr-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-bold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                           />
                        </div>
                     </div>
                  </div>
                  {dateError && (
                     <p className="text-xs text-red-500 mt-2 ml-1">{dateError}</p>
                  )}
                  {!dateError && dateRange.startDate && dateRange.endDate && (
                     <p className="text-xs text-gray-500 mt-2 ml-1">
                        Doanh thu từ {formatDateDisplay(dateRange.startDate)} đến {formatDateDisplay(dateRange.endDate)}
                     </p>
                  )}
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
                  {/* Rejected Products */}
                  {rejectedProducts.length > 0 ? (
                     rejectedProducts.slice(0, 3).map((product) => (
                        <div key={product._id} className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-800">
                           <div className="flex gap-2">
                              <span className="material-symbols-outlined text-red-500 text-lg mt-0.5">warning</span>
                              <div className="flex-1 min-w-0">
                                 <div className="text-sm font-bold text-gray-900 dark:text-white">Sản phẩm bị từ chối</div>
                                 <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                    "{product.title}" {product.violationReason || "Vi phạm chính sách"}
                                 </p>
                                 <button 
                                    onClick={() => navigate(`/seller/products`)}
                                    className="text-xs font-bold text-red-600 mt-2 hover:underline"
                                 >
                                    Xem chi tiết
                                 </button>
                              </div>
                           </div>
                        </div>
                     ))
                  ) : (
                     <div className="text-xs text-gray-400 text-center py-2">Không có sản phẩm bị từ chối</div>
                  )}
                  
                  {/* New Reviews */}
                  {newReviews.length > 0 ? (
                     newReviews.slice(0, 3).map((review) => (
                        <div key={review._id} className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-800">
                           <div className="flex gap-2">
                              <span className="material-symbols-outlined text-blue-500 text-lg mt-0.5">star</span>
                              <div className="flex-1 min-w-0">
                                 <div className="text-sm font-bold text-gray-900 dark:text-white">Đánh giá mới</div>
                                 <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                    Bạn nhận được {review.rating} sao từ khách hàng {typeof review.customer === 'object' ? review.customer.name : 'Khách hàng'}.
                                    {review.comment && ` "${review.comment.substring(0, 50)}${review.comment.length > 50 ? '...' : ''}"`}
                                 </p>
                                 {review.product && typeof review.product === 'object' && (
                                    <p className="text-xs text-gray-400 mt-1">
                                       Sản phẩm: {review.product.title}
                                    </p>
                                 )}
                              </div>
                           </div>
                        </div>
                     ))
                  ) : (
                     <div className="text-xs text-gray-400 text-center py-2">Chưa có đánh giá mới</div>
                  )}
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

         </div>
      </div>
    </SellerLayout>
  );
}