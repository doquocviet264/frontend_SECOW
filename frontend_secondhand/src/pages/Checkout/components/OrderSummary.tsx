const formatVND = (v: number) => new Intl.NumberFormat("vi-VN").format(v) + "₫";

type Props = {
  itemCount: number;
  subtotal: number;
  shippingFee: number;
  shippingDiscount: number;
  onPlaceOrder?: () => void;
};

export default function OrderSummary({
  itemCount,
  subtotal,
  shippingFee,
  shippingDiscount,
  onPlaceOrder,
}: Props) {
  const total = Math.max(0, subtotal + shippingFee - shippingDiscount);

  return (
    <div className="sticky top-6 space-y-4">
      <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 shadow-lg ">
        <h3 className="text-lg font-bold mb-4">Tóm tắt đơn hàng</h3>

        <div className="space-y-3 pb-4">
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Tạm tính ({itemCount} sản phẩm)</span>
            <span className="font-medium">{formatVND(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Phí vận chuyển</span>
            <span className="font-medium">{formatVND(shippingFee)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Giảm giá vận chuyển</span>
            <span className="font-medium text-primary">-{formatVND(shippingDiscount)}</span>
          </div>
        </div>

        <div className="py-">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-lg">
                sell
              </span>
              <input
                className="w-full h-10 pl-9 pr-3 rounded bg-background-light dark:bg-background-dark border-black text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="Mã giảm giá"
                type="text"
              />
            </div>
            <button
              type="button"
              className="h-10 px-4 rounded bg-text-main dark:bg-white text-white border-black-1 dark:text-text-main text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              Áp dụng
            </button>
          </div>
        </div>

        <div className="py-4">
          <div className="flex justify-between items-end mb-1">
            <span className="text-base font-bold text-text-main dark:text-white">Tổng thanh toán</span>
            <span className="text-2xl font-black text-primary">{formatVND(total)}</span>
          </div>
          <p className="text-right text-xs text-text-muted">(Đã bao gồm VAT nếu có)</p>
        </div>

        <div className="space-y-3 mt-2">
          <button
            type="button"
            onClick={onPlaceOrder}
            className="w-full h-12 flex items-center justify-center gap-2 rounded-lg bg-primary text-text-main font-bold text-base hover:brightness-105 active:scale-[0.98] transition-all shadow-[0_4px_14px_0_rgba(19,236,91,0.39)]"
          >
            <span>Đặt hàng ngay</span>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>

          <p className="text-[11px] text-center text-text-muted leading-tight px-4">
            Bằng việc tiến hành đặt hàng, bạn đồng ý với{" "}
            <a className="underline hover:text-primary" href="#">
              Điều khoản dịch vụ
            </a>{" "}
            của 2HandMarket.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-surface-light dark:bg-surface-dark  text-center">
          <span className="material-symbols-outlined text-primary mb-1">verified_user</span>
          <span className="text-[10px] font-medium leading-tight">Bảo vệ người mua</span>
        </div>
        <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-surface-light dark:bg-surface-dark  text-center">
          <span className="material-symbols-outlined text-primary mb-1">lock</span>
          <span className="text-[10px] font-medium leading-tight">Thanh toán an toàn</span>
        </div>
        <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-surface-light dark:bg-surface-dark text-center">
          <span className="material-symbols-outlined text-primary mb-1">published_with_changes</span>
          <span className="text-[10px] font-medium leading-tight">Hoàn trả 3 ngày</span>
        </div>
      </div>
    </div>
  );
}
