import type { Product } from "@/pages/Home/types";

type Props = {
  item: Product;
  showBadge?: boolean;
};

export default function ProductCard({ item, showBadge = true }: Props) {
  return (
    <div className="group flex flex-col bg-white dark:bg-[var(--surface-dark)] rounded-lg overflow-hidden border border-[var(--border-light)] dark:border-[var(--border-dark)] hover:shadow-lg transition-all cursor-pointer">
      <div className="relative w-full aspect-square overflow-hidden">
        <img
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          src={item.imageUrl}
          alt={item.title}
        />

        <button className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 dark:bg-black/50 hover:bg-white text-gray-500 hover:text-red-500 transition-colors">
          <span className="material-symbols-outlined text-[18px] block">favorite</span>
        </button>

        {showBadge && item.badge ? (
          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--color-primary)] text-[var(--text-light)]">
            {item.badge}
          </span>
        ) : null}
      </div>

      <div className="p-3 flex flex-col gap-1">
        <h3 className="text-sm font-medium line-clamp-2 min-h-[40px] group-hover:text-[var(--color-primary)] transition-colors">
          {item.title}
        </h3>

        <div className="flex items-center justify-between mt-1">
          <span className="text-base font-bold text-[var(--color-primary)]">{item.price}</span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 mt-2">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">location_on</span>
            <span className="truncate max-w-[80px]">{item.location}</span>
          </div>
          <span>{item.timeAgo}</span>
        </div>
      </div>
    </div>
  );
}
