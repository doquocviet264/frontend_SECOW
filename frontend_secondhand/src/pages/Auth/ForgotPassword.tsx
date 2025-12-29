import AuthLayout from "./components/AuthLayout";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout 
      title="Quên mật khẩu?" 
      subtitle="Đừng lo, chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu cho bạn."
    >
      <form className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Email đăng ký</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">mail</span>
            <input 
              type="email" 
              placeholder="Nhập email của bạn..." 
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
            />
          </div>
        </div>

        <button className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all active:scale-95">
          Gửi liên kết khôi phục
          <span className="material-symbols-outlined text-[20px]">send</span>
        </button>

        <div className="text-center">
          <a href="/auth/signin" className="inline-flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Quay lại đăng nhập
          </a>
        </div>
      </form>
    </AuthLayout>
  );
}