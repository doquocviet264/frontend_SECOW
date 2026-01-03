import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import { adminService, type Store } from "@/services/adminService";
import { useDebounce } from "@/components/hooks/useDebounce";

export default function StoreManagementPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "locked">("all");
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 500);

  const fetchStores = async () => {
    setIsLoading(true);
    try {
      const params: {
        page?: number;
        limit?: number;
        isActive?: boolean;
        search?: string;
      } = {
        page: currentPage,
        limit: 20,
      };

      if (statusFilter === "active") {
        params.isActive = true;
      } else if (statusFilter === "locked") {
        params.isActive = false;
      }

      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }

      const res = await adminService.getAllStores(params);
      if (res.success && res.data) {
        setStores(res.data.stores || []);
        setPagination(res.data.pagination);
      } else {
        setStores([]);
      }
    } catch (error) {
      console.error("Failed to fetch stores", error);
      setStores([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [currentPage, statusFilter, debouncedSearch]);

  const handleToggleStatus = async (storeId: string, currentStatus: boolean) => {
    if (!confirm(`Bạn có chắc chắn muốn ${currentStatus ? "khóa" : "mở khóa"} cửa hàng này?`)) {
      return;
    }

    try {
      const res = await adminService.updateStoreStatus(storeId, !currentStatus);
      if (res.success) {
        alert(res.message || (currentStatus ? "Đã khóa cửa hàng" : "Đã mở khóa cửa hàng"));
        fetchStores();
      } else {
        alert(res.message || "Có lỗi xảy ra");
      }
    } catch (error: any) {
      alert(error?.response?.data?.message || "Có lỗi xảy ra");
      console.error("Error updating store status:", error);
    }
  };

  const getSellerName = (store: Store) => {
    if (typeof store.seller === "object" && store.seller.name) {
      return store.seller.name;
    }
    return "N/A";
  };

  const getSellerEmail = (store: Store) => {
    if (typeof store.seller === "object" && store.seller.email) {
      return store.seller.email;
    }
    return "N/A";
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Quản lý cửa hàng</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Quản lý và khóa/mở khóa cửa hàng đã được phê duyệt
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">Tổng số cửa hàng</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{pagination.total}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">Trang hiện tại</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {pagination.page}/{pagination.totalPages}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">Số cửa hàng mỗi trang</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{pagination.limit}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">Đang hiển thị</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stores.length}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Tìm kiếm
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Tên cửa hàng, email, số điện thoại..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Trạng thái
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as typeof statusFilter);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              >
                <option value="all">Tất cả</option>
                <option value="active">Đang hoạt động</option>
                <option value="locked">Đã khóa</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stores List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
            </div>
          </div>
        ) : stores.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 border border-gray-200 dark:border-gray-700 text-center">
            <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">
              store
            </span>
            <p className="text-gray-600 dark:text-gray-400">Không tìm thấy cửa hàng nào</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Cửa hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Người bán
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Liên hệ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Doanh thu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Ngày phê duyệt
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {stores.map((store) => (
                    <tr key={store._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 pr-8">
                        <div className="flex items-center gap-3">
                          {store.logo ? (
                            <img
                              src={store.logo}
                              alt={store.storeName}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
                              {store.storeName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white">{store.storeName}</div>
                            {store.description && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                {store.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 pl-8">
                        <div className="text-sm">
                          <div className="font-semibold text-gray-900 dark:text-white">{getSellerName(store)}</div>
                          <div className="text-gray-500 dark:text-gray-400">{getSellerEmail(store)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-gray-900 dark:text-white">{store.phone}</div>
                          <div className="text-gray-500 dark:text-gray-400">{store.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {store.isActive !== false ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                            <span className="material-symbols-outlined text-[14px] mr-1">check_circle</span>
                            Đang hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                            <span className="material-symbols-outlined text-[14px] mr-1">lock</span>
                            Đã khóa
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {store.totalRevenue?.toLocaleString("vi-VN") || 0}₫
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {store.totalSales || 0} đơn hàng
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {store.approvedAt
                          ? new Date(store.approvedAt).toLocaleDateString("vi-VN")
                          : "-"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(store._id, store.isActive !== false)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                              store.isActive !== false
                                ? "text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30"
                                : "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[16px] mr-1">
                              {store.isActive !== false ? "lock" : "lock_open"}
                            </span>
                            {store.isActive !== false ? "Khóa" : "Mở khóa"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Hiển thị {(currentPage - 1) * pagination.limit + 1} -{" "}
                  {Math.min(currentPage * pagination.limit, pagination.total)} trong tổng số {pagination.total}{" "}
                  cửa hàng
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Trước
                  </button>
                  <span className="px-3 py-1.5 text-sm font-semibold text-gray-900 dark:text-white">
                    {currentPage} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={currentPage === pagination.totalPages}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

