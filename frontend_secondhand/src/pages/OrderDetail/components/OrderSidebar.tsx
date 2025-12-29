import type { OrderDetail } from "../types";

type Props = {
  order: OrderDetail;
};

const formatVND = (v: number) => new Intl.NumberFormat("vi-VN").format(v) + "₫";

export default function OrderSidebar({ order }: Props) {
  const { shop, payment } = order;

  return (
    <div className="space-y-6">
      {/* 1. Shop Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
           <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
              <img src={shop.avatarUrl} alt={shop.name} className="w-full h-full object-cover" />
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

        <button className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all active:scale-95">
           Đã nhận được hàng
        </button>
        
        <p className="text-center text-xs text-gray-400 mt-3">
           Vui lòng chỉ nhấn "Đã nhận được hàng" khi bạn đã kiểm tra và hài lòng với sản phẩm.
        </p>
      </div>
      
      <div className="text-center">
         <a href="#" className="text-sm text-gray-500 hover:text-emerald-600 hover:underline">Bạn cần trợ giúp về đơn hàng này?</a>
      </div>
    </div>
  );
}