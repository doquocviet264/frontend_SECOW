import type { OrderDetail } from "../types";

type Props = {
  address: OrderDetail["shippingAddress"];
};

export default function OrderAddress({ address }: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex gap-4">
      <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[24px]">location_on</span>
      </div>
      
      <div>
        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">Địa chỉ nhận hàng</h3>
        <div className="text-sm text-gray-900 dark:text-white font-semibold mb-1">
          {address.name} <span className="mx-1 text-gray-300">|</span> <span className="text-gray-500 dark:text-gray-400 font-normal">{address.phone}</span>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          {address.address}
        </div>
      </div>
    </div>
  );
}