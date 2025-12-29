import type { OrderDetail } from "../types";

type Props = {
  items: OrderDetail["items"];
};

const formatVND = (v: number) => new Intl.NumberFormat("vi-VN").format(v) + "₫";

export default function OrderItems({ items }: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg dark:text-white">Sản phẩm</h3>
        <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded">
          {items.length} sản phẩm
        </span>
      </div>

      <div className="space-y-6">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4">
            <div className="w-24 h-24 shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
               <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
              <div>
                <h4 className="text-base font-bold text-gray-900 dark:text-white line-clamp-2">
                  {item.name}
                </h4>
                
                <div className="flex flex-wrap gap-2 mt-2">
                   {/* Variant Badge */}
                   <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium border border-gray-200 dark:border-gray-600">
                      {item.variant}
                   </span>
                   {/* Extra Tags like "Do moi 95%" */}
                   {item.tags?.map(tag => (
                      <span key={tag} className="inline-flex items-center px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 text-xs font-medium border border-blue-100 dark:border-blue-800">
                        {tag}
                      </span>
                   ))}
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                 <span className="text-sm text-gray-500">x{item.quantity}</span>
                 <div className="text-right">
                    {item.originalPrice && (
                       <div className="text-xs text-gray-400 line-through mb-0.5">
                          {formatVND(item.originalPrice)}
                       </div>
                    )}
                    <div className="font-bold text-gray-900 dark:text-white">
                       {formatVND(item.price)}
                    </div>
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}