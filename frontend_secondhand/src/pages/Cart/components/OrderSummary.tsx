type Props = {
  subtotal: number;
  discount: number;
  totalItems: number;
};

const formatVND = (v: number) => new Intl.NumberFormat("vi-VN").format(v) + "₫";

export default function OrderSummary({ subtotal, discount, totalItems }: Props) {
  const total = Math.max(0, subtotal - discount);

  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-[#e7f3eb] dark:border-white/10 p-6 sticky top-6">
      <h2 className="text-xl font-bold text-text-main dark:text-white mb-6">Tổng đơn hàng</h2>

      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-gray-400 text-[20px]">local_activity</span>
          </div>
          <input
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg leading-5 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-all"
            placeholder="Mã giảm giá"
            type="text"
          />
        </div>
        <button
          type="button"
          className="bg-[#e7f3eb] dark:bg-white/10 text-text-main dark:text-white hover:bg-primary hover:text-black font-semibold rounded-lg px-4 text-sm transition-colors duration-200"
        >
          Áp dụng
        </button>
      </div>

      <div className="space-y-3 pb-6 border-b border-[#e7f3eb] dark:border-white/10">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Tạm tính</span>
          <span className="font-medium text-text-main dark:text-white">{formatVND(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Giảm giá</span>
          <span className="font-medium text-green-600 dark:text-primary">-{formatVND(discount)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Vận chuyển</span>
          <span className="font-medium text-gray-400 italic text-xs flex items-center">Tính ở bước sau</span>
        </div>
      </div>

      <div className="flex justify-between items-end pt-6 mb-6">
        <span className="text-base font-semibold text-text-main dark:text-white">Tổng cộng</span>
        <div className="flex flex-col items-end">
          <span className="text-2xl font-bold text-primary">{formatVND(total)}</span>
          <span className="text-xs text-gray-400 mt-1">(Đã bao gồm VAT nếu có)</span>
        </div>
      </div>

      <button
        type="button"
        className="w-full bg-primary hover:brightness-95 text-text-main font-bold rounded-lg py-3.5 px-4 shadow-lg shadow-green-500/20 transition-all duration-200 flex items-center justify-center gap-2 group"
      >
        Mua hàng ({totalItems})
        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
      </button>

      <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-dashed border-gray-200 dark:border-white/10">
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="material-symbols-outlined text-gray-400 text-[24px]">verified_user</span>
          <span className="text-[10px] text-gray-500 font-medium">Bảo vệ người mua</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="material-symbols-outlined text-gray-400 text-[24px]">sync_alt</span>
          <span className="text-[10px] text-gray-500 font-medium">Đổi trả 3 ngày</span>
        </div>
      </div>
    </div>
  );
}
