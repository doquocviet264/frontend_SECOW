import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { useDebounce } from "@/components/hooks/useDebounce";
import { productService } from "@/services/productService";
import type { Product } from "@/types/product"; // Import interface chuẩn

const TABS = [
  { id: "pending", label: "Chờ duyệt" },
  { id: "active", label: "Đã duyệt" },
  { id: "violation", label: "Đã từ chối" },
  { id: "all", label: "Tất cả" },
];

const StatusBadge = ({ status, reason }: { status: Product["status"], reason?: string }) => {
  const styles: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700 border-emerald-200",
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
    hidden: "bg-gray-100 text-gray-700 border-gray-200",
    violation: "bg-red-100 text-red-700 border-red-200",
    sold: "bg-blue-100 text-blue-700 border-blue-200",
  };

  const labels: Record<string, string> = {
    active: "Đã duyệt",
    pending: "Chờ duyệt",
    rejected: "Đã từ chối",
    hidden: "Đã ẩn",
    violation: "Vi phạm",
    sold: "Đã bán",
  };

  return (
    <div className="flex flex-col items-start gap-1.5">
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${styles[status] || "bg-gray-100"}`}>
        {labels[status] || status}
      </span>

      {( status === 'violation') && reason && (
        <div className="p-2 bg-red-50 border border-red-100 rounded-lg max-w-[200px]">
          <p className="text-[11px] text-red-600 leading-snug break-words font-medium">
            <span className="font-bold">Lý do:</span> {reason}
          </p>
        </div>
      )}
    </div>
  );
};

const ProductDetailModal = ({ 
  product, 
  isOpen, 
  onClose,
  onApprove,
  onReject 
}: { 
  product: Product | null, 
  isOpen: boolean, 
  onClose: () => void,
  onApprove: (id: string) => void,
  onReject: (id: string) => void
}) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Chi tiết sản phẩm</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="aspect-square rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                <img 
                  src={product.images?.[0] || 'https://via.placeholder.com/300'} 
                  alt={product.title} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {product.images?.slice(0, 4).map((img, idx) => (
                  <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-gray-100 cursor-pointer hover:border-emerald-500">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <StatusBadge status={product.status} reason={product.violationReason}/>
                  <span className="text-xs text-gray-500">
                    Ngày đăng tải: {new Date(product.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{product.title}</h2>
                <div className="mt-2 text-2xl font-black text-emerald-600">
                  {new Intl.NumberFormat("vi-VN").format(product.price)}₫
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Người bán:</span>
                  <div className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                    <img 
                      src={product.seller?.logo || 'https://via.placeholder.com/50'} 
                      className="w-5 h-5 rounded-full object-cover" 
                      alt="Shop Logo"
                    />
                    {product.seller?.storeName || "Unknown Shop"}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Danh mục:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {product.category?.name || "Chưa phân loại"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Thương hiệu:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{product.brand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tình trạng:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{product.condition}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Kho hàng:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{product.stock}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">Mô tả sản phẩm</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>

              {product.attributes && product.attributes.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">Thông số chi tiết</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {product.attributes.map((attr, idx) => (
                      <div key={idx} className="flex flex-col bg-gray-50 dark:bg-gray-700/30 p-2 rounded">
                        <span className="text-xs text-gray-500">{attr.name}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{attr.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {product.status === 'pending' && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3">
             <button 
              onClick={() => onReject(product._id)}
              className="px-5 py-2.5 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-colors"
            >
              Từ chối
            </button>
            <button 
              onClick={() => onApprove(product._id)}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all"
            >
              Duyệt đăng bán
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const RejectReasonModal = ({ 
  isOpen, 
  onClose, 
  onSubmit 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onSubmit: (reason: string) => void 
}) => {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-scale-in">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Lý do từ chối sản phẩm?</h3>
        <textarea
          className="w-full h-32 p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none resize-none"
          placeholder="Nhập lý do (VD: Hình ảnh mờ, sai danh mục, hàng cấm...)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          autoFocus
        />
        <div className="flex justify-end gap-3 mt-6">
          <button 
            onClick={onClose} 
            className="px-4 py-2 rounded-lg text-gray-500 font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Hủy bỏ
          </button>
          <button 
            onClick={() => {
              if (reason.trim()) {
                onSubmit(reason);
                setReason("");
              }
            }}
            disabled={!reason.trim()}
            className="px-4 py-2 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            Xác nhận từ chối
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ProductApprovalPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);

  const [searchInputValue, setSearchInputValue] = useState(searchParams.get("search") || "");
  const debouncedSearchQuery = useDebounce(searchInputValue, 500);

  const activeTab = useMemo(() => searchParams.get("status") || "pending", [searchParams]);
  const currentPage = useMemo(() => parseInt(searchParams.get("page") || "1"), [searchParams]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        status: activeTab === 'all' ? undefined : activeTab,
        search: debouncedSearchQuery || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      const res = await productService.getAdminProducts(params);
      console.log("Admin products response:", res.data);
      if (res.success && res.data) {
        setProducts(res.data.products || []);

        if (res.pagination) {
          setPagination(res.pagination);
        }
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, activeTab, debouncedSearchQuery]);

  const handleFilterChange = (key: string, value: string | null) => {
    setSearchParams(prev => {
      if (value === null) prev.delete(key);
      else prev.set(key, value);
      
      if (key !== 'page') prev.set('page', '1');
      return prev;
    });
  };

  const handleApprove = async (id: string) => {
    if (!window.confirm("Xác nhận duyệt sản phẩm này?")) return;

    try {
      const res = await productService.approveProduct(id);
      if (res.success) {
        fetchProducts();
        setSelectedProduct(null);
      } else {
        alert(res.message || "Lỗi khi duyệt sản phẩm");
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Lỗi kết nối server");
    }
  };

  const handleRejectClick = (id: string) => {
    setRejectTargetId(id);
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async (reason: string) => {
    if (!rejectTargetId) return;

    try {
      const res = await productService.rejectProduct(rejectTargetId, reason);
      if (res.success) {
        fetchProducts();
        setRejectModalOpen(false);
        setRejectTargetId(null);
        setSelectedProduct(null);
      } else {
        alert(res.message || "Lỗi khi từ chối sản phẩm");
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Lỗi kết nối server");
    }
  };

  const formatVND = (price: number) => new Intl.NumberFormat("vi-VN").format(price);

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Phê duyệt sản phẩm</h1>
            <p className="text-sm text-gray-500 mt-1">Kiểm soát chất lượng hàng hóa đăng bán trên sàn</p>
          </div>
          <div className="flex gap-3">
             <div className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm text-sm font-bold text-gray-700 dark:text-gray-300">
                Tổng: {pagination.total}
             </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          
          <div className="border-b border-gray-100 dark:border-gray-700 overflow-x-auto">
            <div className="flex px-6">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleFilterChange('status', tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-4 border-b-2 text-sm font-bold whitespace-nowrap transition-colors
                    ${activeTab === tab.id
                      ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-3 bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
            <div className="lg:col-span-12 relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
              <input
                type="text"
                placeholder="Tìm kiếm theo tên sản phẩm..."
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                value={searchInputValue}
                onChange={(e) => setSearchInputValue(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 uppercase text-xs font-bold border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="p-4">Sản phẩm</th>
                  <th className="p-4">Người bán</th>
                  <th className="p-4">Giá bán</th>
                  <th className="p-4">Ngày tạo</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                {isLoading ? (
                   <tr><td colSpan={6} className="text-center p-8 text-gray-500">Đang tải dữ liệu...</td></tr>
                ) : products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product._id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="p-4">
                        <div className="flex gap-3">
                          <div className="w-12 h-12 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shrink-0 bg-gray-100">
                            <img src={product.images?.[0] || 'https://via.placeholder.com/100'} alt={product.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0 max-w-[250px]">
                            <div className="font-bold text-gray-900 dark:text-white truncate" title={product.title}>
                              {product.title}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                                DM: {product.category?.name || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                           <img 
                            src={product.seller?.logo || 'https://via.placeholder.com/50'} 
                            className="w-6 h-6 rounded-full border border-gray-200 bg-white object-cover"
                            alt=""
                           />
                           <span className="text-gray-700 dark:text-gray-300 font-medium truncate max-w-[120px]" title={product.seller?.storeName}>
                            {product.seller?.storeName || "Unknown"}
                           </span>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-gray-900 dark:text-white">{formatVND(product.price)}</td>
                      <td className="p-4 text-gray-500">
                        {new Date(product.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="p-4">
                        <StatusBadge status={product.status} reason={product.violationReason}/>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedProduct(product)}
                            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                            title="Xem chi tiết"
                          >
                             <span className="material-symbols-outlined text-[20px]">visibility</span>
                          </button>

                          {product.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleRejectClick(product._id)}
                                className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600"
                                title="Từ chối"
                              >
                                <span className="material-symbols-outlined text-[20px]">block</span>
                              </button>
                              <button
                                onClick={() => handleApprove(product._id)}
                                className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 hover:text-emerald-600"
                                title="Duyệt ngay"
                              >
                                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className="text-center p-8 text-gray-500">Không tìm thấy yêu cầu nào.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          
          {pagination.total > 0 && (
            <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
               <span className="text-sm text-gray-500">
                  Hiển thị {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} trong {pagination.total}
               </span>
               <div className="flex items-center gap-1">
                 <button 
                    onClick={() => handleFilterChange('page', (currentPage - 1).toString())}
                    disabled={currentPage <= 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                    <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                 </button>
                 
                 <span className="px-3 text-sm font-bold text-gray-700">{currentPage} / {pagination.totalPages}</span>

                 <button 
                    onClick={() => handleFilterChange('page', (currentPage + 1).toString())}
                    disabled={currentPage >= pagination.totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                 </button>
               </div>
            </div>
          )}
        </div>
      </div>

      <ProductDetailModal 
        product={selectedProduct} 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
        onApprove={handleApprove}
        onReject={handleRejectClick}
      />
      
      <RejectReasonModal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onSubmit={handleConfirmReject}
      />

    </AdminLayout>
  );
}