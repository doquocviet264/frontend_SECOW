import type { Category } from "@/pages/Home/types";

type Props = {
  item: Category;
};

export default function CategoryCard({ item }: Props) {
  return (
    <a
      className="group flex flex-col items-center gap-3 p-4 rounded-xl bg-white dark:bg-[var(--surface-dark)] border border-transparent hover:border-[color:rgba(19,236,91,0.5)] hover:shadow-md transition-all cursor-pointer"
      href="#"
    >
      <div className="size-16 rounded-full bg-[#f0f9f4] dark:bg-[var(--surface-dark)] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        <img className="w-full h-full object-cover rounded-full opacity-90" src={item.imageUrl} alt={item.name} />
      </div>
      <p className="text-sm font-semibold text-center group-hover:text-[var(--color-primary)] transition-colors">
        {item.name}
      </p>
    </a>
  );
}
