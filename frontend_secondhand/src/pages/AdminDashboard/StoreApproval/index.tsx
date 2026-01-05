import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import { adminService, type PendingStore } from "@/services/adminService";

const StoreDetailModal = ({
  store,
  isOpen,
  onClose,
  onApprove,
  onReject,
}: {
  store: PendingStore | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) => {
  if (!isOpen || !store) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Chi tiết cửa hàng</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              {store.logo && (
                <div className="aspect-square rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                  <img src={store.logo} alt={store.storeName} className="w-full h-full object-cover" />
                </div>
              )}
              {store.coverImage && (
                <div className="aspect-video rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                  <img src={store.coverImage} alt="Cover" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{store.storeName}</h4>
                <span className="text-xs text-gray-500">
                  Ngày đăng ký: {new Date(store.createdAt).toLocaleDateString("vi-VN")}
                </span>
              </div>

              {store.description && (
                <div>
                  <h5 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Mô tả</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{store.description}</p>
                </div>
              )}

              <div>
                <h5 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Thông tin người bán</h5>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Tên:</span>{" "}
                    <span className="font-semibold text-gray-900 dark:text-white">{store.seller.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>{" "}
                    <span className="font-semibold text-gray-900 dark:text-white">{store.seller.email}</span>
                  </div>
                  {store.seller.phone && (
                    <div>
                      <span className="text-gray-500">SĐT:</span>{" "}
                      <span className="font-semibold text-gray-900 dark:text-white">{store.seller.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h5 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Thông tin liên hệ</h5>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Địa chỉ:</span>{" "}
                    <span className="font-semibold text-gray-900 dark:text-white">{store.address}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">SĐT:</span>{" "}
                    <span className="font-semibold text-gray-900 dark:text-white">{store.phone}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>{" "}
                    <span className="font-semibold text-gray-900 dark:text-white">{store.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Đóng
          </button>
          <button
            onClick={() => {
              onReject(store._id);
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-colors"
          >
            Từ chối
          </button>
          <button
            onClick={() => {
              onApprove(store._id);
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 transition-colors"
          >
            Phê duyệt
          </button>
        </div>
      </div>
    </div>
  );
};

const RejectReasonModal = ({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) => {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason);
      setReason("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Lý do từ chối</h3>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Nhập lý do từ chối cửa hàng này..."
            rows={4}
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
          />
          <div className="flex items-center justify-end gap-3 mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleConfirm}
              disabled={!reason.trim()}
              className="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function StoreApprovalPage() {
  const [stores, setStores] = useState<PendingStore[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [selectedStore, setSelectedStore] = useState<PendingStore | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchStores = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getPendingStores({ page: currentPage, limit: 10 });
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
  }, [currentPage]);

  const handleApprove = async (storeId: string) => {
    try {
      const res = await adminService.approveStore(storeId);
      if (res.success) {
        alert("Đã phê duyệt cửa hàng thành công!");
        fetchStores();
      } else {
        alert(res.message || "Có lỗi xảy ra khi phê duyệt");
      }
    } catch (error: any) {
      alert(error?.response?.data?.message || "Có lỗi xảy ra khi phê duyệt");
      console.error("Error approving store:", error);
    }
  };

  const handleReject = async (storeId: string, reason?: string) => {
    try {
      const res = await adminService.rejectStore(storeId, reason);
      if (res.success) {
        alert("Đã từ chối cửa hàng thành công!");
        fetchStores();
      } else {
        alert(res.message || "Có lỗi xảy ra khi từ chối");
      }
    } catch (error: any) {
      alert(error?.response?.data?.message || "Có lỗi xảy ra khi từ chối");
      console.error("Error rejecting store:", error);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Phê duyệt cửa hàng</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Xem xét và phê duyệt các đơn đăng ký trở thành người bán
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">Tổng số đơn chờ duyệt</div>
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
            <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">store</span>
            <p className="text-gray-600 dark:text-gray-400">Không có cửa hàng nào chờ duyệt</p>
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
                      Ngày đăng ký
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {stores.map((store) => (
                    <tr key={store._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {store.logo && (
                            <img
                              src={store.logo}
                              alt={store.storeName}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
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
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-semibold text-gray-900 dark:text-white">{store.seller.name}</div>
                          <div className="text-gray-500 dark:text-gray-400">{store.seller.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-gray-900 dark:text-white">{store.phone}</div>
                          <div className="text-gray-500 dark:text-gray-400">{store.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(store.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedStore(store);
                              setDetailModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          >
                            Xem chi tiết
                          </button>
                          <button
                            onClick={() => handleReject(store._id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                          >
                            Từ chối
                          </button>
                          <button
                            onClick={() => handleApprove(store._id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors"
                          >
                            Phê duyệt
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
                  {Math.min(currentPage * pagination.limit, pagination.total)} trong tổng số {pagination.total} đơn
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

        {/* Modals */}
        <StoreDetailModal
          store={selectedStore}
          isOpen={detailModalOpen}
          onClose={() => {
            setDetailModalOpen(false);
            setSelectedStore(null);
          }}
          onApprove={handleApprove}
          onReject={(id) => {
            setRejectTargetId(id);
            setRejectModalOpen(true);
          }}
        />

        <RejectReasonModal
          isOpen={rejectModalOpen}
          onClose={() => {
            setRejectModalOpen(false);
            setRejectTargetId(null);
          }}
          onConfirm={(reason) => {
            if (rejectTargetId) {
              handleReject(rejectTargetId, reason);
            }
          }}
        />
      </div>
    </AdminLayout>
  );
}


