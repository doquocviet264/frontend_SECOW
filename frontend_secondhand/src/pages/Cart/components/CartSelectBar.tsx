type Props = {
  total: number;
  allChecked: boolean;
  onToggleAll: () => void;
  onDeleteSelected: () => void;
};

export default function CartSelectBar({ total, allChecked, onToggleAll, onDeleteSelected }: Props) {
  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-4 shadow-sm flex items-center justify-between border border-[#e7f3eb] dark:border-white/10">
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          checked={allChecked}
          onChange={onToggleAll}
          className="h-5 w-5 rounded border-gray-300 dark:border-gray-600 bg-transparent text-primary checked:bg-primary checked:border-primary focus:ring-0 focus:ring-offset-0 focus:outline-none transition-all"
          type="checkbox"
        />
        <span className="text-text-main dark:text-white text-base font-medium">Chọn tất cả ({total} sản phẩm)</span>
      </label>

      <button
        type="button"
        onClick={onDeleteSelected}
        className="text-red-500 hover:text-red-600 text-sm font-medium flex items-center gap-1"
      >
        <span className="material-symbols-outlined text-[18px]">delete</span>
        Xoá đã chọn
      </button>
    </div>
  );
}
