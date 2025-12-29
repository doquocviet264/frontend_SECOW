import AuthLayout from "./components/AuthLayout";

export default function SignInPage() {
  return (
    <AuthLayout 
      title="Chào mừng trở lại!" 
      subtitle="Vui lòng đăng nhập để tiếp tục."
    >
      <button className="w-full h-12 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-3 font-bold text-gray-700 dark:text-white transition-colors text-sm mb-6">
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
        Đăng nhập bằng Google
      </button>

      <div className="flex items-center gap-4 mb-6">
        <div className="h-[1px] bg-gray-200 dark:bg-gray-700 flex-1"></div>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Hoặc đăng nhập bằng Email</span>
        <div className="h-[1px] bg-gray-200 dark:bg-gray-700 flex-1"></div>
      </div>

      <form className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Email</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">mail</span>
            <input 
              type="email" 
              placeholder="email@example.com" 
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5 ml-1">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Mật khẩu</label>
            <a href="/auth/forgot-password" className="text-xs font-bold text-emerald-500 hover:underline">Quên mật khẩu?</a>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">lock</span>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 py-2">
          <input type="checkbox" id="remember" className="w-4 h-4 text-emerald-500 rounded border-gray-300 focus:ring-emerald-500 accent-emerald-500" />
          <label htmlFor="remember" className="text-xs font-medium text-gray-600 dark:text-gray-300 cursor-pointer select-none">
            Ghi nhớ đăng nhập
          </label>
        </div>

        <button className="w-full h-12 rounded-xl bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95">
          Đăng nhập
          <span className="material-symbols-outlined text-[20px]">login</span>
        </button>

        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6">
          Chưa có tài khoản? <a href="/auth/signup" className="text-emerald-500 font-bold hover:underline">Tạo tài khoản mới</a>
        </p>
      </form>
    </AuthLayout>
  );
}