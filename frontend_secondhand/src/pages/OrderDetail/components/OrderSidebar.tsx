import { useState } from "react";
import type { OrderDetail } from "../types";
import { orderService } from "@/services/orderService";

type Props = {
  order: OrderDetail;
  onOrderUpdated?: () => void;
};

const formatVND = (v: number) => new Intl.NumberFormat("vi-VN").format(v) + "₫";

export default function OrderSidebar({ order, onOrderUpdated }: Props) {
  const { shop, payment } = order;
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // Chỉ hiển thị nút khi đơn hàng đã được gửi (shipping) và chưa hoàn thành
  // Note: order.status là UI status ("shipping" = backend "shipped", "completed" = backend "delivered")
  const canConfirmDelivery = order.status === "shipping";
  const isCompleted = order.status === "completed";
  const isCancelled = order.status === "cancelled";
  
  // Check if order can be cancelled (only pending or confirmed)
  const canCancelOrder = order.backendStatus === "pending" || order.backendStatus === "confirmed";

  const handleConfirmDelivery = async () => {
    if (!canConfirmDelivery || isConfirming) return;

    // Xác nhận với người dùng
    const confirmed = window.confirm(
      "Bạn có chắc chắn đã nhận được hàng và hài lòng với sản phẩm?\n\n" +
      "Sau khi xác nhận, đơn hàng sẽ được hoàn tất và bạn không thể hủy đơn hàng nữa."
    );

    if (!confirmed) return;

    setIsConfirming(true);
    setError(null);

    try {
      // order.id được map từ order._id trong OrderDetail component
      const response = await orderService.confirmDelivery(order.id);
      
      // Kiểm tra response thành công
      if (response.success) {
        // Gọi callback để reload đơn hàng
        if (onOrderUpdated) {
          onOrderUpdated();
        } else {
          // Fallback: reload trang
          window.location.reload();
        }
      } else {
        throw new Error(response.message || "Không thể xác nhận nhận hàng");
      }
    } catch (err: any) {
      console.error("Error confirming delivery:", err);
      const errorMessage = err?.response?.data?.message || 
                           err?.response?.data?.error ||
                           err?.message || 
                           "Có lỗi xảy ra khi xác nhận nhận hàng";
      setError(errorMessage);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      alert("Vui lòng nhập lý do hủy đơn hàng");
      return;
    }

    setIsCancelling(true);
    setError(null);

    try {
      const response = await orderService.cancelOrder(order.id, cancelReason);
      
      if (response.success) {
        alert("Đã hủy đơn hàng thành công");
        setShowCancelModal(false);
        setCancelReason("");
        
        // Reload order
        if (onOrderUpdated) {
          onOrderUpdated();
        } else {
          window.location.reload();
        }
      } else {
        throw new Error(response.message || "Không thể hủy đơn hàng");
      }
    } catch (err: any) {
      console.error("Error cancelling order:", err);
      const errorMessage = err?.response?.data?.message || 
                           err?.response?.data?.error ||
                           err?.message || 
                           "Có lỗi xảy ra khi hủy đơn hàng";
      setError(errorMessage);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Shop Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
           <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center">
              {shop.avatarUrl ? (
                <img src={shop.avatarUrl} alt={shop.name} className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-gray-400 text-2xl">storefront</span>
              )}
           </div>
           <div>
              <h4 className="font-bold text-gray-900 dark:text-white text-sm">{shop.name}</h4>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                 <span className="material-symbols-outlined text-[14px] text-amber-400 filled">star</span>
                 <span className="font-semibold text-gray-700 dark:text-gray-300">{shop.rating}</span>
                 <span>({shop.reviewCount} đánh giá)</span>
              </div>
           </div>
        </div>
        
        <div className="flex gap-2">
           <button className="flex-1 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2 transition-colors">
              <span className="material-symbols-outlined text-[18px]">chat</span>
              Chat ngay
           </button>
           <button className="h-9 w-9 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <span className="material-symbols-outlined text-[18px] text-gray-500">storefront</span>
           </button>
        </div>
      </div>

      {/* 2. Order Summary Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
        <h4 className="font-bold text-gray-900 dark:text-white mb-4">Tổng quan đơn hàng</h4>
        
        <div className="space-y-3 text-sm border-b border-gray-100 dark:border-gray-700 pb-4 mb-4">
           <div className="flex justify-between">
              <span className="text-gray-500">Tạm tính ({order.items.length} món)</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatVND(payment.subtotal)}</span>
           </div>
           <div className="flex justify-between">
              <span className="text-gray-500">Phí vận chuyển</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatVND(payment.shippingFee)}</span>
           </div>
           <div className="flex justify-between">
              <span className="text-gray-500">Giảm giá vận chuyển</span>
              <span className="font-medium text-emerald-600">-{formatVND(payment.discount)}</span>
           </div>
        </div>

        <div className="flex justify-between items-end mb-6">
           <span className="font-bold text-gray-900 dark:text-white">Tổng tiền</span>
           <span className="text-2xl font-black text-emerald-600">{formatVND(payment.total)}</span>
        </div>

        {/* Guarantee Badge */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 flex gap-3 mb-6">
           <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 shrink-0">verified_user</span>
           <div>
              <div className="text-xs font-bold text-blue-700 dark:text-blue-300">Đảm bảo SecondHand</div>
              <div className="text-[10px] text-blue-600/80 dark:text-blue-400/80 leading-tight mt-0.5">
                 Hoàn tiền 100% nếu sản phẩm không đúng mô tả hoặc không nhận được hàng.
              </div>
           </div>
        </div>

        {/* Status Badge */}
        {isCompleted && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              <span className="font-bold text-sm">Đơn hàng đã hoàn thành</span>
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
              Cảm ơn bạn đã mua sắm tại SecondHand!
            </p>
            {order.reviewInfo?.canReview && !order.reviewInfo.allReviewed && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-semibold">
                Hãy đánh giá sản phẩm để giúp người khác có thêm thông tin!
              </p>
            )}
          </div>
        )}

        {/* Cancel Order Button */}
        {canCancelOrder && !isCompleted && !isCancelled && (
          <button 
            onClick={() => setShowCancelModal(true)}
            className="w-full h-12 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 mb-4"
          >
            <span className="material-symbols-outlined text-[20px]">cancel</span>
            <span>Hủy đơn hàng</span>
          </button>
        )}

        {/* Confirm Delivery Button */}
        {canConfirmDelivery && !isCompleted && !isCancelled && (
          <>
            <button 
              onClick={handleConfirmDelivery}
              disabled={isConfirming}
              className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all active:scale-95 disabled:active:scale-100 flex items-center justify-center gap-2"
            >
              {isConfirming ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Đang xác nhận...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                  <span>Đã nhận được hàng</span>
                </>
              )}
            </button>
            
            {error && (
              <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
            
            <p className="text-center text-xs text-gray-400 mt-3">
               Vui lòng chỉ nhấn "Đã nhận được hàng" khi bạn đã kiểm tra và hài lòng với sản phẩm.
            </p>
          </>
        )}

        {/* Cancelled Status */}
        {isCancelled && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <span className="material-symbols-outlined text-[20px]">cancel</span>
              <span className="font-bold text-sm">Đơn hàng đã bị hủy</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="text-center">
         <a href="#" className="text-sm text-gray-500 hover:text-emerald-600 hover:underline">Bạn cần trợ giúp về đơn hàng này?</a>
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
              className="w-full h-24 p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
            />
            {error && (
              <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                  setError(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={!cancelReason.trim() || isCancelling}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {isCancelling ? "Đang hủy..." : "Xác nhận hủy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}