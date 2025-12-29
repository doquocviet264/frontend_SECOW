import type { OrderDetail } from "../types";

type Props = {
  order: OrderDetail;
};

export default function OrderHeader({ order }: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">
          Chi tiết đơn hàng #{order.id}
        </h1>
        <div className="text-sm text-gray-500 mt-1">
          Đặt ngày {order.createdAt}
        </div>
      </div>
      
      <div className="flex gap-3">
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <span className="material-symbols-outlined text-[18px]">print</span>
          In hóa đơn
        </button>
        <button className="px-4 py-2 rounded-lg border border-red-100 text-red-600 bg-red-50 hover:bg-red-100 text-sm font-semibold transition-colors">
          Hủy đơn hàng
        </button>
      </div>
    </div>
  );
}