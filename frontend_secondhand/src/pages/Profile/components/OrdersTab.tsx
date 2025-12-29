import type { Order } from "../types";

// Giả lập danh sách tabs trạng thái giống hình
const TABS = ["Tất cả", "Chờ xác nhận", "Đang giao", "Hoàn thành", "Đã hủy"];

const formatVND = (v: number) => 
  new Intl.NumberFormat("vi-VN").format(v) + "₫";

function getStatusColor(status: Order["status"]) {
  switch (status) {
    case "completed": return "text-emerald-600"; // Hoàn thành - Xanh
    case "shipping": return "text-blue-600";     // Đang giao - Xanh dương
    case "processing": return "text-orange-500"; // Chờ xác nhận - Cam
    default: return "text-red-500";              // Hủy - Đỏ
  }
}

function getStatusText(status: Order["status"]) {
  switch (status) {
    case "completed": return "ĐÃ GIAO HÀNG";
    case "shipping": return "ĐANG VẬN CHUYỂN";
    case "processing": return "CHỜ XÁC NHẬN";
    default: return "ĐÃ HỦY";
  }
}

type Props = {
  orders: Order[];
};

export default function OrdersTab({ orders }: Props) {
  // Giả lập active tab đầu tiên
  const activeTab = "Tất cả"; 

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-900/50 rounded-xl">
      
      {/* 1. Status Tabs (Thanh trạng thái bên trên) */}
      <div className="bg-white dark:bg-gray-800 rounded-t-xl border-b border-gray-100 dark:border-gray-700 mb-3 sticky top-0 z-10 shadow-sm">
        <div className="flex overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`
                whitespace-nowrap px-6 py-4 text-sm font-medium border-b-2 transition-colors
                ${tab === activeTab 
                  ? "border-emerald-500 text-emerald-600 dark:text-emerald-400" 
                  : "border-transparent text-gray-500 hover:text-emerald-500 dark:text-gray-400"
                }
              `}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Search Bar (Thanh tìm kiếm) */}
      <div className="bg-white dark:bg-gray-800 p-4 mb-3 shadow-sm border-y border-gray-100 dark:border-gray-700">
        <div className="relative w-full bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
            search
          </span>
          <input 
            type="text" 
            placeholder="Tìm kiếm theo Tên Shop, ID đơn hàng hoặc Tên sản phẩm"
            className="w-full h-10 pl-10 pr-4 bg-transparent text-sm outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400"
          />
        </div>
      </div>

      {/* 3. Order List (Danh sách đơn hàng dạng Card) */}
      <div className="space-y-3 pb-6">
        {orders.map((o) => (
          <div key={o.id} className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-lg p-5">
            
            {/* Header: Shop Name & Status */}
            <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-gray-800 dark:text-white">Cửa hàng chính hãng</span>
                <button className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                  Chat
                </button>
                <button className="border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 text-[10px] px-1.5 py-0.5 rounded">
                  Xem Shop
                </button>
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold uppercase ${getStatusColor(o.status)}`}>
                <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                {getStatusText(o.status)}
              </div>
            </div>

            {/* Body: Product Info (Mô phỏng giống hình) */}
            <div className="flex gap-4 mb-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 p-2 -mx-2 rounded transition-colors">
              {/* Product Image Placeholder */}
              <div className="w-20 h-20 shrink-0 bg-gray-200 dark:bg-gray-700 rounded border border-gray-100 dark:border-gray-600 flex items-center justify-center">
                 <span className="material-symbols-outlined text-gray-400 text-3xl">image</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                  Đơn hàng #{o.id} - Tổng hợp sản phẩm
                </h4>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Phân loại: Gói hàng tiêu chuẩn
                </div>
                <div className="text-xs text-gray-500 mt-1">x{o.itemCount} sản phẩm</div>
              </div>

              <div className="text-right">
                <div className="text-xs text-gray-400 line-through">
                   {formatVND(o.total * 1.2)}
                </div>
                <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                   {formatVND(o.total)}
                </div>
              </div>
            </div>

            {/* Footer: Total & Actions */}
            <div className="border-t border-gray-100 dark:border-gray-700 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-gray-500 w-full sm:w-auto text-center sm:text-left">
                Đánh giá shop ngay khi nhận hàng để nhận <span className="text-emerald-600 font-bold">200 xu</span>
              </div>
              
              <div className="flex flex-col sm:flex-row items-end gap-4 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                   <span className="text-sm text-gray-600 dark:text-gray-300">Thành tiền:</span>
                   <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatVND(o.total)}</span>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  {o.status === 'completed' ? (
                     <>
                        <button className="flex-1 sm:flex-none px-6 py-2 rounded border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                          Liên hệ
                        </button>
                        <button className="flex-1 sm:flex-none px-6 py-2 rounded bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium shadow-sm transition-colors">
                          Mua lại
                        </button>
                     </>
                  ) : (
                    <button className="flex-1 sm:flex-none px-6 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-sm font-medium cursor-not-allowed">
                      Đang xử lý
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Pagination Mock (Phân trang giống hình) */}
        <div className="flex justify-center items-center gap-2 mt-6">
          <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-white bg-white dark:bg-gray-800">
             <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded bg-emerald-500 text-white font-bold text-sm">1</button>
          <button className="w-8 h-8 flex items-center justify-center rounded border border-transparent hover:bg-white dark:hover:bg-gray-800 text-gray-500 text-sm">2</button>
          <button className="w-8 h-8 flex items-center justify-center rounded border border-transparent hover:bg-white dark:hover:bg-gray-800 text-gray-500 text-sm">3</button>
          <span className="text-gray-400 text-sm">...</span>
          <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-white bg-white dark:bg-gray-800">
             <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}