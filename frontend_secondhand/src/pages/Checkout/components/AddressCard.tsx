import type { Address } from "../types";

type Props = {
  address: Address;
  selected: boolean;
  onSelect: (id: string) => void;
};

export default function AddressCard({ address, selected, onSelect }: Props) {
  return (
    <label
      className={[
        "relative flex p-4 cursor-pointer rounded-lg transition-all",
        selected
          ? "border-2 border-primary bg-primary/5"
          : " dark:border-border-dark hover:border-primary/50 bg-white dark:bg-surface-dark/50",
      ].join(" ")}
    >
      <input
        className="sr-only"
        name="address"
        type="radio"
        checked={selected}
        onChange={() => onSelect(address.id)}
      />

      <div className="mt-1 mr-4">
        <div
          className={[
            "w-5 h-5 rounded-full border-2 flex items-center justify-center",
            selected ? "border-primary bg-primary" : "border-gray-300 dark:border-gray-600",
          ].join(" ")}
        >
          {selected ? <div className="w-2 h-2 bg-text-main rounded-full" /> : null}
        </div>
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="font-bold text-text-main dark:text-white">{address.fullName}</span>
          <span className="text-sm text-text-muted">|</span>
          <span className="text-sm text-text-muted">{address.phone}</span>

          {address.isDefault ? (
            <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-green-700 dark:text-green-300 uppercase tracking-wide">
              Mặc định
            </span>
          ) : null}

          {address.label ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 uppercase tracking-wide">
              {address.label}
            </span>
          ) : null}
        </div>

        <p className="text-sm text-text-main dark:text-gray-300 leading-relaxed">
          {address.addressLine}
        </p>
      </div>
    </label>
  );
}
