import { useState, useEffect, useMemo } from "react";
import AdminLayout from "../components/AdminLayout";
import CategoryDialog, { type CategoryFormData } from "./CategoryDialog";
import {
  categoryService,
  type CategoryPayload,
} from "@/services/categoryService";
import type { Category } from "@/types/product";

const StatusToggle = ({
  isActive,
  onClick,
}: {
  isActive: boolean;
  onClick?: () => void;
}) => (
  <div
    onClick={(e) => {
      e.stopPropagation();
      if (onClick) onClick();
    }}
    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
      isActive ? "bg-emerald-500" : "bg-gray-300"
    }`}
  >
    <span
      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${
        isActive ? "translate-x-4" : "translate-x-1"
      }`}
    />
  </div>
);

const CategoryRow = ({
  item,
  level = 0,
  onEdit,
  onDisable,
}: {
  item: Category;
  level?: number;
  onEdit: (category: Category) => void;
  onDisable: (categoryId: string) => void;
}) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <>
      <div className="group flex items-center py-3 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
        <div className="flex-1 flex items-center pl-6">
          <div
            style={{ paddingLeft: level * 42 }}
            className="flex items-center"
          >
            {level > 0 && (
              <div className="relative -ml-4 mr-3 w-4 h-8 flex items-center">
                <div className="absolute top-[-18px] left-0 bottom-1/2 w-[2px] bg-gray-200 dark:bg-gray-700 rounded-b-sm"></div>
                <div className="absolute top-1/2 left-0 w-4 h-[2px] bg-gray-200 dark:bg-gray-700 rounded-r-sm"></div>
              </div>
            )}

            <button
              onClick={() => setExpanded(!expanded)}
              className={`w-6 h-6 flex items-center justify-center rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 transition-all mr-2 ${
                hasChildren ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <span
                className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${
                  expanded ? "rotate-90" : ""
                }`}
              >
                chevron_right
              </span>
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl border border-gray-100 dark:border-gray-700 p-0.5 bg-white shrink-0 shadow-sm">
                <img
                  src={
                    typeof item.image === "string"
                      ? item.image
                      : "https://via.placeholder.com/150"
                  }
                  alt={item.name}
                  className="w-full h-full object-cover rounded-[9px]"
                />
              </div>

              <div>
                <div
                  className={`text-sm text-gray-900 dark:text-white ${
                    level === 0 ? "font-bold" : "font-medium"
                  }`}
                >
                  {item.name}
                </div>
                <div className="text-[10px] text-gray-400 font-medium mt-0.5">
                  ID: {item._id}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-40 text-center text-sm font-semibold text-gray-600 dark:text-gray-300">
          {new Intl.NumberFormat().format(item.productCount || 0)}
        </div>

        <div className="w-32 text-center">
          <StatusToggle isActive={item.isActive} onClick={() => onDisable(item._id)}/>
        </div>

        <div className="w-32 flex justify-end pr-6 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(item)}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Chỉnh sửa"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button
            onClick={() => onDisable(item._id)}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Vô hiệu hóa"
          >
            <span className="material-symbols-outlined text-[18px]">
              delete
            </span>
          </button>
        </div>
      </div>

      {hasChildren && expanded && (
        <div className="relative">
          {level === 0 && (
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-gray-100 dark:bg-gray-800"
              style={{ left: 66 }}
            />
          )}
          {item.children!.map((child) => (
            <CategoryRow
              key={child._id}
              item={child}
              level={level + 1}
              onEdit={onEdit}
              onDisable={onDisable}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCategories, setTotalCategories] = useState(0);
  const [totalPageItems, setTotalPageItems] = useState(0);

  const fetchCategories = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await categoryService.getCategoriesForAdmin({
        page,
        limit: 10,
      });
      if (res.success && res.data) {
        setCategories(res.data.categories);
        setTotalPages(res.data.totalPages);
        setTotalCategories(res.data.totalCategories);
        setCurrentPage(res.data.currentPage);
        setTotalPageItems(res.data.totalPageItems);
      }
    } catch (error) {
      console.error(error);
      alert("Không thể tải danh sách danh mục");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(currentPage);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  const handleAddNew = () => {
    setEditingCategory(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  const handleDisable = async (categoryId: string) => {
    const confirm = window.confirm(
      "Bạn có chắc chắn muốn vô hiệu hóa/mở danh mục này không?"
    );
    if (!confirm) return;

    try {
      const res = await categoryService.disableCategory(categoryId);
      alert("Cập nhật trạng thái danh mục thành công!");
      fetchCategories(currentPage);
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra khi vô hiệu hóa danh mục. Vui lòng thử lại.");
    }
  };

  const handleDialogSubmit = async (data: CategoryFormData) => {
    try {
      const payload: CategoryPayload = {
        name: data.name,
        image: data.image || undefined,
        parentId: data.parentId || null,
        isActive: data.isActive,
      };

      let res;
      if (editingCategory) {
        res = await categoryService.updateCategory(
          editingCategory._id,
          payload
        );
      } else {
        res = await categoryService.createCategory(payload);
      }

      if (res && res.success) {
        alert(
          editingCategory
            ? "Cập nhật danh mục thành công!"
            : "Tạo danh mục mới thành công!"
        );
        setIsDialogOpen(false);
        fetchCategories(currentPage);
      }
    } catch (error) {
      console.error(error);
      alert(
        "Có lỗi xảy ra trong quá trình xử lý. Vui lòng kiểm tra lại thông tin."
      );
    }
  };

  const sortCategories = (nodes: Category[]): Category[] => {
    if (!sortConfig) return nodes;

    const sorted = [...nodes].sort((a, b) => {
      if (sortConfig.key === "productCount") {
        return sortConfig.direction === "asc"
          ? (a.productCount || 0) - (b.productCount || 0)
          : (b.productCount || 0) - (a.productCount || 0);
      }
      return 0;
    });

    return sorted.map((node) => ({
      ...node,
      children: node.children ? sortCategories(node.children) : undefined,
    }));
  };

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "desc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "desc"
    ) {
      direction = "asc";
    }
    setSortConfig({ key, direction });
  };

  const sortedCategories = useMemo(
    () => sortCategories(categories),
    [categories, sortConfig]
  );

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`w-9 h-9 flex items-center justify-center rounded-lg ${
            currentPage === i
              ? "bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-500/20"
              : "border border-transparent hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 text-sm transition-colors"
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">
                Quản lý Danh mục
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Tổ chức và phân cấp danh mục sản phẩm trên sàn.
              </p>
            </div>
            <button
              onClick={handleAddNew}
              className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Thêm Danh mục
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-3 bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
              <div className="lg:col-span-8 relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Tìm kiếm danh mục..."
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>

              <div className="lg:col-span-2">
                <select className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm outline-none focus:border-emerald-500 font-medium text-gray-600 cursor-pointer">
                  <option>Tất cả trạng thái</option>
                  <option>Đang hoạt động</option>
                  <option>Đã ẩn</option>
                </select>
              </div>

              <div className="lg:col-span-2">
                <select
                  onChange={(e) => handleSort(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm outline-none focus:border-emerald-500 font-medium text-gray-600 cursor-pointer"
                >
                  <option value="">Sắp xếp mặc định</option>
                  <option value="productCount">Số lượng sản phẩm</option>
                </select>
              </div>
            </div>

            <div className="flex items-center py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <div className="flex-1 pl-6">Tên danh mục</div>
              <div
                className="w-40 text-center cursor-pointer hover:text-emerald-500 flex items-center justify-center gap-1"
                onClick={() => handleSort("productCount")}
              >
                Sản phẩm
                <span className="material-symbols-outlined text-[14px]">
                  unfold_more
                </span>
              </div>
              <div className="w-32 text-center">Trạng thái</div>
              <div className="w-32 text-right pr-10">Hành động</div>
            </div>

            <div className="bg-white dark:bg-gray-800 min-h-[400px]">
              {isLoading ? (
                <div className="flex justify-center items-center h-40 text-gray-500">
                  Đang tải dữ liệu...
                </div>
              ) : sortedCategories.length > 0 ? (
                sortedCategories.map((category) => (
                  <CategoryRow
                    key={category._id}
                    item={category}
                    onEdit={handleEdit}
                    onDisable={handleDisable}
                  />
                ))
              ) : (
                <div className="flex justify-center items-center h-40 text-gray-500">
                  Chưa có danh mục nào.
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/30 dark:bg-gray-900/30">
              <span className="text-sm text-gray-500">
                Hiển thị {totalPageItems} trên {totalCategories} danhmục
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    chevron_left
                  </span>
                </button>
                {renderPagination()}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    chevron_right
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <CategoryDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSubmit={handleDialogSubmit}
          initialData={editingCategory}
        />
      </div>
    </AdminLayout>
  );
}
