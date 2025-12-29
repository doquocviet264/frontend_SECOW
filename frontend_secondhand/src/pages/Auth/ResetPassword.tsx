import AuthLayout from "./components/AuthLayout";

export default function ResetPasswordPage() {
  return (
    <AuthLayout 
      title="Đặt lại mật khẩu" 
      subtitle="Vui lòng nhập mật khẩu mới của bạn."
    >
      <form className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Mật khẩu mới</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">lock_reset</span>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Xác nhận mật khẩu mới</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">check_circle</span>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
            />
          </div>
        </div>

        <ul className="text-[10px] text-gray-400 space-y-1 ml-1 list-disc list-inside">
          <li>Tối thiểu 8 ký tự</li>
          <li>Chứa ít nhất một chữ cái viết hoa</li>
          <li>Chứa ít nhất một số</li>
        </ul>

        <button className="w-full h-12 rounded-xl bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 mt-4">
          Cập nhật mật khẩu
          <span className="material-symbols-outlined text-[20px]">save</span>
        </button>
      </form>
    </AuthLayout>
  );
}