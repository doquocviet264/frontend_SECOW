import type { UserProfile } from "../types";

type Props = {
  user: UserProfile;
};

export default function PersonalInfoTab({ user }: Props) {
  return (
    <div className="space-y-6">
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
                  {user.fullName.charAt(0)}
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
                type="text"
                defaultValue={user.fullName}
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
                defaultValue={user.email}
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
                type="tel"
                defaultValue={user.phone}
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
              <select className="w-full h-11 pl-10 pr-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none transition-all">
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
                type="date"
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>
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
                defaultValue={user.joinedYear}
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
            <input type="password" placeholder="••••••••" className="w-full h-11 px-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">Mật khẩu mới</label>
            <input type="password" placeholder="••••••••" className="w-full h-11 px-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">Nhập lại mật khẩu mới</label>
            <input type="password" placeholder="••••••••" className="w-full h-11 px-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-4 pt-2">
        <button className="h-11 px-8 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          Huỷ bỏ
        </button>
        <button className="h-11 px-8 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:shadow-blue-600/30 active:scale-95 transition-all">
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
}