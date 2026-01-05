import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import type { Order } from "../types";
import { orderService, type Order as ApiOrder } from "@/services/orderService";
import { useDebounce } from "@/components/hooks/useDebounce";
import { cartService } from "@/services/cartService";
import { useCart } from "@/store/cart";
import { storeService } from "@/services/storeService";

// Tabs với mapping đến backend status
const TABS = [
  { id: "all", label: "Tất cả", status: null },
  { id: "pending", label: "Chờ xác nhận", status: "pending" },
  { id: "confirmed", label: "Đã xác nhận", status: "confirmed" },
  { id: "shipped", label: "Đang giao", status: "shipped" },
  { id: "delivered", label: "Hoàn thành", status: "delivered" },
  { id: "cancelled", label: "Đã hủy", status: "cancelled" },
];

const formatVND = (v: number) => 
  new Intl.NumberFormat("vi-VN").format(v) + "₫";

function getStatusColor(status: Order["status"]) {
  switch (status) {
    case "completed": return "text-emerald-600"; // Hoàn thành - Xanh
    case "shipping": return "text-blue-600";     // Đang giao - Xanh dương
    case "processing": return "text-orange-500"; // Chờ xác nhận - Cam
    default: return "text-red-500";              // Hủy - Đỏ
  }
}

function getStatusText(status: Order["status"]) {
  switch (status) {
    case "completed": return "ĐÃ GIAO HÀNG";
    case "shipping": return "ĐANG VẬN CHUYỂN";
    case "processing": return "CHỜ XÁC NHẬN";
    default: return "ĐÃ HỦY";
  }
}

// Map API order status to component order status
function mapOrderStatus(status: ApiOrder["status"] | "packaged"): Order["status"] {
  switch (status) {
    case "pending":
    case "confirmed":
    case "packaged":
      return "processing";
    case "shipped":
      return "shipping";
    case "delivered":
      return "completed";
    case "cancelled":
    case "rejected":
      return "cancelled";
    default:
      return "processing";
  }
}

type Props = {
  orders?: Order[]; // Optional để có thể fetch từ API
};

export default function OrdersTab({ orders: initialOrders }: Props) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState<Order[]>(initialOrders || []);
  const [loading, setLoading] = useState(!initialOrders);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [repurchasingOrderId, setRepurchasingOrderId] = useState<string | null>(null);
  const [loadingStoreId, setLoadingStoreId] = useState<string | null>(null);
  const { refreshCart } = useCart();

  const debouncedSearch = useDebounce(searchInput, 500);
  const activeTabId = searchParams.get("status") || "all";
  const currentPage = parseInt(searchParams.get("page") || "1");

  const activeTab = TABS.find(t => t.id === activeTabId) || TABS[0];

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      if (initialOrders) return; // Nếu đã có orders từ props, không fetch lại
      
      setLoading(true);
      setError(null);
      
      try {
        const params: any = {
          page: currentPage,
          limit: 10,
        };

        if (activeTab.status) {
          params.status = activeTab.status;
        }

        const res = await orderService.getMyOrders(params);
        
        if (res.success && res.data) {
          let filteredOrders = res.data.orders || [];
          
          // Filter by search query
          if (debouncedSearch.trim()) {
            filteredOrders = filteredOrders.filter(order =>
              order.orderNumber.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
              order.seller.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
              order.items.some(item => 
                item.productName.toLowerCase().includes(debouncedSearch.toLowerCase())
              )
            );
          }

          const mappedOrders: Order[] = filteredOrders.map((apiOrder) => ({
            id: apiOrder.orderNumber,
            _id: apiOrder._id,
            createdAt: new Date(apiOrder.createdAt).toISOString().split("T")[0],
            status: mapOrderStatus(apiOrder.status),
            itemCount: apiOrder.items.reduce((sum, item) => sum + item.quantity, 0),
            total: apiOrder.totalAmount,
            // Store full API order for display
            apiOrder: apiOrder as any,
          }));

          setOrders(mappedOrders);
          
          if (res.data.pagination) {
            setPagination(res.data.pagination);
          }
        } else {
          setOrders([]);
        }
      } catch (err: any) {
        console.error("Error fetching orders:", err);
        setError(err?.response?.data?.message || "Có lỗi xảy ra khi tải đơn hàng");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [activeTab.status, currentPage, debouncedSearch, initialOrders]);

  const handleTabChange = (tabId: string) => {
    setSearchParams({ status: tabId === "all" ? "" : tabId, page: "1" });
  };

  const handlePageChange = (page: number) => {
    setSearchParams({ ...Object.fromEntries(searchParams), page: page.toString() });
  };

  const handleViewOrderDetail = (orderId: string) => {
    navigate(`/order/${orderId}`);
  };

  const handleCancelClick = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowCancelModal(true);
    setCancelReason("");
  };

  const handleCancelOrder = async () => {
    if (!selectedOrderId) return;
    if (!cancelReason.trim()) {
      alert("Vui lòng nhập lý do hủy đơn hàng");
      return;
    }

    setCancellingOrderId(selectedOrderId);
    
    try {
      const res = await orderService.cancelOrder(selectedOrderId, cancelReason);
      
      if (res.success) {
        alert("Đã hủy đơn hàng thành công");
        setShowCancelModal(false);
        setSelectedOrderId(null);
        setCancelReason("");
        
        // Refresh orders
        if (!initialOrders) {
          const params: any = {
            page: currentPage,
            limit: 10,
          };
          if (activeTab.status) {
            params.status = activeTab.status;
          }
          const refreshRes = await orderService.getMyOrders(params);
          if (refreshRes.success && refreshRes.data) {
            const mappedOrders: Order[] = refreshRes.data.orders.map((apiOrder) => ({
              id: apiOrder.orderNumber,
              _id: apiOrder._id,
              createdAt: new Date(apiOrder.createdAt).toISOString().split("T")[0],
              status: mapOrderStatus(apiOrder.status),
              itemCount: apiOrder.items.reduce((sum, item) => sum + item.quantity, 0),
              total: apiOrder.totalAmount,
              apiOrder: apiOrder as any,
            }));
            setOrders(mappedOrders);
          }
        } else {
          // Reload page if using initialOrders
          window.location.reload();
        }
      } else {
        alert(res.message || "Có lỗi xảy ra khi hủy đơn hàng");
      }
    } catch (err: any) {
      console.error("Error cancelling order:", err);
      alert(err?.response?.data?.message || "Có lỗi xảy ra khi hủy đơn hàng");
    } finally {
      setCancellingOrderId(null);
    }
  };

  // Get first product image for display
  const getFirstProductImage = (order: Order) => {
    if ((order as any).apiOrder?.items?.[0]?.productImage) {
      return (order as any).apiOrder.items[0].productImage;
    }
    if ((order as any).apiOrder?.items?.[0]?.product?.images?.[0]) {
      return (order as any).apiOrder.items[0].product.images[0];
    }
    return null;
  };

  // Get seller name
  const getSellerName = (order: Order) => {
    return (order as any).apiOrder?.seller?.name || "Cửa hàng";
  };

  // Check if order can be cancelled
  const canCancelOrder = (order: Order) => {
    const status = (order as any).apiOrder?.status;
    return status === "pending" || status === "confirmed";
  };

  // Handle contact seller
  const handleContactSeller = (order: Order) => {
    const apiOrder = (order as any).apiOrder;
    const sellerId = apiOrder?.seller?._id;
    const sellerName = apiOrder?.seller?.name || "Người bán";
    
    if (sellerId) {
      const q = new URLSearchParams();
      q.set("with", sellerId);
      q.set("name", sellerName);
      // Optionally add order context
      q.set("orderId", order.id);
      navigate(`/chat?${q.toString()}`);
    } else {
      navigate("/chat");
    }
  };

  // Handle repurchase - add all items from order back to cart
  const handleRepurchase = async (order: Order) => {
    const apiOrder = (order as any).apiOrder;
    if (!apiOrder?.items || apiOrder.items.length === 0) {
      alert("Đơn hàng không có sản phẩm nào");
      return;
    }

    setRepurchasingOrderId(order.id);

    try {
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      // Add each item to cart
      for (const item of apiOrder.items) {
        try {
          // Get productId - could be ObjectId or populated object
          const productId = item.product?._id 
            ? String(item.product._id) 
            : (item.product ? String(item.product) : null);

          if (!productId) {
            errorCount++;
            errors.push(`${item.productName || "Sản phẩm"}: Không tìm thấy ID sản phẩm`);
            continue;
          }

          await cartService.addItem({
            productId: productId,
            quantity: item.quantity || 1,
          });
          successCount++;
        } catch (err: any) {
          errorCount++;
          const errorMsg = err?.response?.data?.message || "Lỗi không xác định";
          errors.push(`${item.productName || "Sản phẩm"}: ${errorMsg}`);
        }
      }

      // Refresh cart to update UI
      await refreshCart();

      // Show result message
      if (successCount > 0 && errorCount === 0) {
        alert(`Đã thêm ${successCount} sản phẩm vào giỏ hàng thành công!`);
        navigate("/cart");
      } else if (successCount > 0 && errorCount > 0) {
        alert(`Đã thêm ${successCount} sản phẩm vào giỏ hàng.\n${errorCount} sản phẩm gặp lỗi:\n${errors.join("\n")}`);
        navigate("/cart");
      } else {
        alert(`Không thể thêm sản phẩm vào giỏ hàng:\n${errors.join("\n")}`);
      }
    } catch (err: any) {
      console.error("Error repurchasing:", err);
      alert("Có lỗi xảy ra khi mua lại. Vui lòng thử lại sau.");
    } finally {
      setRepurchasingOrderId(null);
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-gray-50 dark:bg-gray-900/50 rounded-xl p-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
          <p className="text-gray-500">Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-gray-50 dark:bg-gray-900/50 rounded-xl p-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <span className="material-symbols-outlined text-6xl text-red-400">error_outline</span>
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-900/50 rounded-xl">
      
      {/* 1. Status Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-t-xl border-b border-gray-100 dark:border-gray-700 mb-3 sticky top-0 z-10 shadow-sm">
        <div className="flex overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                whitespace-nowrap px-6 py-4 text-sm font-medium border-b-2 transition-colors
                ${tab.id === activeTabId 
                  ? "border-emerald-500 text-emerald-600 dark:text-emerald-400" 
                  : "border-transparent text-gray-500 hover:text-emerald-500 dark:text-gray-400"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Search Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 mb-3 shadow-sm border-y border-gray-100 dark:border-gray-700">
        <div className="relative w-full bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
            search
          </span>
          <input 
            type="text" 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm kiếm theo Tên Shop, ID đơn hàng hoặc Tên sản phẩm"
            className="w-full h-10 pl-10 pr-4 bg-transparent text-sm outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400"
          />
        </div>
      </div>

      {/* 3. Order List */}
      <div className="space-y-3 pb-6">
        {orders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
            <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">shopping_bag</span>
            <p className="text-gray-500 dark:text-gray-400">Không có đơn hàng nào</p>
          </div>
        ) : (
          orders.map((o) => {
            const firstImage = getFirstProductImage(o);
            const sellerName = getSellerName(o);
            const canCancel = canCancelOrder(o);
            
            return (
              <div key={o.id} className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-lg p-5">
                
                {/* Header: Shop Name & Status */}
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-gray-800 dark:text-white">{sellerName}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const sellerId = (o as any).apiOrder?.seller?._id;
                        const sellerName = (o as any).apiOrder?.seller?.name || "Người bán";
                        if (sellerId) {
                          const q = new URLSearchParams();
                          q.set("with", sellerId);
                          q.set("name", sellerName);
                          q.set("orderId", o.id);
                          navigate(`/chat?${q.toString()}`);
                        } else {
                          navigate("/chat");
                        }
                      }}
                      className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold hover:bg-emerald-600"
                    >
                      Chat
                    </button>
                    <button 
                      onClick={async (e) => {
                        e.stopPropagation();
                        const sellerId = (o as any).apiOrder?.seller?._id;
                        if (!sellerId) return;

                        // Check if already loading
                        if (loadingStoreId === sellerId) return;

                        try {
                          setLoadingStoreId(sellerId);
                          // Get store by sellerId to get storeId
                          const storeResponse = await storeService.getStoreBySellerId(sellerId);
                          if (storeResponse.success && storeResponse.data?.store?._id) {
                            const storeId = storeResponse.data.store._id;
                            navigate(`/seller-profile/${storeId}`);
                          } else {
                            // Fallback: if store not found, navigate with sellerId
                            navigate(`/seller-profile/${sellerId}`);
                          }
                        } catch (err) {
                          console.error("Error fetching store:", err);
                          // Fallback: navigate with sellerId if API fails
                          navigate(`/seller-profile/${sellerId}`);
                        } finally {
                          setLoadingStoreId(null);
                        }
                      }}
                      disabled={loadingStoreId === (o as any).apiOrder?.seller?._id}
                      className="border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 text-[10px] px-1.5 py-0.5 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingStoreId === (o as any).apiOrder?.seller?._id ? "Đang tải..." : "Xem Shop"}
                    </button>
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-bold uppercase ${getStatusColor(o.status)}`}>
                    <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                    {getStatusText(o.status)}
                  </div>
                </div>

                {/* Body: Product Info */}
                <div 
                  onClick={() => handleViewOrderDetail(o._id)}
                  className="flex gap-4 mb-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 p-2 -mx-2 rounded transition-colors"
                >
                  {/* Product Image */}
                  <div className="w-20 h-20 shrink-0 bg-gray-200 dark:bg-gray-700 rounded border border-gray-100 dark:border-gray-600 overflow-hidden">
                    {firstImage ? (
                      <img 
                        src={firstImage} 
                        alt="Product" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="material-symbols-outlined text-gray-400 text-3xl flex items-center justify-center w-full h-full">image</span>';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-gray-400 text-3xl">image</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                      Đơn hàng #{o.id}
                      {(o as any).apiOrder?.items?.length > 1 && ` - ${(o as any).apiOrder.items.length} sản phẩm`}
                    </h4>
                    {(o as any).apiOrder?.items?.[0] && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                        {(o as any).apiOrder.items[0].productName}
                        {(o as any).apiOrder.items.length > 1 && ` và ${(o as any).apiOrder.items.length - 1} sản phẩm khác`}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">x{o.itemCount} sản phẩm</div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {formatVND(o.total)}
                    </div>
                  </div>
                </div>

                {/* Footer: Total & Actions */}
                <div className="border-t border-gray-100 dark:border-gray-700 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-gray-500 w-full sm:w-auto text-center sm:text-left">
                    {o.status === 'completed' && (
                      <>Đánh giá shop ngay khi nhận hàng để nhận <span className="text-emerald-600 font-bold">200 xu</span></>
                    )}
                    {o.status === 'shipping' && (
                      <>Đơn hàng đang được vận chuyển</>
                    )}
                    {o.status === 'processing' && (
                      <>Đơn hàng đang chờ xử lý</>
                    )}
                    {o.status === 'cancelled' && (
                      <>Đơn hàng đã bị hủy</>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-end gap-4 w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Thành tiền:</span>
                      <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatVND(o.total)}</span>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewOrderDetail(o._id);
                        }}
                        className="flex-1 sm:flex-none px-6 py-2 rounded border border-emerald-500 text-emerald-600 dark:text-emerald-400 text-sm font-medium hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                      >
                        Xem chi tiết
                      </button>
                      
                      {canCancel && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelClick(o._id);
                          }}
                          disabled={cancellingOrderId === o._id}
                          className="flex-1 sm:flex-none px-6 py-2 rounded border border-red-500 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {cancellingOrderId === o._id ? "Đang hủy..." : "Hủy đơn"}
                        </button>
                      )}
                      
                      {o.status === 'completed' && (
                        <>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleContactSeller(o);
                            }}
                            className="flex-1 sm:flex-none px-6 py-2 rounded border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            Liên hệ
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRepurchase(o);
                            }}
                            disabled={repurchasingOrderId === o.id}
                            className="flex-1 sm:flex-none px-6 py-2 rounded bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {repurchasingOrderId === o.id ? "Đang thêm..." : "Mua lại"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let pageNum;
              if (pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-8 h-8 flex items-center justify-center rounded text-sm font-bold transition-colors ${
                    pageNum === currentPage
                      ? "bg-emerald-500 text-white"
                      : "border border-transparent hover:bg-white dark:hover:bg-gray-800 text-gray-500"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            {pagination.totalPages > 5 && currentPage < pagination.totalPages - 2 && (
              <span className="text-gray-400 text-sm">...</span>
            )}
            
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
              className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        )}
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Hủy đơn hàng</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Vui lòng nhập lý do hủy đơn hàng của bạn:
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Nhập lý do hủy đơn hàng..."
              className="w-full h-24 p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedOrderId(null);
                  setCancelReason("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={!cancelReason.trim() || cancellingOrderId !== null}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {cancellingOrderId ? "Đang hủy..." : "Xác nhận hủy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}