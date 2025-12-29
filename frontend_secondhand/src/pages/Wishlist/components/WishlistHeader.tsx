type Props = {
  count: number;
};

export default function WishlistHeader({ count }: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1">
          Sản phẩm yêu thích
        </h1>
        <p className="text-emerald-600 font-medium">
          {count} sản phẩm đã lưu
        </p>
      </div>

      <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold text-sm transition-all">
        <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
        Thêm tất cả vào giỏ
      </button>
    </div>
  );
}