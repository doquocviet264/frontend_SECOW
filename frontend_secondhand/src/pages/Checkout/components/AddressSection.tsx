import type { Address } from "../types";
import AddressCard from "./AddressCard";

type Props = {
  addresses: Address[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAddNew?: () => void;
};

export default function AddressSection({ addresses, selectedId, onSelect, onAddNew }: Props) {
  return (
    <section className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 shadow-sm ">
      <div className="flex items-center justify-between mb-4 gap-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-text-main text-primary text-xs font-black">
            1
          </span>
          Địa chỉ nhận hàng
        </h3>

        <button
          type="button"
          onClick={onAddNew}
          className="text-primary text-sm font-bold hover:underline"
        >
          + Thêm địa chỉ mới
        </button>
      </div>

      <div className="space-y-3">
        {addresses.map((a) => (
          <AddressCard
            key={a.id}
            address={a}
            selected={a.id === selectedId}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}
