import { useState } from "react";
import AuthLayout from "./components/AuthLayout";
import { authService } from "@/services/authService";
import type { LoginPayload } from "@/types/auth";

export default function SignInPage() {
  const [formData, setFormData] = useState<LoginPayload>({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authService.login(formData);

      if (response.success && response.data) {
        // Kiểm tra role và điều hướng phù hợp, sau đó reload trang
        const userRole = response.data.user?.role;
        const redirectPath = userRole === "admin" ? "/admin" : "/";
        // Sử dụng window.location.href để điều hướng và tự động reload trang
        window.location.href = redirectPath;
      } else {
        setError(response.message || "Đăng nhập thất bại");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        "Đăng nhập thất bại. Vui lòng thử lại.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Chào mừng trở lại!"
      subtitle="Vui lòng đăng nhập để tiếp tục."
    >
      <button className="w-full h-12 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-3 font-bold text-gray-700 dark:text-white transition-colors text-sm mb-6">
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt="Google"
          className="w-5 h-5"
        />
        Đăng nhập bằng Google
      </button>

      <div className="flex items-center gap-4 mb-6">
        <div className="h-[1px] bg-gray-200 dark:bg-gray-700 flex-1"></div>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          Hoặc đăng nhập bằng Email
        </span>
        <div className="h-[1px] bg-gray-200 dark:bg-gray-700 flex-1"></div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
            Email
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
              mail
            </span>
            <input
              type="email"
              placeholder="email@example.com"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5 ml-1">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
              Mật khẩu
            </label>
            <a
              href="/auth/forgot-password"
              className="text-xs font-bold text-emerald-500 hover:underline"
            >
              Quên mật khẩu?
            </a>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
              lock
            </span>
            <input
              type="password"
              placeholder="••••••••"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 py-2">
          <input
            type="checkbox"
            id="remember"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 text-emerald-500 rounded border-gray-300 focus:ring-emerald-500 accent-emerald-500"
          />
          <label
            htmlFor="remember"
            className="text-xs font-medium text-gray-600 dark:text-gray-300 cursor-pointer select-none"
          >
            Ghi nhớ đăng nhập
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <span className="material-symbols-outlined animate-spin text-[20px]">
                refresh
              </span>
              Đang xử lý...
            </>
          ) : (
            <>
              Đăng nhập
              <span className="material-symbols-outlined text-[20px]">login</span>
            </>
          )}
        </button>

        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6">
          Chưa có tài khoản?{" "}
          <a
            href="/auth/signup"
            className="text-emerald-500 font-bold hover:underline"
          >
            Tạo tài khoản mới
          </a>
        </p>
      </form>
    </AuthLayout>
  );
}
