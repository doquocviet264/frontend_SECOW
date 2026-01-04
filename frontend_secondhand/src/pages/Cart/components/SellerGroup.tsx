import CartItemRow from "./CartItemRow";
import type { SellerCartGroup } from "../types";

type Props = {
  group: SellerCartGroup;
  onToggleSeller: (sellerId: string) => void;
  onToggleItem: (itemId: string) => void;
  onInc: (itemId: string) => void;
  onDec: (itemId: string) => void;
  onRemove?: (itemId: string) => void;
  onChat?: (sellerId: string, sellerName: string) => void;
  onOpenProduct?: (productId: string) => void;
};

export default function SellerGroup({ group, onToggleSeller, onToggleItem, onInc, onDec, onRemove, onChat, onOpenProduct }: Props) {
  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-[#e7f3eb] dark:border-white/10 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#e7f3eb] dark:border-white/10 bg-[#f8fcf9] dark:bg-white/5">
        <div className="flex items-center gap-3">
          <input
            checked={group.checked}
            onChange={() => onToggleSeller(group.id)}
            className="h-5 w-5 rounded border-gray-300 dark:border-gray-600 bg-transparent text-primary checked:bg-primary focus:ring-0 focus:outline-none"
            type="checkbox"
          />
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-gray-500">storefront</span>
            <p className="text-text-main dark:text-white text-base font-semibold">{group.name}</p>
            {group.verified ? (
              <span className="material-symbols-outlined text-blue-500 text-[16px]" title="Verified Seller">
                verified
              </span>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          className="text-text-secondary hover:text-primary text-sm font-medium flex items-center gap-1 transition-colors"
          onClick={() => onChat?.(group.id, group.name)}
        >
          <span className="material-symbols-outlined text-[18px]">chat</span>
          Chat ngay
        </button>
      </div>

      {group.items.map((it) => (
        <CartItemRow
          key={it.id}
          item={it}
          onToggle={onToggleItem}
          onInc={onInc}
          onDec={onDec}
          onRemove={onRemove}
          onOpenProduct={onOpenProduct}
        />
      ))}
    </div>
  );
}
