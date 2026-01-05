import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import OrderHeader from "./components/OrderHeader";
import ShippingStatus from "./components/ShippingStatus";
import OrderItems from "./components/OrderItems";
import OrderAddress from "./components/OrderAddress";
import OrderSidebar from "./components/OrderSidebar";
import type { OrderDetail, OrderItem, TrackingEvent } from "./types";
import PageLayout from "@/components/layout/PageLayout";
import { orderService } from "@/services/orderService";
import { storeService } from "@/services/storeService";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadOrder = async () => {
      if (!id) {
        setError("Không tìm thấy ID đơn hàng");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const res = await orderService.getOrderById(id);
        
        if (!res?.success || !res?.data?.order) {
          setError("Không tìm thấy đơn hàng");
          setLoading(false);
          return;
        }
        
        const o = res.data.order as any;
        
        // Map items
        const items: OrderItem[] = (o.items || []).map((it: any) => {
          // Get productId - could be ObjectId or populated object
          const productId = it.product?._id 
            ? String(it.product._id) 
            : (it.product ? String(it.product) : String(it._id || ""));
          
          return {
            id: productId, // Use productId for review matching
            name: it.productName || it.product?.title || "Sản phẩm",
            variant: it.product?.condition ? `Tình trạng: ${it.product.condition}` : "",
            price: it.price || 0,
            quantity: it.quantity || 1,
            imageUrl: it.productImage || it.product?.images?.[0] || "/placeholder-product.jpg",
            tags: [],
          };
        });
        
        // Build tracking events based on order status and timestamps
        const tracking: TrackingEvent[] = [];
        const createdAt = o.createdAt ? new Date(o.createdAt) : new Date();
        
        // Always add created event
        tracking.push({
          id: "created",
          status: "Đặt hàng thành công",
          date: createdAt.toLocaleDateString("vi-VN"),
          time: createdAt.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' }),
          description: "",
          isCurrent: o.status === "pending",
        });
        
        // Add confirmed event if status is confirmed or beyond
        if (["confirmed", "packaged", "shipped", "delivered"].includes(o.status)) {
          const confirmedAt = o.updatedAt ? new Date(o.updatedAt) : createdAt;
          tracking.push({
            id: "confirmed",
            status: "Đã xác nhận",
            date: confirmedAt.toLocaleDateString("vi-VN"),
            time: confirmedAt.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' }),
            description: "",
            isCurrent: o.status === "confirmed",
          });
        }
        
        // Add packaged event if status is packaged or beyond
        if (["packaged", "shipped", "delivered"].includes(o.status)) {
          const packagedAt = o.updatedAt ? new Date(o.updatedAt) : createdAt;
          tracking.push({
            id: "packaged",
            status: "Đã đóng gói",
            date: packagedAt.toLocaleDateString("vi-VN"),
            time: packagedAt.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' }),
            description: "",
            isCurrent: o.status === "packaged",
          });
        }
        
        // Add shipped event if status is shipped or delivered
        if (["shipped", "delivered"].includes(o.status)) {
          const shippedAt = o.updatedAt ? new Date(o.updatedAt) : createdAt;
          tracking.push({
            id: "shipped",
            status: "Đã gửi hàng",
            date: shippedAt.toLocaleDateString("vi-VN"),
            time: shippedAt.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' }),
            description: "",
            isCurrent: o.status === "shipped",
          });
        }
        
        // Add delivered event if status is delivered
        if (o.status === "delivered") {
          const deliveredAt = o.deliveredAt ? new Date(o.deliveredAt) : (o.updatedAt ? new Date(o.updatedAt) : createdAt);
          tracking.push({
            id: "delivered",
            status: "Đã giao hàng",
            date: deliveredAt.toLocaleDateString("vi-VN"),
            time: deliveredAt.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' }),
            description: "",
            isCurrent: true,
          });
        }
        
        // Map status to UI status
        let uiStatus: OrderDetail["status"] = "placed";
        if (o.status === "packaged") {
          uiStatus = "packed";
        } else if (o.status === "shipped") {
          uiStatus = "shipping";
        } else if (o.status === "delivered") {
          uiStatus = "completed";
        } else if (o.status === "cancelled" || o.status === "rejected") {
          uiStatus = "cancelled";
        }
        
        // Build shipping address string
        const addressParts = [
          o.shippingAddress?.address,
          o.shippingAddress?.ward,
          o.shippingAddress?.district,
          o.shippingAddress?.city
        ].filter(Boolean);
        
        // Get store info to get real rating and reviewCount
        let storeId: string | undefined = undefined;
        let storeRating = 5;
        let storeReviewCount = 0;
        const sellerId = String(o.seller?._id || "");
        
        if (sellerId) {
          try {
            const storeResponse = await storeService.getStoreBySellerId(sellerId);
            if (storeResponse.success && storeResponse.data?.store) {
              const store = storeResponse.data.store;
              storeId = store._id;
              storeRating = store.rating?.average || 5;
              storeReviewCount = store.rating?.count || 0;
            }
          } catch (err) {
            console.error("Error fetching store info:", err);
            // Use default values if store fetch fails
          }
        }

        const ui: OrderDetail = {
          id: String(o._id || o.orderNumber || id),
          createdAt: createdAt.toLocaleString("vi-VN"),
          status: uiStatus,
          backendStatus: o.status, // Store backend status for cancel check
          shop: {
            id: sellerId,
            storeId: storeId,
            name: o.seller?.name || "Người bán",
            avatarUrl: o.seller?.avatarUrl || "",
            rating: storeRating,
            reviewCount: storeReviewCount,
          },
          items,
          shippingAddress: {
            name: o.shippingAddress?.fullName || "",
            phone: o.shippingAddress?.phone || "",
            address: addressParts.length > 0 ? addressParts.join(", ") : "Chưa có địa chỉ",
          },
          tracking,
          payment: {
            subtotal: o.totalAmount || 0,
            shippingFee: 0,
            discount: 0,
            total: o.totalAmount || 0,
            method: o.paymentMethod === "cod" ? "COD" : o.paymentMethod === "bank_transfer" ? "CHUYỂN KHOẢN" : o.paymentMethod?.toUpperCase() || "COD",
          },
          reviewInfo: o.reviewInfo || undefined,
        };
        
        setOrder(ui);
      } catch (err: any) {
        console.error("Error loading order:", err);
        setError(err?.response?.data?.message || err?.message || "Có lỗi xảy ra khi tải đơn hàng");
      } finally {
        setLoading(false);
      }
    };
    
    loadOrder();
  }, [id, refreshKey]);

  const handleOrderUpdated = () => {
    // Trigger reload by updating refreshKey
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
            <p className="text-gray-500">Đang tải thông tin đơn hàng...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !order) {
    return (
      <PageLayout>
        <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col items-center justify-center gap-4">
            <span className="material-symbols-outlined text-6xl text-gray-400">error_outline</span>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Không tìm thấy đơn hàng</h2>
            <p className="text-gray-500 text-center">{error || "Đơn hàng không tồn tại hoặc bạn không có quyền truy cập"}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors"
            >
              Quay lại
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <OrderHeader order={order} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <ShippingStatus tracking={order.tracking} orderStatus={order.status} />
            <OrderItems 
              items={order.items} 
              orderId={order.id}
              reviewInfo={order.reviewInfo}
              onReviewSuccess={handleOrderUpdated}
            />
            <OrderAddress address={order.shippingAddress} />
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-6">
              <OrderSidebar order={order} onOrderUpdated={handleOrderUpdated} />
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}