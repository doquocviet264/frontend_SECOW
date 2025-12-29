import AuthLayout from "./components/AuthLayout";

export default function SignUpPage() {
  return (
    <AuthLayout 
      title="Đăng ký tài khoản" 
      subtitle="Bắt đầu hành trình sống xanh của bạn."
    >
      {/* Google Login Button */}
      <button className="w-full h-12 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-3 font-bold text-gray-700 dark:text-white transition-colors text-sm mb-6">
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
        Đăng ký bằng Google
      </button>

      <div className="flex items-center gap-4 mb-6">
        <div className="h-[1px] bg-gray-200 dark:bg-gray-700 flex-1"></div>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Hoặc đăng ký bằng Email</span>
        <div className="h-[1px] bg-gray-200 dark:bg-gray-700 flex-1"></div>
      </div>

      <form className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Họ và tên</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">person</span>
            <input 
              type="text" 
              placeholder="Nguyễn Văn A" 
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Email hoặc Số điện thoại</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">mail</span>
            <input 
              type="text" 
              placeholder="email@example.com" 
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Mật khẩu</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">lock</span>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Nhập lại mật khẩu</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">history</span>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
              />
            </div>
          </div>
        </div>
        <p className="text-[10px] text-gray-400 ml-1">Tối thiểu 8 ký tự, gồm chữ và số.</p>

        <div className="flex items-start gap-3 py-2">
          <input type="checkbox" id="terms" className="mt-1 w-4 h-4 text-emerald-500 rounded border-gray-300 focus:ring-emerald-500 accent-emerald-500" />
          <label htmlFor="terms" className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Tôi đồng ý với <a href="#" className="text-emerald-500 font-bold hover:underline">Điều khoản sử dụng</a> và <a href="#" className="text-emerald-500 font-bold hover:underline">Chính sách bảo mật</a> của SecondLife.
          </label>
        </div>

        <button className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all active:scale-95">
          Tạo tài khoản
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>

        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6">
          Đã có tài khoản? <a href="/auth/signin" className="text-gray-900 dark:text-white font-bold hover:underline">Đăng nhập ngay</a>
        </p>
      </form>
    </AuthLayout>
  );
}