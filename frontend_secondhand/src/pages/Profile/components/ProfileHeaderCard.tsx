import type { UserProfile } from "../types";

type Props = {
  user: UserProfile;
  onEdit?: () => void;
};

export default function ProfileHeaderCard({ user, onEdit }: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-6 sm:items-center sm:justify-between transition-colors">
      
      <div className="flex items-center gap-5">
        {/* Avatar Section */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 ring-4 ring-gray-50 dark:ring-gray-700/50">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-400 dark:text-gray-500">
                {user.fullName.split(" ").slice(-1)[0]?.[0] ?? "U"}
              </div>
            )}
          </div>
          {/* Status Indicator (Optional) */}
          <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
        </div>

        {/* User Info Section */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
              {user.fullName}
            </h2>
            
            {user.verified && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-blue-800 text-xs font-bold uppercase tracking-wide">
                <span className="material-symbols-outlined text-[14px] filled">verified</span>
                Đã xác thực
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
            <div className="flex items-center gap-1.5 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              <span className="material-symbols-outlined text-[18px]">mail</span>
              {user.email}
            </div>
            <span className="hidden sm:block text-gray-300 dark:text-gray-600">|</span>
            <div className="flex items-center gap-1.5 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              <span className="material-symbols-outlined text-[18px]">call</span>
              {user.phone}
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex sm:block pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-700">
        <button
          type="button"
          onClick={onEdit}
          className="w-full sm:w-auto h-11 px-5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-sm inline-flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">edit_square</span>
          Chỉnh sửa hồ sơ
        </button>
      </div>
    </div>
  );
}