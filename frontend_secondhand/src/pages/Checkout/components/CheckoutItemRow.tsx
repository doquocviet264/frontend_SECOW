import type { CheckoutItem } from "../types";

const formatVND = (v: number) => new Intl.NumberFormat("vi-VN").format(v) + "₫";

type Props = {
  item: CheckoutItem;
};

export default function CheckoutItemRow({ item }: Props) {
  return (
    <div className="flex gap-4 py-2">
      <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-gray-100 dark:bg-white/5 rounded-lg overflow-hidden">
        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start gap-4">
            <h4 className="font-medium text-text-main dark:text-white line-clamp-2">{item.title}</h4>
            <span className="font-bold text-text-main dark:text-white whitespace-nowrap">
              {formatVND(item.price)}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {item.tags?.map((t) => (
              <span
                key={t}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-text-muted">{item.shippingLabel ?? "Đơn vị vận chuyển: Tính ở bước sau"}</span>
          {typeof item.oldPrice === "number" ? (
            <span className="text-sm text-text-muted line-through">{formatVND(item.oldPrice)}</span>
          ) : (
            <span />
          )}
        </div>
      </div>
    </div>
  );
}
