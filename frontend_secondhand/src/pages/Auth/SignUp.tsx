import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "./components/AuthLayout";
import { authService } from "@/services/authService";
import type { RegisterPayload, VerifyOTPPayload } from "@/types/auth";

export default function SignUpPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"register" | "verify">("register");
  const [formData, setFormData] = useState<RegisterPayload & { confirmPassword: string }>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    dateOfBirth: "",
  });
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [countdown, setCountdown] = useState(0);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!formData.name.trim()) {
      setError("Tên là bắt buộc");
      return;
    }

    if (!formData.phone.trim()) {
      setError("Số điện thoại là bắt buộc");
      return;
    }

    // Validate Vietnamese phone number: must start with 0 and have exactly 10 digits
    if (!/^0[0-9]{9}$/.test(formData.phone)) {
      setError("Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0");
      return;
    }

    if (!formData.dateOfBirth) {
      setError("Ngày sinh là bắt buộc");
      return;
    }

    // Validate age (must be at least 16 years old)
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();
      
      // Calculate exact age
      let exactAge = age;
      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        exactAge--;
      }
      
      if (exactAge < 16) {
        setError("Bạn phải đủ 16 tuổi trở lên để đăng ký");
        return;
      }
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu không khớp");
      return;
    }

    if (formData.password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      setError("Mật khẩu phải chứa chữ hoa, chữ thường và số");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
      });

      if (response.success) {
        setSuccess("Mã OTP đã được gửi đến email của bạn");
        setStep("verify");
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(response.message || "Đăng ký thất bại");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        "Đăng ký thất bại. Vui lòng thử lại.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Chỉ cho phép 1 ký tự
    if (!/^\d*$/.test(value)) return; // Chỉ cho phép số

    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    // Tự động focus vào ô tiếp theo
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const code = otpCode.join("");
    if (code.length !== 6) {
      setError("Vui lòng nhập đầy đủ 6 chữ số");
      return;
    }

    setLoading(true);

    try {
      const payload: VerifyOTPPayload = {
        email: formData.email,
        code,
        name: formData.name,
        password: formData.password,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
      };

      const response = await authService.verifyOTP(payload);

      if (response.success && response.data) {
        setSuccess("Đăng ký thành công!");
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        setError(response.message || "Mã OTP không hợp lệ");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        "Xác thực thất bại. Vui lòng thử lại.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setError("");
    setLoading(true);

    try {
      const response = await authService.resendOTP(formData.email);
      if (response.success) {
        setSuccess("Mã OTP mới đã được gửi");
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(response.message || "Không thể gửi lại OTP");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Không thể gửi lại OTP");
    } finally {
      setLoading(false);
    }
  };

  if (step === "verify") {
    return (
      <AuthLayout
        title="Xác thực Email"
        subtitle={`Nhập mã OTP đã được gửi đến ${formData.email}`}
      >
        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
            <p className="text-sm text-emerald-600 dark:text-emerald-400">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleVerifyOTP}>
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-3 ml-1">
              Mã OTP (6 chữ số)
            </label>
            <div className="flex gap-2 justify-center">
              {otpCode.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="w-12 h-14 text-center text-xl font-bold rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[20px]">
                  refresh
                </span>
                Đang xác thực...
              </>
            ) : (
              <>
                Xác thực
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
              </>
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={countdown > 0 || loading}
              className="text-sm font-bold text-emerald-500 hover:text-emerald-600 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {countdown > 0
                ? `Gửi lại mã sau ${countdown}s`
                : "Gửi lại mã OTP"}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setStep("register")}
              className="inline-flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Quay lại
            </button>
          </div>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Đăng ký tài khoản"
      subtitle="Bắt đầu hành trình sống xanh của bạn."
    >
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleRegister}>
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
            Họ và tên
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
              person
            </span>
            <input
              type="text"
              placeholder="Nguyễn Văn A"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
            />
          </div>
        </div>

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
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
            Số điện thoại <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
              phone
            </span>
            <input
              type="tel"
              placeholder="0901234567"
              required
              value={formData.phone}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, ""); // Chỉ cho phép số
                // Chỉ cho phép nhập tối đa 10 số và phải bắt đầu bằng 0
                if (value.length === 0 || (value[0] === "0" && value.length <= 10)) {
                  setFormData({ ...formData, phone: value });
                }
              }}
              maxLength={10}
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
            />
          </div>
          <p className="text-[10px] text-gray-400 ml-1 mt-1">
            10 chữ số, bắt đầu bằng số 0 (ví dụ: 0901234567)
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
            Ngày sinh <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
              calendar_today
            </span>
            <input
              type="date"
              required
              value={formData.dateOfBirth}
              onChange={(e) =>
                setFormData({ ...formData, dateOfBirth: e.target.value })
              }
              max={new Date(new Date().setFullYear(new Date().getFullYear() - 16)).toISOString().split("T")[0]}
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
            />
          </div>
          <p className="text-[10px] text-gray-400 ml-1 mt-1">
            Bạn phải đủ 16 tuổi trở lên
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
              Mật khẩu
            </label>
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
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
              Nhập lại mật khẩu
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                history
              </span>
              <input
                type="password"
                placeholder="••••••••"
                required
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
              />
            </div>
          </div>
        </div>
        <p className="text-[10px] text-gray-400 ml-1">
          Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường và số.
        </p>

        <div className="flex items-start gap-3 py-2">
          <input
            type="checkbox"
            id="terms"
            required
            className="mt-1 w-4 h-4 text-emerald-500 rounded border-gray-300 focus:ring-emerald-500 accent-emerald-500"
          />
          <label
            htmlFor="terms"
            className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed"
          >
            Tôi đồng ý với{" "}
            <a href="#" className="text-emerald-500 font-bold hover:underline">
              Điều khoản sử dụng
            </a>{" "}
            và{" "}
            <a href="#" className="text-emerald-500 font-bold hover:underline">
              Chính sách bảo mật
            </a>{" "}
            của SecondLife.
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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
              Tạo tài khoản
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </>
          )}
        </button>

        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6">
          Đã có tài khoản?{" "}
          <a
            href="/auth/signin"
            className="text-gray-900 dark:text-white font-bold hover:underline"
          >
            Đăng nhập ngay
          </a>
        </p>
      </form>
    </AuthLayout>
  );
}
