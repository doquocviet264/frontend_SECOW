import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { adminService } from "@/services/adminService";
import { orderService, type Order } from "@/services/orderService";
import { useDebounce } from "@/components/hooks/useDebounce";

type OrderStatus = "pending" | "confirmed" | "packaged" | "shipped" | "delivered" | "cancelled" | "rejected";

const TABS: { id: OrderStatus | "all"; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: "pending", label: "Chờ xác nhận" },
  { id: "confirmed", label: "Đã xác nhận" },
  { id: "packaged", label: "Đã đóng gói" },
  { id: "shipped", label: "Đã gửi hàng" },
  { id: "delivered", label: "Đã giao hàng" },
  { id: "cancelled", label: "Đã hủy" },
  { id: "rejected", label: "Từ chối" },
];

const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const config: Record<OrderStatus, { label: string; className: string }> = {
    pending: { label: "Chờ xác nhận", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" },
    confirmed: { label: "Đã xác nhận", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" },
    packaged: { label: "Đã đóng gói", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400" },
    shipped: { label: "Đã gửi hàng", className: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400" },
    delivered: { label: "Đã giao hàng", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" },
    cancelled: { label: "Đã hủy", className: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400" },
    rejected: { label: "Từ chối", className: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400" },
  };

  const { label, className } = config[status] || config.pending;

  return (
    <span className={`px-2 py-1 rounded text-xs font-bold ${className}`}>
      {label}
    </span>
  );
};

const PaymentStatusBadge = ({ status }: { status: "pending" | "paid" | "failed" | "refunded" }) => {
  const config: Record<string, { label: string; className: string }> = {
    pending: { label: "Chờ thanh toán", className: "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-400" },
    paid: { label: "Đã thanh toán", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" },
    failed: { label: "Thanh toán thất bại", className: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400" },
    refunded: { label: "Đã hoàn tiền", className: "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400" },
  };

  const { label, className } = config[status] || config.pending;

  return (
    <span className={`px-2 py-1 rounded text-xs font-bold ${className}`}>
      {label}
    </span>
  );
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function OrderManagementPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [searchInputValue, setSearchInputValue] = useState(searchParams.get("orderNumber") || "");
  const debouncedSearchQuery = useDebounce(searchInputValue, 500);

  const activeTab = useMemo(() => searchParams.get("status") || "all", [searchParams]);
  const currentPage = useMemo(() => parseInt(searchParams.get("page") || "1"), [searchParams]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: 10,
      };

      if (activeTab !== "all") {
        params.status = activeTab;
      }

      const res = await adminService.getAllOrders(params);
      if (res.success && res.data) {
        let filteredOrders = res.data.orders || [];
        
        // Filter by order number if search query exists
        if (debouncedSearchQuery) {
          filteredOrders = filteredOrders.filter(order =>
            order.orderNumber.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
          );
        }

        setOrders(filteredOrders);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error(error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab, currentPage, debouncedSearchQuery]);

  const handleTabChange = (tabId: string) => {
    setSearchParams({ status: tabId === "all" ? "" : tabId, page: "1" });
  };

  const handlePageChange = (page: number) => {
    setSearchParams({ ...Object.fromEntries(searchParams), page: page.toString() });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Quản lý đơn hàng</h1>
            <p className="text-sm text-gray-500">Xem và quản lý tất cả đơn hàng trong hệ thống</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">Tổng số đơn hàng</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{pagination.total}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">Trang hiện tại</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {pagination.page}/{pagination.totalPages}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">Số đơn mỗi trang</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{pagination.limit}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">Đang hiển thị</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{orders.length}</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Tìm kiếm theo mã đơn hàng..."
                  value={searchInputValue}
                  onChange={(e) => setSearchInputValue(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                  activeTab === tab.id
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              <p className="mt-4 text-gray-500">Đang tải...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4 block">
                shopping_bag
              </span>
              <p className="text-gray-500 font-medium">Không có đơn hàng nào</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Mã đơn</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Khách hàng</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Người bán</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Sản phẩm</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Tổng tiền</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Trạng thái</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Thanh toán</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Ngày tạo</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                        <td className="px-4 py-4">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsDetailModalOpen(true);
                            }}
                            className="font-bold text-emerald-600 hover:underline"
                          >
                            {order.orderNumber}
                          </button>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{order.customer.name}</div>
                            <div className="text-xs text-gray-500">{order.customer.email}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{order.seller.name}</div>
                            <div className="text-xs text-gray-500">{order.seller.email}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {order.items[0]?.productImage && (
                              <img
                                src={order.items[0].productImage}
                                alt={order.items[0].productName}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            )}
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white text-xs">
                                {order.items[0]?.productName}
                              </div>
                              {order.items.length > 1 && (
                                <div className="text-xs text-gray-500">+{order.items.length - 1} sản phẩm khác</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-bold text-gray-900 dark:text-white">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-4 py-4">
                          <PaymentStatusBadge status={order.paymentStatus} />
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-500">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setIsDetailModalOpen(true);
                              }}
                              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold transition-colors"
                            >
                              Chi tiết
                            </button>
                            <button
                              onClick={() => navigate(`/order/${order._id}`)}
                              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-colors"
                            >
                              Xem
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
                <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Hiển thị {(currentPage - 1) * pagination.limit + 1} - {Math.min(currentPage * pagination.limit, pagination.total)} trong tổng số {pagination.total} đơn hàng
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Trước
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pagination.totalPages}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {isDetailModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-black text-gray-900 dark:text-white">Chi tiết đơn hàng</h2>
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setSelectedOrder(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-bold text-gray-500 uppercase mb-1">Mã đơn hàng</div>
                  <div className="font-bold text-gray-900 dark:text-white">{selectedOrder.orderNumber}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-500 uppercase mb-1">Trạng thái</div>
                  <StatusBadge status={selectedOrder.status} />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-500 uppercase mb-1">Thanh toán</div>
                  <PaymentStatusBadge status={selectedOrder.paymentStatus} />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-500 uppercase mb-1">Phương thức thanh toán</div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {selectedOrder.paymentMethod === "cod" ? "Thanh toán khi nhận hàng" :
                     selectedOrder.paymentMethod === "bank_transfer" ? "Chuyển khoản ngân hàng" :
                     selectedOrder.paymentMethod === "vnpay" ? "VNPay" : "Stripe"}
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Thông tin khách hàng</h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
                  <div>
                    <span className="text-xs text-gray-500">Tên:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">{selectedOrder.customer.name}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Email:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">{selectedOrder.customer.email}</span>
                  </div>
                  {selectedOrder.customer.phone && (
                    <div>
                      <span className="text-xs text-gray-500">Số điện thoại:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">{selectedOrder.customer.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Seller Info */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Thông tin người bán</h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
                  <div>
                    <span className="text-xs text-gray-500">Tên:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">{selectedOrder.seller.name}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Email:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">{selectedOrder.seller.email}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Địa chỉ giao hàng</h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <div className="font-medium text-gray-900 dark:text-white">{selectedOrder.shippingAddress.fullName}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.ward && `${selectedOrder.shippingAddress.ward}, `}
                    {selectedOrder.shippingAddress.district && `${selectedOrder.shippingAddress.district}, `}
                    {selectedOrder.shippingAddress.city}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Điện thoại: {selectedOrder.shippingAddress.phone}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Sản phẩm</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      {item.productImage && (
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">{item.productName}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          {formatCurrency(item.price)} x {item.quantity}
                        </div>
                      </div>
                      <div className="font-bold text-gray-900 dark:text-white">
                        {formatCurrency(item.subtotal)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">Tổng cộng:</span>
                  <span className="text-xl font-black text-emerald-600">{formatCurrency(selectedOrder.totalAmount)}</span>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Ghi chú</h3>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-400">
                    {selectedOrder.notes}
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                <div>
                  <span className="font-bold">Ngày tạo:</span> {formatDate(selectedOrder.createdAt)}
                </div>
                <div>
                  <span className="font-bold">Cập nhật:</span> {formatDate(selectedOrder.updatedAt)}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setSelectedOrder(null);
                }}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-bold transition-colors"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  navigate(`/order/${selectedOrder._id}`);
                  setIsDetailModalOpen(false);
                }}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold transition-colors"
              >
                Xem chi tiết đầy đủ
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

