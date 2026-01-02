import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import SellerLayout from "../components/SellerLayout";
import { productService, type GetSellerProductsParams } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
import type { Product, Category } from "@/types/product";
import { useDebounce } from "@/components/hooks/useDebounce";
import ProductDialog, { type ProductFormData } from "./ProductDialog";

type ProductStatus = "pending" | "active" | "hidden" | "violation" | "sold";

const TABS: { id: ProductStatus | "all"; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: "active", label: "Đang hoạt động" },
  { id: "pending", label: "Chờ duyệt" },
  { id: "violation", label: "Vi phạm" },
  { id: "hidden", label: "Bị ẩn" },
  { id: "sold", label: "Đã bán" },
];

const StatusBadge = ({ status, reason }: { status: ProductStatus; reason?: string }) => {
  const styles: Record<ProductStatus, string> = {
    active: "bg-emerald-100 text-emerald-700 border-emerald-200",
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    violation: "bg-red-100 text-red-700 border-red-200",
    sold: "bg-gray-100 text-gray-700 border-gray-200",
    hidden: "bg-purple-100 text-purple-700 border-purple-200",
  };

  const labels: Record<ProductStatus, string> = {
    active: "Đang bán",
    pending: "Chờ duyệt",
    violation: "Vi phạm",
    sold: "Đã bán",
    hidden: "Đã ẩn",
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${styles[status] || "bg-gray-100"}`}>
        {labels[status] || status}
      </span>
      {status === "violation" && reason && (
        <div className="p-2 bg-red-50 border border-red-100 rounded-md max-w-[220px]">
          <p className="text-xs text-red-600 leading-relaxed break-words font-medium">
            {reason}
          </p>
        </div>
      )}
    </div>
  );
};

export default function SellerProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingData, setEditingData] = useState<ProductFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchInputValue, setSearchInputValue] = useState(searchParams.get("name") || "");
  const debouncedSearchQuery = useDebounce(searchInputValue, 500);

  const activeTab = useMemo(() => searchParams.get("status") || "all", [searchParams]);
  const selectedCategory = useMemo(() => searchParams.get("categoryId") || "", [searchParams]);
  const sortBy = useMemo(() => searchParams.get("sortBy") || "", [searchParams]);
  const currentPage = useMemo(() => parseInt(searchParams.get("page") || "1"), [searchParams]);

  const fetchProducts = async (params: GetSellerProductsParams) => {
    setIsLoading(true);
    try {
      const res = await productService.getSellerProducts(params);
      if (res.success && res.data) {
        setProducts(res.data.products || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error(error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getCategories();
      if (res.success && res.data) {
        // Backend trả về data: { categories: [...] }
        const categoriesArray = Array.isArray(res.data) 
          ? res.data 
          : (res.data.categories || []);
        setCategories(categoriesArray);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error(error);
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const name = searchParams.get('name') || '';
    if (name !== debouncedSearchQuery) {
      setSearchInputValue(name);
    }
  }, [searchParams, debouncedSearchQuery]);

  useEffect(() => {
    const params: GetSellerProductsParams = {
      page: currentPage,
      limit: pagination.limit,
      status: activeTab === "all" ? undefined : activeTab,
      title: debouncedSearchQuery || undefined,
      categoryId: selectedCategory || undefined,
      sortBy: sortBy || undefined,
    };
    fetchProducts(params);
  }, [currentPage, activeTab, debouncedSearchQuery, selectedCategory, sortBy]);

  const handleFilterChange = (key: string, value: string | null) => {
    if (key === 'name') return;
    setSearchParams(prev => {
      if (value === null || value === "") {
        prev.delete(key);
      } else {
        prev.set(key, value);
      }
      if (key !== 'page') {
        prev.set('page', '1');
      }
      return prev;
    });
  };

  const handleClearFilters = () => {
    setSearchInputValue("");
    setSearchParams({});
  };

  const handleAddNew = () => {
    setEditingData(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (product: Product) => {
    const formData: ProductFormData = {
      id: product._id,
      title: product.title,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      stock: product.stock,
      weight: product.weight,
      brand: product.brand,
      condition: product.condition,
      categoryId: product.category?._id || "",
      video: product.video,
      location: product.location,
      attributes: product.attributes,
      images: product.images
    };

    setEditingData(formData);
    setIsDialogOpen(true);
  };


const handleToggleStatus = async (product: Product) => {
  if (product.status !== "active" && product.status !== "hidden") {
    alert("Chỉ có thể thay đổi trạng thái sản phẩm đang hoạt động hoặc đang ẩn.");
    return;
  }

  const newStatus = product.status === "active" ? "hidden" : "active";
  const actionText = newStatus === "hidden" ? "ẩn" : "hiện";

  if (!window.confirm(`Bạn có chắc chắn muốn ${actionText} sản phẩm này không?`)) return;

  try {
    const res = await productService.hideProduct(product._id, newStatus);
    if (res.success) {
      const params = {
        page: currentPage,
        limit: pagination.limit,
        status: activeTab === "all" ? undefined : activeTab,
      };
      fetchProducts(params);
    } else {
      alert(res.message || "Không thể cập nhật trạng thái");
    }
  } catch (error: any) {
    console.error(error);
    alert(error.response?.data?.message || "Lỗi kết nối server");
  }
};

  const handleDialogSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();

      formData.append("title", data.title);
      formData.append("price", data.price.toString());
      formData.append("originalPrice", data.originalPrice.toString());
      formData.append("stock", data.stock.toString());
      formData.append("weight", data.weight.toString());
      formData.append("brand", data.brand);
      formData.append("condition", data.condition);
      formData.append("categoryId", data.categoryId);
      formData.append("description", data.description);

      formData.append("location", JSON.stringify(data.location));
      formData.append("attributes", JSON.stringify(data.attributes));

      data.images.forEach((file) => {
        if (file instanceof File) {
          formData.append("images", file);
        } else {
          formData.append("existingImages", file);
        }
      });

      if (data.video instanceof File) {
        formData.append("video", data.video);
      }

      let res;
      if (data.id) {
        res = await productService.updateProduct(data.id, formData);
      } else {
        res = await productService.createProduct(formData);
      }
      
      if (res.success) {
        setIsDialogOpen(false);
        const params = {
           page: data.id ? currentPage : 1,
           limit: pagination.limit,
           status: activeTab === "all" ? undefined : activeTab,
        };
        fetchProducts(params);
      } else {
        alert(res.message || "Có lỗi xảy ra!");
      }

    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Lỗi kết nối server");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatVND = (price: number) => new Intl.NumberFormat("vi-VN").format(price);

  return (
    <SellerLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Danh sách sản phẩm</h1>
            <p className="text-sm text-gray-500 mt-1">Quản lý kho hàng, cập nhật giá và trạng thái sản phẩm</p>
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Thêm sản phẩm mới
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          
          <div className="border-b border-gray-100 dark:border-gray-700 overflow-x-auto">
            <div className="flex px-6">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleFilterChange('status', tab.id === 'all' ? null : tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-4 border-b-2 text-sm font-bold whitespace-nowrap transition-colors
                    ${activeTab === tab.id
                      ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-3 bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
            <div className="lg:col-span-5 relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
              <input
                type="text"
                placeholder="Tìm kiếm theo tên sản phẩm..."
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                value={searchInputValue}
                onChange={(e) => setSearchInputValue(e.target.value)}
              />
            </div>

            <div className="lg:col-span-3">
              <select
                className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm outline-none focus:border-emerald-500"
                value={selectedCategory}
                onChange={(e) => handleFilterChange('categoryId', e.target.value)}
              >
                <option value="">Tất cả danh mục</option>
                {categories?.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
              </select>
            </div>

            <div className="lg:col-span-2">
              <select
                className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm outline-none focus:border-emerald-500"
                value={sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <option value="">Sắp xếp mặc định</option>
                <option value="price:asc">Giá: Thấp đến cao</option>
                <option value="price:desc">Giá: Cao đến thấp</option>
                <option value="createdAt:desc">Mới nhất</option>
                <option value="createdAt:asc">Cũ nhất</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <button
                onClick={handleClearFilters}
                className="w-full h-10 flex items-center justify-center gap-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-bold text-gray-600 dark:text-gray-300 transition-colors">
                <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
                Xóa lọc
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 uppercase text-xs font-bold border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="p-4">Sản phẩm</th>
                  <th className="p-4">Danh mục</th>
                  <th className="p-4">Giá bán (VNĐ)</th>
                  <th className="p-4 text-center">Tồn kho</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                {isLoading ? (
                  <tr><td colSpan={6} className="text-center p-8 text-gray-500">Đang tải sản phẩm...</td></tr>
                ) : (products?.length || 0) > 0 ? (
                  products?.map((product) => (
                    <tr key={product._id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="p-4">
                        <div className="flex gap-3">
                          <div className="w-12 h-12 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shrink-0 bg-gray-100">
                            <img src={product.images?.[0] || 'https://via.placeholder.com/100'} alt={product.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0 max-w-[250px]">
                            <div className="font-bold text-gray-900 dark:text-white truncate" title={product.title}>
                              {product.title}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">ID: {product._id}</div>
                            <div className="text-xs text-emerald-600 mt-0.5 font-medium truncate">
                              {product.brand}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600 dark:text-gray-300">
                        {product.category?.name || "N/A"}
                      </td>
                      <td className="p-4 font-bold text-gray-900 dark:text-white">{formatVND(product.price)}</td>
                      <td className="p-4 text-center text-gray-600 dark:text-gray-300">{product.stock}</td>
                      <td className="p-4 align-top">
                        <StatusBadge status={product.status as ProductStatus} reason={product.violationReason} />
                      </td>
                      <td className="p-4 text-right align-top">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {["active", "hidden"].includes(product.status) && (
                            <button
                              onClick={() => handleToggleStatus(product)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                product.status === "hidden"
                                  ? "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                  : "text-emerald-500 hover:bg-emerald-50 hover:text-emerald-700"
                              }`}
                              title={product.status === "hidden" ? "Hiện sản phẩm" : "Ẩn sản phẩm"}
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                {product.status === "hidden" ? "visibility" : "visibility_off"}
                              </span>
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-1.5 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                            title="Chỉnh sửa"
                          >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600" title="Xóa">
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className="text-center p-8 text-gray-500">Không tìm thấy sản phẩm nào.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {pagination.total > 0 && (
            <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Hiển thị <span className="font-bold text-gray-900 dark:text-white">{(currentPage - 1) * pagination.limit + 1}-{(currentPage - 1) * pagination.limit + (products?.length || 0)}</span> trong số <span className="font-bold text-gray-900 dark:text-white">{pagination.total}</span> sản phẩm
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleFilterChange('page', (currentPage - 1).toString())}
                  disabled={currentPage <= 1}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 bg-white dark:bg-gray-800 disabled:opacity-50">
                  <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                </button>

                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(pageNumber => (
                  <button
                    key={pageNumber}
                    onClick={() => handleFilterChange('page', pageNumber.toString())}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm ${pageNumber === currentPage ? 'bg-emerald-500 text-white font-bold shadow-md' : 'border border-transparent hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                    {pageNumber}
                  </button>
                ))}
                <button
                  onClick={() => handleFilterChange('page', (currentPage + 1).toString())}
                  disabled={currentPage >= pagination.totalPages}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 bg-white dark:bg-gray-800 disabled:opacity-50">
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      <ProductDialog
        isOpen={isDialogOpen}
        onClose={() => !isSubmitting && setIsDialogOpen(false)}
        onSubmit={handleDialogSubmit}
        categories={categories}
        initialData={editingData}
      />
    </SellerLayout>
  );
}