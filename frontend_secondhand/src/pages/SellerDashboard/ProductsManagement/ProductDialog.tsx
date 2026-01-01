import React, { useEffect, useState, useRef } from "react";
import type { Category } from "@/types/product";

export type ProductFormData = {
  id?: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  stock: number;
  weight: number;
  brand: string;
  condition: "Like New" | "Good" | "Fair" | "Old";
  categoryId: string;
  video: string | File | null;
  location: {
    city: string;
    district: string;
    detail: string;
  };
  attributes: { name: string; value: string }[];
  images: (string | File)[];
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => void;
  initialData?: ProductFormData | null;
  categories: Category[];
};

export default function ProductDialog({ isOpen, onClose, onSubmit, initialData, categories }: Props) {
  const defaultForm: ProductFormData = {
    title: "",
    description: "",
    price: 0,
    originalPrice: 0,
    stock: 1,
    weight: 0,
    brand: "",
    condition: "Good",
    categoryId: "",
    video: null,
    location: { city: "", district: "", detail: "" },
    attributes: [{ name: "", value: "" }],
    images: [],
  };

  const [formData, setFormData] = useState<ProductFormData>(defaultForm);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          ...defaultForm,
          ...initialData,
          attributes: initialData.attributes?.length ? initialData.attributes : [{ name: "", value: "" }],
          location: {
            city: initialData.location?.city || "",
            district: initialData.location?.district || "",
            detail: initialData.location?.detail || ""
          }
        });

        const imgPreviews = initialData.images.map((img) =>
          typeof img === 'string' ? img : URL.createObjectURL(img)
        );
        setPreviewImages(imgPreviews);

        if (initialData.video) {
          if (typeof initialData.video === 'string') {
            setVideoPreview(initialData.video);
          } else if (initialData.video instanceof File) {
            setVideoPreview(URL.createObjectURL(initialData.video));
          }
        } else {
          setVideoPreview(null);
        }

      } else {
        setFormData(defaultForm);
        setPreviewImages([]);
        setVideoPreview(null);
      }
    }
    return () => {
      if (videoPreview && !videoPreview.startsWith('http')) {
        URL.revokeObjectURL(videoPreview);
      }
    };
  }, [isOpen, initialData]);

  const handleChange = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLocationChange = (field: keyof typeof formData.location, value: string) => {
    setFormData((prev) => ({
      ...prev,
      location: { ...prev.location, [field]: value },
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const totalImages = formData.images.length + newFiles.length;

      if (totalImages > 5) {
        alert("Chỉ được đăng tối đa 5 ảnh!");
        return;
      }

      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...newFiles] }));
      setPreviewImages((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 20 * 1024 * 1024; 
      if (file.size > maxSize) {
        alert("File video quá lớn! Vui lòng chọn file dưới 20MB.");
        e.target.value = "";
        return;
      }
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
      setFormData(prev => ({ ...prev, video: file }));
    }
  };

  const removeVideo = () => {
    setVideoPreview(null);
    setFormData(prev => ({ ...prev, video: null }));
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const updateAttribute = (index: number, key: "name" | "value", val: string) => {
    const newAttrs = [...formData.attributes];
    newAttrs[index][key] = val;
    setFormData((prev) => ({ ...prev, attributes: newAttrs }));
  };

  const addAttribute = () => {
    setFormData((prev) => ({
      ...prev,
      attributes: [...prev.attributes, { name: "", value: "" }],
    }));
  };

  const removeAttribute = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("Vui lòng nhập tên sản phẩm!");
      return;
    }
    if (!formData.categoryId) {
      alert("Vui lòng chọn danh mục sản phẩm!");
      return;
    }
    if (!formData.brand.trim()) {
      alert("Vui lòng nhập thương hiệu sản phẩm!");
      return;
    }
    if (!formData.description.trim()) {
      alert("Vui lòng nhập mô tả chi tiết sản phẩm!");
      return;
    }
    if (formData.images.length === 0) {
        alert("Vui lòng tải lên ít nhất 1 hình ảnh sản phẩm!");
        return;
    }

    if (formData.price <= 0) {
      alert("Giá bán phải lớn hơn 0!");
      return;
    }
    if (formData.weight <= 0) {
      alert("Cân nặng phải lớn hơn 0 (để tính phí vận chuyển)!");
      return;
    }
    if (formData.stock < 0) {
      alert("Số lượng kho không hợp lệ!");
      return;
    }

    if (formData.originalPrice > 0 && formData.originalPrice < formData.price) {
      alert("Giá gốc phải lớn hơn hoặc bằng giá bán!");
      return;
    }

    const hasIncompleteAttributes = formData.attributes.some(
      attr => (attr.name.trim() !== "" && attr.value.trim() === "") || 
              (attr.name.trim() === "" && attr.value.trim() !== "")
    );

    if (hasIncompleteAttributes) {
      alert("Thuộc tính không hợp lệ: Vui lòng điền đủ Tên và Giá trị (hoặc xóa dòng thừa)!");
      return;
    }

    const validAttributes = formData.attributes.filter(
      attr => attr.name.trim() !== "" && attr.value.trim() !== ""
    );

    onSubmit({ ...formData, attributes: validAttributes });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {initialData?.id ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
          </h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 transition-colors">
            <span className="material-symbols-outlined text-gray-500">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <form id="productForm" onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                Hình ảnh sản phẩm (Tối đa 5) <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {formData.images.length < 5 && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 shrink-0 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors"
                  >
                    <span className="material-symbols-outlined text-gray-400">add_photo_alternate</span>
                    <span className="text-[10px] text-gray-400 font-bold mt-1">Thêm ảnh</span>
                    <input type="file" multiple ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                  </div>
                )}
                {previewImages.map((src, idx) => (
                  <div key={idx} className="relative w-24 h-24 shrink-0 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden group">
                    <img src={src} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Tên sản phẩm <span className="text-red-500">*</span></label>
                <input type="text" value={formData.title} onChange={(e) => handleChange("title", e.target.value)} maxLength={200} className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm outline-none focus:border-emerald-500 transition-all" placeholder="Nhập tên sản phẩm..." required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Danh mục <span className="text-red-500">*</span></label>
                <select value={formData.categoryId} onChange={(e) => handleChange("categoryId", e.target.value)} className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm outline-none focus:border-emerald-500 transition-all" required>
                  <option value="">Chọn danh mục</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Thương hiệu <span className="text-red-500">*</span></label>
                <input type="text" value={formData.brand} onChange={(e) => handleChange("brand", e.target.value)} className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm outline-none focus:border-emerald-500 transition-all" placeholder="VD: Nike, Apple..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Tình trạng</label>
                <select value={formData.condition} onChange={(e) => handleChange("condition", e.target.value)} className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm outline-none focus:border-emerald-500 transition-all">
                  <option value="Like New">Như mới (Like New)</option>
                  <option value="Good">Tốt (Good)</option>
                  <option value="Fair">Khá (Fair)</option>
                  <option value="Old">Cũ (Old)</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    Video mô tả (Tối đa 20MB)
                </label>
                {!videoPreview ? (
                  <div 
                    onClick={() => videoInputRef.current?.click()}
                    className="w-full h-11 px-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 flex items-center gap-2 cursor-pointer hover:border-emerald-500 transition-colors"
                  >
                    <span className="material-symbols-outlined text-gray-400">videocam</span>
                    <span className="text-sm text-gray-500">Tải video lên...</span>
                    <input 
                        type="file" 
                        ref={videoInputRef} 
                        onChange={handleVideoUpload} 
                        className="hidden" 
                        accept="video/mp4,video/webm,video/ogg" 
                    />
                  </div>
                ) : (
                  <div className="relative w-full h-40 bg-black rounded-xl overflow-hidden group">
                    <video 
                        src={videoPreview} 
                        controls 
                        className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={removeVideo}
                      className="absolute top-2 right-2 w-7 h-7 bg-red-500/90 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm z-10"
                      title="Xóa video"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">Giá & Kho hàng</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500">Giá bán (VNĐ) <span className="text-red-500">*</span></label>
                  <input type="number" min={0} value={formData.price} onChange={(e) => handleChange("price", Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white dark:bg-gray-900 focus:border-emerald-500 outline-none text-sm" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500">Giá gốc (VNĐ)</label>
                  <input type="number" min={0} value={formData.originalPrice} onChange={(e) => handleChange("originalPrice", Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white dark:bg-gray-900 focus:border-emerald-500 outline-none text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500">Kho hàng</label>
                  <input type="number" min={0} value={formData.stock} onChange={(e) => handleChange("stock", Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white dark:bg-gray-900 focus:border-emerald-500 outline-none text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500">Cân nặng (g) <span className="text-red-500">*</span></label>
                  <input type="number" min={0} value={formData.weight} onChange={(e) => handleChange("weight", Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white dark:bg-gray-900 focus:border-emerald-500 outline-none text-sm" />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">Địa chỉ bán</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="text" placeholder="Tỉnh / Thành phố" value={formData.location.city} onChange={(e) => handleLocationChange("city", e.target.value)} className="h-10 px-3 rounded-lg border border-gray-200 bg-white dark:bg-gray-900 focus:border-emerald-500 outline-none text-sm" required />
                <input type="text" placeholder="Xã/ Phường" value={formData.location.district} onChange={(e) => handleLocationChange("district", e.target.value)} className="h-10 px-3 rounded-lg border border-gray-200 bg-white dark:bg-gray-900 focus:border-emerald-500 outline-none text-sm" />
                <input type="text" placeholder="Địa chỉ chi tiết" value={formData.location.detail} onChange={(e) => handleLocationChange("detail", e.target.value)} className="h-10 px-3 rounded-lg border border-gray-200 bg-white dark:bg-gray-900 focus:border-emerald-500 outline-none text-sm" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                <h4 className="font-bold text-gray-900 dark:text-white">Thuộc tính sản phẩm</h4>
                <button type="button" onClick={addAttribute} className="text-xs font-bold text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded transition-colors">+ Thêm dòng</button>
              </div>
              <div className="space-y-3">
                {formData.attributes.map((attr, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <input placeholder="Tên (VD: Màu sắc)" value={attr.name} onChange={(e) => updateAttribute(idx, "name", e.target.value)} className="flex-1 h-10 px-3 rounded-lg border border-gray-200 bg-white dark:bg-gray-900 focus:border-emerald-500 outline-none text-sm" />
                    <input placeholder="Giá trị (VD: Đỏ)" value={attr.value} onChange={(e) => updateAttribute(idx, "value", e.target.value)} className="flex-1 h-10 px-3 rounded-lg border border-gray-200 bg-white dark:bg-gray-900 focus:border-emerald-500 outline-none text-sm" />
                    <button type="button" onClick={() => removeAttribute(idx)} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Mô tả sản phẩm <span className="text-red-500">*</span></label>
              <textarea rows={5} value={formData.description} onChange={(e) => handleChange("description", e.target.value)} maxLength={5000} className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm outline-none focus:border-emerald-500 transition-all resize-y" placeholder="Mô tả chi tiết về sản phẩm..." />
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-gray-700 shrink-0 flex gap-4 bg-white dark:bg-gray-800 rounded-b-2xl">
          <button type="button" onClick={onClose} className="flex-1 h-12 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Hủy bỏ</button>
          <button type="submit" form="productForm" className="flex-1 h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20 transition-all">
            {initialData?.id ? "Lưu thay đổi" : "Đăng bán ngay"}
          </button>
        </div>
      </div>
    </div>
  );
}