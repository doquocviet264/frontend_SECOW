import CategoryCard from "./CategoryCard";
import type { Category } from "@/pages/Home/types";

type Props = {
  items: Category[];
};

export default function CategoryGrid({ items }: Props) {
  return (
    <section className="w-full max-w-[1280px] px-4 md:px-8 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[22px] font-bold leading-tight tracking-tight">Danh mục phổ biến</h2>
        <a className="text-sm text-[var(--color-primary)] font-bold hover:underline" href="#">
          Xem tất cả
        </a>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {items.map((c) => (
          <CategoryCard key={c.name} item={c} />
        ))}
      </div>
    </section>
  );
}
