  import { useMemo, useState } from "react";
  import { useNavigate } from "react-router-dom";
  import { useCart } from "@/store/cart";
  import { cartService } from "@/services/cartService";
  import { authService } from "@/services/authService";

  type Props = {
    isApproved: boolean;
    conditionLabel: string;
    title: string;
    postedAgo: string;
    location: string;
    price: number;
    oldPrice?: number;
    stock: number;
    productId: string;
    sellerId?: string;
    sellerName?: string;
    productImage?: string;
  };

  const formatVND = (v: number) => new Intl.NumberFormat("vi-VN").format(v) + "đ";

  export default function ProductInfoCard({
    isApproved,
    conditionLabel,
    title,
    postedAgo,
    location,
    price,
    oldPrice,
    stock,
    productId,
    sellerId,
    sellerName,
    productImage,
  }: Props) {
    const [qty, setQty] = useState(1);
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const canDec = qty > 1;
    const canInc = qty < Math.max(1, stock);

    const statusPills = useMemo(() => {
      return (
        <div className="flex items-center gap-2 mb-2">
          {isApproved && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              Đã kiểm duyệt
            </span>
          )}
          <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-300">
            {conditionLabel}
          </span>
        </div>
      );
    }, [isApproved, conditionLabel]);

    return (
      <div className="flex flex-col gap-6">
        <div>
          {statusPills}
          <h1 className="text-2xl md:text-4xl font-bold text-text-main dark:text-white leading-tight mb-2">{title}</h1>
          <p className="text-text-secondary text-sm flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            Đăng {postedAgo} • {location}
          </p>
        </div>

        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-border-color dark:border-white/10 shadow-sm">
          <div className="flex items-end gap-3 mb-6">
            <span className="text-3xl md:text-4xl font-bold text-primary tracking-tight">{formatVND(price)}</span>
            {typeof oldPrice === "number" && oldPrice > price && (
              <span className="text-sm text-gray-400 line-through mb-1.5">{formatVND(oldPrice)}</span>
            )}
          </div>

          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Số lượng:</span>

            <div className="flex items-center border border-border-color dark:border-white/10 rounded-lg bg-background-light dark:bg-background-dark">
              <button
                type="button"
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-primary disabled:opacity-50"
                onClick={() => canDec && setQty((p) => p - 1)}
                disabled={!canDec}
                aria-label="decrease"
              >
                <span className="material-symbols-outlined text-sm">remove</span>
              </button>

              <input
                className="w-10 h-8 text-center bg-transparent border-none focus:ring-0 text-sm font-semibold p-0 text-text-main dark:text-white"
                readOnly
                value={qty}
              />

              <button
                type="button"
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-primary disabled:opacity-50"
                onClick={() => canInc && setQty((p) => p + 1)}
                disabled={!canInc}
                aria-label="increase"
              >
                <span className="material-symbols-outlined text-sm">add</span>
              </button>
            </div>

            <span className="text-xs text-gray-400">Chỉ còn {stock} sản phẩm</span>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={async () => {
                  await cartService.addItem({ productId, quantity: qty });
                  try {
                    const after = await cartService.getCart();
                    const items = after?.data?.cart?.items || [];
                    const found = items.find((it: any) => it.product?.id === productId || it.product?._id === productId);
                    if (found?.id) {
                      sessionStorage.setItem("checkoutSelectedItemIds", JSON.stringify([found.id]));
                    }
                  } catch {}
                  navigate("/checkout");
                }}
                className="flex-1 bg-primary hover:brightness-95 text-text-main font-bold h-12 rounded-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
              >
                Mua ngay
              </button>
              <button
                type="button"
                onClick={() => addToCart(productId, qty)}
                className="flex-1 bg-primary/10 hover:bg-primary/15 text-primary font-bold h-12 rounded-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
              >
                <span className="material-symbols-outlined">add_shopping_cart</span>
                Thêm vào giỏ
              </button>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                className="flex-1 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold h-10 rounded-lg flex items-center justify-center gap-2 transition-colors"
                onClick={() => {
                  if (!authService.isAuthenticated()) {
                    navigate("/auth/signin");
                    return;
                  }
                  if (sellerId) {
                    const q = new URLSearchParams();
                    q.set("with", sellerId);
                    if (sellerName) q.set("name", sellerName);
                    q.set("productId", productId);
                    q.set("productTitle", title);
                    q.set("productPrice", String(price));
                    if (productImage) q.set("productImage", productImage);
                    navigate(`/chat?${q.toString()}`);
                  } else {
                    navigate("/chat");
                  }
                }}
              >
                <span className="material-symbols-outlined text-[20px]">chat</span>
                Chat với người bán
              </button>

              <button
                type="button"
                className="w-12 h-10 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg flex items-center justify-center transition-colors"
                title="Lưu tin"
              >
                <span className="material-symbols-outlined text-[20px]">favorite</span>
              </button>

              <button
                type="button"
                className="w-12 h-10 border border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 rounded-lg flex items-center justify-center transition-colors"
                title="Báo cáo"
              >
                <span className="material-symbols-outlined text-[20px]">flag</span>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border-color dark:border-white/10">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="material-symbols-outlined text-[16px] text-primary">verified_user</span>
              <span>Được bảo vệ hoàn tiền trong 3 ngày nếu có lỗi.</span>
            </div>
          </div>
        </div>
      </div>
    );
  }