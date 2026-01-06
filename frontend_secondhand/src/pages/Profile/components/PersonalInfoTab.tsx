import { useState, useRef } from "react";
import type { UserProfile } from "../types";
import { userService } from "@/services/userService";
import { authService } from "@/services/authService";

type Props = {
  user: UserProfile;
  onUserUpdate?: () => void;
};

export default function PersonalInfoTab({ user, onUserUpdate }: Props) {
  const [formData, setFormData] = useState({
    fullName: user.fullName || "",
    phone: user.phone || "",
    dateOfBirth: user.dateOfBirth || "",
    gender: "male", // Default value, không có trong API hiện tại
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  
  // Refs để reset form khi cancel
  const nameInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const genderSelectRef = useRef<HTMLSelectElement>(null);

  // Calculate max date (16 years ago from today)
  const getMaxDate = (): string => {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
    return maxDate.toISOString().split('T')[0];
  };

  // Validate date of birth on change
  const validateDateOfBirth = (dateString: string) => {
    if (!dateString) {
      setDateError(null);
      return true;
    }

    const birthDate = new Date(dateString);
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
      setDateError("Bạn phải đủ 16 tuổi trở lên");
      return false;
    } else {
      setDateError(null);
      return true;
    }
  };

  const handleCancel = () => {
    // Reset form về giá trị ban đầu
    setFormData({
      fullName: user.fullName || "",
      phone: user.phone || "",
      dateOfBirth: user.dateOfBirth || "",
      gender: "male",
    });
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setError(null);
    setSuccess(null);
    setDateError(null);
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Validate date of birth - must be at least 16 years old
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
          setError("Ngày sinh không hợp lệ. Bạn phải đủ 16 tuổi trở lên.");
          setLoading(false);
          return;
        }
      }

      const updatePayload: {
        name?: string;
        phone?: string;
        dateOfBirth?: string;
      } = {};

      if (formData.fullName !== user.fullName) {
        updatePayload.name = formData.fullName;
      }
      if (formData.phone !== user.phone) {
        updatePayload.phone = formData.phone;
      }
      if (formData.dateOfBirth !== user.dateOfBirth) {
        updatePayload.dateOfBirth = formData.dateOfBirth;
      }

      // Chỉ gọi API nếu có thay đổi
      if (Object.keys(updatePayload).length > 0) {
        const response = await userService.updateProfile(updatePayload);
        if (response.success) {
          setSuccess("Cập nhật thông tin thành công!");
          // Refresh user data
          if (onUserUpdate) {
            onUserUpdate();
          }
          // Clear success message after 3 seconds
          setTimeout(() => setSuccess(null), 3000);
        }
      } else {
        setSuccess("Không có thay đổi nào để lưu.");
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || "Có lỗi xảy ra khi cập nhật thông tin";
      setError(errorMessage);
      console.error("Error updating profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Validation
      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        setError("Vui lòng điền đầy đủ thông tin mật khẩu");
        setLoading(false);
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError("Mật khẩu mới và xác nhận mật khẩu không khớp");
        setLoading(false);
        return;
      }

      if (passwordData.newPassword.length < 8) {
        setError("Mật khẩu mới phải có ít nhất 8 ký tự");
        setLoading(false);
        return;
      }

      // Call change password API
      const response = await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.success) {
        setSuccess("Đổi mật khẩu thành công!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || "Có lỗi xảy ra khi đổi mật khẩu";
      setError(errorMessage);
      console.error("Error changing password:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    // Save profile info first
    await handleSaveProfile();
    
    // If password fields are filled, change password
    if (passwordData.currentPassword || passwordData.newPassword || passwordData.confirmPassword) {
      await handleChangePassword();
    }
  };

  return (
    <div className="space-y-6">
      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl">
          {success}
        </div>
      )}

      {/* 1. Main Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Thông tin chung</h3>

        {/* Avatar Upload Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg ring-1 ring-gray-100 dark:ring-gray-600">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-4xl font-bold text-gray-400">
                  {formData.fullName.charAt(0) || user.fullName.charAt(0)}
                </div>
              )}
            </div>
            
            {/* Camera Button */}
            <button className="absolute bottom-1 right-1 p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-transform hover:scale-105 active:scale-95 border-2 border-white dark:border-gray-800">
              <span className="material-symbols-outlined text-[18px] block">photo_camera</span>
            </button>
          </div>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            Nhấn vào biểu tượng camera để đổi ảnh
          </p>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">
              Họ và tên
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">person</span>
              <input
                ref={nameInputRef}
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Email (Read only usually) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">
              Email
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">mail</span>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-500 cursor-not-allowed opacity-70"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">
              Số điện thoại
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">call</span>
              <input
                ref={phoneInputRef}
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Gender */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">
              Giới tính
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">wc</span>
              <select
                ref={genderSelectRef}
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none transition-all"
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px] pointer-events-none">expand_more</span>
            </div>
          </div>

          {/* Birthday */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">
              Ngày sinh
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">cake</span>
              <input
                ref={dateInputRef}
                type="date"
                max={getMaxDate()}
                value={formData.dateOfBirth}
                onChange={(e) => {
                  const newDate = e.target.value;
                  validateDateOfBirth(newDate);
                  setFormData({ ...formData, dateOfBirth: newDate });
                }}
                className={`w-full h-11 pl-10 pr-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border ${
                  dateError 
                    ? 'border-red-300 dark:border-red-700' 
                    : 'border-gray-200 dark:border-gray-700'
                } text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all`}
              />
            </div>
            {dateError && (
              <p className="text-xs text-red-600 dark:text-red-400 ml-1 mt-1">{dateError}</p>
            )}
          </div>

           {/* Joined Year (Read Only) */}
           <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">
              Thành viên từ
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">calendar_month</span>
              <input
                type="text"
                value={user.joinedYear}
                disabled
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-500 cursor-not-allowed opacity-70"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Security / Password Card */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">lock</span>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Đổi mật khẩu</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">Mật khẩu hiện tại</label>
            <input
              type="password"
              placeholder="••••••••"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className="w-full h-11 px-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">Mật khẩu mới</label>
            <input
              type="password"
              placeholder="••••••••"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="w-full h-11 px-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">Nhập lại mật khẩu mới</label>
            <input
              type="password"
              placeholder="••••••••"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="w-full h-11 px-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-4 pt-2">
        <button
          onClick={handleCancel}
          disabled={loading}
          className="h-11 px-8 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Huỷ bỏ
        </button>
        <button
          onClick={handleSaveAll}
          disabled={loading}
          className="h-11 px-8 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:shadow-blue-600/30 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Đang lưu...
            </>
          ) : (
            "Lưu thay đổi"
          )}
        </button>
      </div>
    </div>
  );
}
