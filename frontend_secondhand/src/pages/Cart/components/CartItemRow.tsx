import type { CartItem } from "../types";

type Props = {
  item: CartItem;
  onToggle: (id: string) => void;
  onInc: (id: string) => void;
  onDec: (id: string) => void;
};

const formatVND = (v: number) => new Intl.NumberFormat("vi-VN").format(v) + "₫";

function ConditionTag({ tone, label }: { tone: "green" | "yellow" | "red"; label: string }) {
  const cls =
    tone === "green"
      ? "bg-emerald-600/80"
      : tone === "yellow"
      ? "bg-yellow-600/80"
      : "bg-red-600/80";

  return <div className={`absolute bottom-0 left-0 w-full ${cls} text-white text-[10px] text-center py-0.5`}>{label}</div>;
}

export default function CartItemRow({ item, onToggle, onInc, onDec }: Props) {
  const canDec = item.quantity > 1;
  const canInc = item.quantity < item.stock;

  return (
    <div className="p-4 flex flex-col sm:flex-row gap-4 border-b border-[#e7f3eb] dark:border-white/10 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
      <div className="flex items-center sm:items-start pt-1">
        <input
          checked={item.checked}
          onChange={() => onToggle(item.id)}
          className="h-5 w-5 rounded border-gray-300 dark:border-gray-600 bg-transparent text-primary checked:bg-primary focus:ring-0 focus:outline-none"
          type="checkbox"
        />
      </div>

      <div className="flex gap-4 grow">
        <div className="relative shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 dark:border-white/10 group">
          <div
            className="bg-center bg-no-repeat bg-cover w-full h-full transform group-hover:scale-105 transition-transform duration-300"
            style={{ backgroundImage: `url("${item.imageUrl}")` }}
          />
          {item.conditionTag ? <ConditionTag tone={item.conditionTag.tone} label={item.conditionTag.label} /> : null}
        </div>

        <div className="flex flex-col grow justify-between">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h3 className="text-text-main dark:text-white font-medium text-base line-clamp-2">{item.title}</h3>

              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {item.color ? (
                  <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-white/10 px-2 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-200">
                    {item.color}
                  </span>
                ) : null}
                {item.size ? (
                  <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-white/10 px-2 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-200">
                    {item.size}
                  </span>
                ) : null}
                {item.badges?.map((b) => (
                  <span
                    key={b}
                    className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex flex-col">
              {typeof item.oldPrice === "number" ? (
                <span className="text-sm text-gray-400 line-through">{formatVND(item.oldPrice)}</span>
              ) : null}
              <span className="text-lg font-bold text-text-main dark:text-primary">{formatVND(item.price)}</span>
            </div>

            <div className="flex items-center rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5">
              <button
                type="button"
                onClick={() => canDec && onDec(item.id)}
                disabled={!canDec}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black dark:hover:text-white disabled:opacity-30 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">remove</span>
              </button>

              <input
                className="w-10 h-8 border-none bg-transparent text-center text-sm font-medium text-text-main dark:text-white focus:ring-0 p-0"
                readOnly
                type="text"
                value={item.quantity}
              />

              <button
                type="button"
                onClick={() => canInc && onInc(item.id)}
                disabled={!canInc}
                title={canInc ? "" : "Chỉ còn tối đa theo tồn kho"}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black dark:hover:text-white disabled:opacity-30 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
