import type { SellerCheckoutGroup } from "../types";
import CheckoutItemRow from "./CheckoutItemRow";

type Props = {
  seller: SellerCheckoutGroup;
};

export default function SellerBlock({ seller }: Props) {
  return (
    <div className="mb-8 last:mb-0">
      <div className="flex items-center gap-2 mb-4 pb-2">
        <span className="material-symbols-outlined text-text-muted text-lg">storefront</span>
        <span className="font-bold text-sm">{seller.name}</span>

        {seller.canChat ? (
          <button
            type="button"
            className="text-xs text-primary font-medium border border-primary/30 px-2 py-0.5 rounded-full hover:bg-primary/10"
          >
            Chat ngay
          </button>
        ) : null}
      </div>

      <div className="space-y-2">
        {seller.items.map((it) => (
          <CheckoutItemRow key={it.id} item={it} />
        ))}
      </div>
    </div>
  );
}
