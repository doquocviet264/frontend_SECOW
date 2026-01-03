import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import { 
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';
import { adminService } from "@/services/adminService";

// Format số tiền VNĐ
const formatCurrency = (amount: number): string => {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)} tỷ`;
  } else if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)} triệu`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}k`;
  }
  return amount.toLocaleString('vi-VN');
};

// Format số với dấu phẩy
const formatNumber = (num: number): string => {
  return num.toLocaleString('vi-VN');
};

// Reusable Stat Card Component
const StatCard = ({ title, value, unit, trend, icon, color }: any) => (
  <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between h-full">
    <div className="flex justify-between items-start mb-4">
      <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">{title}</span>
      <div className={`p-2 rounded-lg ${color.bg} ${color.text}`}>
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </div>
    </div>
    <div>
      <div className="flex items-baseline gap-1">
         <h3 className="text-2xl font-black text-gray-900 dark:text-white">{value}</h3>
         {unit && <span className="text-xs text-gray-400 font-bold">{unit}</span>}
      </div>
      <div className={`flex items-center gap-1 text-xs font-bold mt-2 ${trend.isUp ? 'text-emerald-500' : 'text-red-500'}`}>
        <span className="material-symbols-outlined text-[14px]">
          {trend.isUp ? 'trending_up' : 'trending_down'}
        </span>
        {trend.val} <span className="text-gray-400 font-medium ml-1">vs tháng trước</span>
      </div>
    </div>
  </div>
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [userGrowthData, setUserGrowthData] = useState<any[]>([]);
  const [userGrowthStats, setUserGrowthStats] = useState({ totalNewUsers: 0, growthPercent: 0 });
  const [pendingProducts, setPendingProducts] = useState<any[]>([]);
  const [revenueDays, setRevenueDays] = useState(30);

  useEffect(() => {
    fetchDashboardData();
  }, [revenueDays]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch tất cả dữ liệu song song
      const [statsRes, revenueRes, userGrowthRes, productsRes] = await Promise.all([
        adminService.getSystemStats(),
        adminService.getRevenueChart(revenueDays),
        adminService.getUserGrowthChart(),
        adminService.getPendingProducts({ page: 1, limit: 5 }),
      ]);

      if (statsRes.success) {
        setStats(statsRes.data.stats);
      }

      if (revenueRes.success) {
        setRevenueData(revenueRes.data.chartData);
      }

      if (userGrowthRes.success) {
        setUserGrowthData(userGrowthRes.data.chartData);
        setUserGrowthStats({
          totalNewUsers: userGrowthRes.data.totalNewUsers,
          growthPercent: userGrowthRes.data.growthPercent,
        });
      }

      if (productsRes.success) {
        setPendingProducts(productsRes.data.products);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProduct = async (productId: string) => {
    try {
      await adminService.updateProductStatus(productId, "active");
      fetchDashboardData();
    } catch (error) {
      console.error("Error approving product:", error);
    }
  };

  const handleRejectProduct = async (productId: string) => {
    try {
      await adminService.updateProductStatus(productId, "violation", "Vi phạm quy định");
      fetchDashboardData();
    } catch (error) {
      console.error("Error rejecting product:", error);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500">Đang tải dữ liệu...</div>
        </div>
      </AdminLayout>
    );
  }

  if (!stats) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-red-500">Không thể tải dữ liệu</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      
      {/* 1. STATS ROW (Grid 5 cols) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard 
          title="Doanh thu" 
          value={formatCurrency(stats.revenue.total)} 
          unit="VNĐ"
          trend={{ isUp: true, val: "+0%" }}
          icon="payments"
          color={{ bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-600" }}
        />
        <StatCard 
          title="Tổng đơn hàng" 
          value={formatNumber(stats.orders.total)}
          trend={{ isUp: true, val: "+0%" }}
          icon="shopping_bag"
          color={{ bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-600" }}
        />
        <StatCard 
          title="Sản phẩm" 
          value={formatNumber(stats.products.total)}
          trend={{ isUp: true, val: "+0%" }}
          icon="inventory_2"
          color={{ bg: "bg-orange-50 dark:bg-orange-900/20", text: "text-orange-600" }}
        />
        <StatCard 
          title="Người bán" 
          value={formatNumber(stats.stores.approved)}
          trend={{ isUp: true, val: "+0%" }}
          icon="storefront"
          color={{ bg: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-600" }}
        />
        <StatCard 
          title="Người dùng" 
          value={formatNumber(stats.users.total)}
          trend={{ isUp: true, val: "+0%" }}
          icon="person"
          color={{ bg: "bg-teal-50 dark:bg-teal-900/20", text: "text-teal-600" }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* 2. REVENUE ANALYSIS (Left - 2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
           <div className="flex justify-between items-center mb-6">
              <div>
                 <h3 className="font-bold text-lg text-gray-900 dark:text-white">Phân tích doanh thu</h3>
                 <p className="text-xs text-gray-500">Doanh thu & số lượng đơn hàng trong {revenueDays} ngày qua</p>
              </div>
              <select 
                value={revenueDays}
                onChange={(e) => setRevenueDays(Number(e.target.value))}
                className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold px-3 py-1.5 outline-none"
              >
                 <option value={30}>30 ngày</option>
                 <option value={7}>7 ngày</option>
              </select>
           </div>
           
           <div className="h-[300px] w-full">
              {revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={revenueData}>
                      <defs>
                         <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                         </linearGradient>
                      </defs>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} dy={10} />
                      <Tooltip 
                         contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                         itemStyle={{color: '#10B981', fontWeight: 'bold'}}
                         formatter={(value: any) => `${formatCurrency(value)} VNĐ`}
                      />
                      <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                   </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Không có dữ liệu
                </div>
              )}
           </div>
        </div>

        {/* 3. USER GROWTH (Right - 1 col) */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
           <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">Tăng trưởng người dùng</h3>
           <p className="text-xs text-gray-500 mb-6">Người dùng mới đăng ký tuần này</p>
           
           <div className="flex-1 min-h-[150px]">
              {userGrowthData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={userGrowthData}>
                      <Tooltip 
                         cursor={{fill: 'transparent'}}
                         contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                      />
                      <Bar dataKey="value" fill="#E5E7EB" radius={[4, 4, 4, 4]} activeBar={{ fill: '#10B981' }} />
                   </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Không có dữ liệu
                </div>
              )}
           </div>
           
           <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-end">
              <div>
                 <div className="text-4xl font-black text-gray-900 dark:text-white">{userGrowthStats.totalNewUsers}</div>
                 <div className="text-xs text-gray-500 font-bold mt-1">Người dùng mới</div>
              </div>
              <span className={`${userGrowthStats.growthPercent >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'} px-2 py-1 rounded text-xs font-bold`}>
                {userGrowthStats.growthPercent >= 0 ? '+' : ''}{userGrowthStats.growthPercent.toFixed(1)}%
              </span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 4. PENDING PRODUCTS TABLE (Left - 2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
           <div className="flex justify-between items-center mb-6">
              <div>
                 <h3 className="font-bold text-lg text-gray-900 dark:text-white">Sản phẩm chờ duyệt</h3>
                 <p className="text-xs text-gray-500 mt-1">Các sản phẩm mới đăng cần được kiểm duyệt</p>
              </div>
              <button 
                onClick={() => navigate("/admin/products-approval")}
                className="text-sm font-bold text-emerald-600 hover:underline"
              >
                Xem tất cả
              </button>
           </div>

           <div className="overflow-x-auto">
              {pendingProducts.length > 0 ? (
                <table className="w-full text-sm text-left">
                   <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 uppercase font-bold text-xs">
                      <tr>
                         <th className="px-4 py-3 rounded-l-lg">Sản phẩm</th>
                         <th className="px-4 py-3">Người bán</th>
                         <th className="px-4 py-3">Giá</th>
                         <th className="px-4 py-3">Trạng thái</th>
                         <th className="px-4 py-3 rounded-r-lg text-right">Hành động</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {pendingProducts.map((product) => (
                         <tr key={product._id} className="group hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                            <td className="px-4 py-4">
                               <div className="flex items-center gap-3">
                                  <img 
                                    src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder.png'} 
                                    className="w-10 h-10 rounded-lg object-cover" 
                                    alt={product.name}
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = '/placeholder.png';
                                    }}
                                  />
                                  <span className="font-medium truncate max-w-[150px]">{product.name}</span>
                               </div>
                            </td>
                            <td className="px-4 py-4 text-gray-500">{product.seller?.name || 'N/A'}</td>
                            <td className="px-4 py-4 font-bold">{product.price?.toLocaleString('vi-VN')}₫</td>
                            <td className="px-4 py-4">
                               <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-bold">Chờ duyệt</span>
                            </td>
                            <td className="px-4 py-4 text-right">
                               <button 
                                 onClick={() => handleApproveProduct(product._id)}
                                 className="text-emerald-600 hover:bg-emerald-50 p-1.5 rounded mr-1"
                               >
                                  <span className="material-symbols-outlined text-[20px]">check</span>
                               </button>
                               <button 
                                 onClick={() => handleRejectProduct(product._id)}
                                 className="text-red-600 hover:bg-red-50 p-1.5 rounded"
                               >
                                  <span className="material-symbols-outlined text-[20px]">close</span>
                               </button>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Không có sản phẩm chờ duyệt
                </div>
              )}
           </div>
        </div>

        {/* 5. VIOLATION REPORTS (Right - 1 col) */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
           <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Báo cáo vi phạm</h3>
              <button className="text-gray-400 hover:text-gray-600">
                 <span className="material-symbols-outlined">more_horiz</span>
              </button>
           </div>

           <div className="space-y-4">
              <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/30">
                 <div className="flex gap-3">
                    <div className="bg-red-100 text-red-600 w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
                       <span className="material-symbols-outlined">warning</span>
                    </div>
                    <div>
                       <div className="flex justify-between items-start w-full">
                          <span className="text-xs font-bold text-gray-900 dark:text-white">Shop: VintageHolic</span>
                          <span className="text-[10px] text-gray-400">2p trước</span>
                       </div>
                       <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 mb-2">
                          Báo cáo: Bán hàng giả/hàng nhái
                       </div>
                       <div className="flex gap-2">
                          <button className="bg-white border border-gray-200 text-xs font-bold px-3 py-1 rounded hover:bg-gray-50">Xem chi tiết</button>
                          <button className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded hover:bg-red-200">Xử lý ngay</button>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                 <div className="flex gap-3">
                    <div className="bg-gray-100 text-gray-600 w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
                       <span className="material-symbols-outlined">person_off</span>
                    </div>
                    <div>
                       <div className="flex justify-between items-start w-full">
                          <span className="text-xs font-bold text-gray-900 dark:text-white">User: NguyenB</span>
                          <span className="text-[10px] text-gray-400">1h trước</span>
                       </div>
                       <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Báo cáo: Spam bình luận/tin nhắn
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </AdminLayout>
  );
}