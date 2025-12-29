import type { ProfileTabKey, UserProfile } from "../types";

type NavItem = {
  key: ProfileTabKey;
  label: string;
  icon: string;
};

const NAV: NavItem[] = [
  { key: "overview", label: "Tổng quan", icon: "grid_view" },
  { key: "orders", label: "Đơn mua", icon: "receipt_long" },
  { key: "personal", label: "Thông tin cá nhân", icon: "person" },
  { key: "address", label: "Địa chỉ", icon: "location_on" },
];

type Props = {
  user: UserProfile;
  active: ProfileTabKey;
  onChange: (k: ProfileTabKey) => void;
  onLogout?: () => void;
};

export default function ProfileSidebar({ user, active, onChange, onLogout }: Props) {
  return (
    <aside className="w-full bg-white dark:bg-gray-800 rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-gray-700 p-5 transition-colors duration-200">
      {/* User Info Section */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
        <div className="relative shrink-0">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 ring-2 ring-white dark:ring-gray-600 shadow-sm">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg font-bold text-gray-400 dark:text-gray-300">
                {user.fullName.split(" ").slice(-1)[0]?.[0] ?? "U"}
              </div>
            )}
          </div>
          {/* Online status indicator (optional decoration) */}
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-gray-900 dark:text-white truncate text-base">
            {user.fullName}
          </h3>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
            Thành viên từ {user.joinedYear}
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="space-y-1.5">
        {NAV.map((it) => {
          const isActive = it.key === active;
          return (
            <button
              key={it.key}
              type="button"
              onClick={() => onChange(it.key)}
              className={`
                group w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ease-in-out
                ${
                  isActive
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
                }
              `}
            >
              <span
                className={`material-symbols-outlined text-[22px] transition-colors ${
                  isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300"
                }`}
              >
                {it.icon}
              </span>
              <span className="flex-1 text-left">{it.label}</span>
              
              {/* Active Indicator Dot */}
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"></span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all duration-200 group"
        >
          <span className="material-symbols-outlined text-[22px] text-gray-400 group-hover:text-red-500 dark:text-gray-500 dark:group-hover:text-red-400 transition-colors">
            logout
          </span>
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}