import type { SellerCheckoutGroup } from "../types";
import SellerBlock from "./SellerBlock";

type Props = {
  sellers: SellerCheckoutGroup[];
};

export default function ProductsSection({ sellers }: Props) {
  return (
    <section className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-text-main text-primary text-xs font-black">
          2
        </span>
        Sản phẩm
      </h3>

      {sellers.map((s) => (
        <SellerBlock key={s.id} seller={s} />
      ))}
    </section>
  );
}
