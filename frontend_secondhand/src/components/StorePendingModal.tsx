import React from "react";

type StorePendingModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function StorePendingModal({ isOpen, onClose }: StorePendingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 mx-auto mb-4">
            <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-4xl">
              pending
            </span>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
            Shop đang được phê duyệt
          </h3>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6 leading-relaxed">
            Đơn đăng ký shop của bạn đang được admin xem xét và phê duyệt. 
            Vui lòng chờ trong giây lát. Bạn sẽ nhận được thông báo khi shop được phê duyệt.
          </p>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-xl">
                info
              </span>
              <div className="flex-1">
                <p className="text-xs font-bold text-amber-900 dark:text-amber-300 mb-1">
                  Lưu ý
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Bạn chỉ có thể đăng sản phẩm sau khi shop được phê duyệt thành công.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Đã hiểu
            </button>
            <button
              onClick={() => {
                onClose();
                window.location.href = "/profile";
              }}
              className="flex-1 h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20 transition-all"
            >
              Xem trạng thái
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

