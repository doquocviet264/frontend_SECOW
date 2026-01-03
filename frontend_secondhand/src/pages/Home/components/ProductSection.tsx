import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import type { Product } from "@/pages/Home/types";

type Props = {
  title: string;
  icon: string;
  iconBgClassName: string;
  items: Product[];
  showMoreButton?: boolean;
  moreButtonLabel?: string;
};

export default function ProductSection({
  title,
  icon,
  iconBgClassName,
  items,
  showMoreButton = false,
  moreButtonLabel = "Xem thêm",
}: Props) {
  return (
    <section className="w-full max-w-[1280px] px-4 md:px-8 py-6">
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-1.5 rounded-md ${iconBgClassName}`}>
          <span className="material-symbols-outlined text-white text-[20px] block">{icon}</span>
        </div>
        <h2 className="text-[22px] font-bold leading-tight tracking-tight">{title}</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((p) => (
          <ProductCard key={p.id || p.title} item={p} />
        ))}
      </div>

      {showMoreButton ? (
        <div className="flex justify-center mt-6">
          <Link
            to="/products"
            className="px-6 py-2 rounded-lg border border-[var(--border-light)] bg-white dark:bg-[var(--surface-dark)] hover:border-[var(--color-primary)] text-sm font-medium transition-colors"
          >
            {moreButtonLabel}
          </Link>
        </div>
      ) : null}
    </section>
  );
}
