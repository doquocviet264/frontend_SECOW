import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import { adminService, type User } from "@/services/adminService";
import { useDebounce } from "@/components/hooks/useDebounce";

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<"user" | "seller" | "admin" | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "locked">("all");
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 500);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params: {
        page?: number;
        limit?: number;
        role?: "user" | "seller" | "admin";
        isActive?: boolean;
      } = {
        page: currentPage,
        limit: 20,
      };

      if (roleFilter !== "all") {
        params.role = roleFilter;
      }

      if (statusFilter === "active") {
        params.isActive = true;
      } else if (statusFilter === "locked") {
        params.isActive = false;
      }

      const res = await adminService.getUsers(params);
      if (res.success && res.data) {
        let filteredUsers = res.data.users || [];

        // Filter by search term (client-side for now)
        if (debouncedSearch.trim()) {
          filteredUsers = filteredUsers.filter(
            (user) =>
              user.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
              user.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
              (user.phone && user.phone.includes(debouncedSearch))
          );
        }

        setUsers(filteredUsers);
        setPagination(res.data.pagination);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter, statusFilter, debouncedSearch]);

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    if (!confirm(`Bạn có chắc chắn muốn ${currentStatus ? "khóa" : "mở khóa"} tài khoản này?`)) {
      return;
    }

    try {
      const res = await adminService.updateUserStatus(userId, !currentStatus);
      if (res.success) {
        alert(res.message || (currentStatus ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản"));
        fetchUsers();
      } else {
        alert(res.message || "Có lỗi xảy ra");
      }
    } catch (error: any) {
      alert(error?.response?.data?.message || "Có lỗi xảy ra");
      console.error("Error updating user status:", error);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400";
      case "seller":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Quản trị viên";
      case "seller":
        return "Người bán";
      default:
        return "Người dùng";
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Quản lý người dùng</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Quản lý và khóa/mở khóa tài khoản người dùng
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">Tổng số người dùng</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{pagination.total}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">Trang hiện tại</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {pagination.page}/{pagination.totalPages}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">Số người dùng mỗi trang</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{pagination.limit}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">Đang hiển thị</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{users.length}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Tìm kiếm
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Tên, email, số điện thoại..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Vai trò
              </label>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value as typeof roleFilter);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              >
                <option value="all">Tất cả</option>
                <option value="user">Người dùng</option>
                <option value="seller">Người bán</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Trạng thái
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as typeof statusFilter);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              >
                <option value="all">Tất cả</option>
                <option value="active">Đang hoạt động</option>
                <option value="locked">Đã khóa</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 border border-gray-200 dark:border-gray-700 text-center">
            <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">
              person_off
            </span>
            <p className="text-gray-600 dark:text-gray-400">Không tìm thấy người dùng nào</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Người dùng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Số điện thoại
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Vai trò
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Ngày đăng ký
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white">{user.name}</div>
                            {user.isEmailVerified && (
                              <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">verified</span>
                                Đã xác thực
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">{user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">{user.phone || "-"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getRoleBadgeColor(
                            user.role
                          )}`}
                        >
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                            <span className="material-symbols-outlined text-[14px] mr-1">check_circle</span>
                            Đang hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                            <span className="material-symbols-outlined text-[14px] mr-1">lock</span>
                            Đã khóa
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {user.role !== "admin" && (
                            <button
                              onClick={() => handleToggleStatus(user._id, user.isActive)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                user.isActive
                                  ? "text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30"
                                  : "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                              }`}
                            >
                              <span className="material-symbols-outlined text-[16px] mr-1">
                                {user.isActive ? "lock" : "lock_open"}
                              </span>
                              {user.isActive ? "Khóa" : "Mở khóa"}
                            </button>
                          )}
                          {user.role === "admin" && (
                            <span className="text-xs text-gray-400 dark:text-gray-500">Không thể khóa</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Hiển thị {(currentPage - 1) * pagination.limit + 1} -{" "}
                  {Math.min(currentPage * pagination.limit, pagination.total)} trong tổng số {pagination.total}{" "}
                  người dùng
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Trước
                  </button>
                  <span className="px-3 py-1.5 text-sm font-semibold text-gray-900 dark:text-white">
                    {currentPage} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={currentPage === pagination.totalPages}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

