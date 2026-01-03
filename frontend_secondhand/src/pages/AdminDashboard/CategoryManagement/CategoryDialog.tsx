import React, { useEffect, useState, useRef } from "react";
import { categoryService } from "@/services/categoryService";
import type { Category } from "@/types/product";

export type CategoryFormData = {
  id?: string;
  name: string;
  image: string | File | null;
  isActive: boolean;
  parentId: string | null;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormData) => void;
  initialData?: Category | null;
};

export default function CategoryDialog({ isOpen, onClose, onSubmit, initialData }: Props) {
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [parentId, setParentId] = useState<string | null>(null);
  
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchParents = async () => {
        try {
          const res = await categoryService.getParentCategories();
          console.log(res);
          if (res.success && res.data) {
             const validParents = initialData 
                ? res.data.filter((c: Category) => c._id !== initialData._id)
                : res.data;
             
             setParentCategories(validParents);
          }
        } catch (error) {
          console.error(error);
        }
      };
      fetchParents();
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setIsActive(initialData.isActive ?? true);
        setParentId(initialData.parentId || null);
        
        if (typeof initialData.image === 'string') {
            setPreviewImage(initialData.image);
        } else if ((initialData.image as any) instanceof File) {
          setPreviewImage(URL.createObjectURL(initialData.image as any));
        }
      } else {
        setName("");
        setIsActive(true);
        setParentId(null);
        setPreviewImage(null);
        setSelectedFile(null);
        setImageUrl("");
      }
    }
  }, [isOpen, initialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImageUrl(""); // Clear URL when file is selected
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    if (url && isValidUrl(url)) {
      setPreviewImage(url);
      setSelectedFile(null); // Clear file when URL is entered
    } else if (!url) {
      setPreviewImage(null);
    }
  };

  const isValidUrl = (string: string) => {
    try {
      const url = new URL(string);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Priority: selectedFile > imageUrl > previewImage
    const imageData = selectedFile || imageUrl || previewImage || "";
    onSubmit({
      id: initialData?._id,
      name,
      image: imageData,
      isActive,
      parentId
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl transform transition-all scale-100 max-h-[90vh] overflow-y-auto">
        
        <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {initialData ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
          </h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
              Hình ảnh <span className="text-red-500">*</span>
            </label>
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative w-full h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden group
                ${previewImage 
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10" 
                  : "border-gray-300 dark:border-gray-600 hover:border-emerald-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                }
              `}
            >
              {previewImage ? (
                <>
                  <img src={previewImage} alt="Preview" className="w-full h-full object-contain p-2" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <span className="text-white font-bold text-sm">Nhấn để thay đổi</span>
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2 text-gray-400">
                    <span className="material-symbols-outlined">add_photo_alternate</span>
                  </div>
                  <p className="text-sm text-gray-500 font-medium">Tải ảnh lên</p>
                  <p className="text-[10px] text-gray-400 mt-1">SVG, PNG, JPG (Max 2MB)</p>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                className="hidden" 
                accept="image/*"
              />
            </div>

            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <span className="material-symbols-outlined text-[18px]">link</span>
              </div>
              <input
                type="text"
                value={imageUrl}
                onChange={handleImageUrlChange}
                placeholder="Hoặc dán URL hình ảnh..."
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>
            {imageUrl && !isValidUrl(imageUrl) && (
              <p className="text-xs text-red-500">URL không hợp lệ</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
              Tên danh mục <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên danh mục (VD: Thời trang)" 
              className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              required
            />
          </div>


          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Danh mục cha
            </label>
            <div className="relative">
              <select
                value={parentId || ""}
                onChange={(e) => setParentId(e.target.value || null)}
                className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer"
              >
                <option value="">-- Là danh mục gốc (Không có cha) --</option>
                
                {parentCategories.map((parent) => (
                  <option key={parent._id} value={parent._id}>
                    {parent.name}
                  </option>
                ))}
              </select>
              
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <span className="material-symbols-outlined text-[20px]">expand_more</span>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Để trống nếu đây là danh mục lớn.
            </p>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700">
            <div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">Trạng thái hoạt động</div>
              <div className="text-xs text-gray-500">Hiển thị danh mục này trên ứng dụng</div>
            </div>
            
            <button 
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Hủy bỏ
            </button>
            <button 
              type="submit"
              disabled={!name || (!previewImage && !initialData)}
              className="flex-1 h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {initialData ? "Lưu thay đổi" : "Tạo mới"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}