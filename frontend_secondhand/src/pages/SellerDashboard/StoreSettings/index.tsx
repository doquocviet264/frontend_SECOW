import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SellerLayout from "../components/SellerLayout";
import { storeService, type Store } from "@/services/storeService";
import { addressService, type Province, type District, type Ward } from "@/services/addressService";

// --- COMPONENTS ---

const StepHeader = ({ step, title }: { step: string; title: string }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
      {step}
    </div>
    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
  </div>
);

const FormField = ({ label, required, children, note }: any) => (
  <div className="mb-5">
    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {note && <p className="text-xs text-gray-400 mt-1.5">{note}</p>}
  </div>
);

export default function StoreSettingsPage() {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    storeName: "",
    description: "",
    phone: "",
    email: "",
    street: "",
    provinceCode: "",
    districtCode: "",
    wardCode: "",
    logo: "",
    coverImage: "",
  });

  // Address dropdowns
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [loadingStore, setLoadingStore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [loadingLogoUrl, setLoadingLogoUrl] = useState(false);
  const [loadingCoverUrl, setLoadingCoverUrl] = useState(false);

  // File upload refs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Load store data and provinces on mount
  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setLoadingStore(true);
        setError(null);

        // Fetch store data
        const storeResponse = await storeService.getMyStore();
        if (!storeResponse.success || !storeResponse.data?.store) {
          setError("Không tìm thấy thông tin cửa hàng");
          setLoadingStore(false);
          return;
        }

        const store: Store = storeResponse.data.store;

        // Parse address if it exists
        let street = "";
        let provinceCode = "";
        let districtCode = "";
        let wardCode = "";

        if (store.address) {
          // Try to parse address - assuming format might be "street, ward, district, province"
          // Or it might be a simple string
          street = store.address;
        }

        // Set form data
        setFormData({
          storeName: store.storeName || "",
          description: store.description || "",
          phone: store.phone || "",
          email: typeof store.seller === "object" && store.seller?.email ? store.seller.email : "",
          street,
          provinceCode,
          districtCode,
          wardCode,
          logo: store.logo || "",
          coverImage: store.coverImage || "",
        });

        // Load provinces
        const provincesData = await addressService.getProvinces();
        setProvinces(provincesData);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Có lỗi xảy ra khi tải thông tin cửa hàng");
        console.error("Error fetching store:", err);
      } finally {
        setLoadingStore(false);
        setLoadingProvinces(false);
      }
    };

    fetchStoreData();
  }, []);

  // Load districts when province changes
  useEffect(() => {
    if (!formData.provinceCode) {
      setDistricts([]);
      setWards([]);
      return;
    }

    const loadDistricts = async () => {
      try {
        setLoadingDistricts(true);
        const districtsData = await addressService.getDistrictsByProvince(formData.provinceCode);
        setDistricts(districtsData);
      } catch (err) {
        setError("Không thể tải danh sách quận/huyện");
        console.error(err);
      } finally {
        setLoadingDistricts(false);
      }
    };

    loadDistricts();
  }, [formData.provinceCode]);

  // Load wards when district changes
  useEffect(() => {
    if (!formData.districtCode) {
      setWards([]);
      return;
    }

    const loadWards = async () => {
      try {
        setLoadingWards(true);
        const wardsData = await addressService.getWardsByDistrict(formData.districtCode);
        setWards(wardsData);
      } catch (err) {
        setError("Không thể tải danh sách phường/xã");
        console.error(err);
      } finally {
        setLoadingWards(false);
      }
    };

    loadWards();
  }, [formData.districtCode]);

  // Handle file upload
  const handleFileUpload = (type: "logo" | "coverImage", file: File | null) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn file ảnh hợp lệ");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Kích thước file không được vượt quá 5MB");
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData((prev) => ({ ...prev, [type]: base64String }));
    };
    reader.readAsDataURL(file);
  };

  // Handle paste image
  const handlePasteImage = async (type: "logo" | "coverImage", e: React.ClipboardEvent) => {
    e.preventDefault();
    const items = e.clipboardData?.items;
    
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (item.type.indexOf("image") !== -1) {
        const blob = item.getAsFile();
        if (!blob) return;

        const file = new File([blob], `pasted-image-${Date.now()}.png`, {
          type: blob.type || "image/png",
        });

        handleFileUpload(type, file);
        break;
      }
    }
  };

  // Handle load image from URL
  const handleLoadImageFromUrl = async (type: "logo" | "coverImage", url: string) => {
    if (!url.trim()) {
      setError("Vui lòng nhập URL ảnh");
      return;
    }

    try {
      new URL(url);
    } catch {
      setError("URL không hợp lệ");
      return;
    }

    if (type === "logo") {
      setLoadingLogoUrl(true);
    } else {
      setLoadingCoverUrl(true);
    }

    try {
      setError(null);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Không thể tải ảnh từ URL");
      }

      const blob = await response.blob();
      
      if (!blob.type.startsWith("image/")) {
        throw new Error("URL không phải là ảnh hợp lệ");
      }

      if (blob.size > 5 * 1024 * 1024) {
        throw new Error("Kích thước ảnh không được vượt quá 5MB");
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData((prev) => ({ ...prev, [type]: base64String }));
        if (type === "logo") {
          setLogoUrl("");
        } else {
          setCoverImageUrl("");
        }
      };
      reader.readAsDataURL(blob);
    } catch (err: any) {
      setError(err.message || "Không thể tải ảnh từ URL");
    } finally {
      if (type === "logo") {
        setLoadingLogoUrl(false);
      } else {
        setLoadingCoverUrl(false);
      }
    }
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Build address string
    const addressParts = [];
    if (formData.street) addressParts.push(formData.street);
    
    const province = provinces.find(p => p.code === formData.provinceCode);
    const district = districts.find(d => d.code === formData.districtCode);
    const ward = wards.find(w => w.code === formData.wardCode);

    if (ward) addressParts.push(ward.name);
    if (district) addressParts.push(district.name);
    if (province) addressParts.push(province.name);

    const fullAddress = addressParts.join(", ") || formData.street;

    try {
      setLoading(true);

      const updatePayload: any = {
        storeName: formData.storeName,
        description: formData.description,
        phone: formData.phone,
        address: fullAddress,
      };

      if (formData.logo) {
        updatePayload.logo = formData.logo;
      }

      if (formData.coverImage) {
        updatePayload.coverImage = formData.coverImage;
      }

      const response = await storeService.updateStore(updatePayload);

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Có lỗi xảy ra khi cập nhật. Vui lòng thử lại.");
      console.error("Error updating store:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loadingStore) {
    return (
      <SellerLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-gray-400 text-4xl animate-spin">sync</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Đang tải thông tin cửa hàng...</p>
          </div>
        </div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
              Chỉnh sửa thông tin cửa hàng
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Cập nhật thông tin cửa hàng của bạn để khách hàng dễ dàng tìm thấy và liên hệ.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">
                    Cập nhật thông tin cửa hàng thành công!
                  </p>
                </div>
              )}

              {/* Step 1: Thông tin Shop */}
              <div className="mb-10">
                <StepHeader step="1" title="Thông tin Shop" />
                
                <FormField label="Tên shop" required>
                  <input 
                    type="text" 
                    value={formData.storeName}
                    onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                    placeholder="Nhập tên shop của bạn"
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-sm"
                    required
                  />
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-5">
                  <FormField label="Ảnh đại diện shop">
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          ref={logoInputRef}
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload("logo", e.target.files?.[0] || null)}
                        />
                        <div
                          onClick={() => logoInputRef.current?.click()}
                          onPaste={(e) => handlePasteImage("logo", e)}
                          tabIndex={0}
                          className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer text-gray-400 overflow-hidden focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          {formData.logo ? (
                            <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-2xl">add_a_photo</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">
                          <div>Định dạng: .JPEG, .PNG</div>
                          <div>Kích thước tối ưu: 300x300px</div>
                          <div className="text-emerald-600 dark:text-emerald-400 mt-1">Hoặc dán ảnh (Ctrl+V)</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={logoUrl}
                          onChange={(e) => setLogoUrl(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleLoadImageFromUrl("logo", logoUrl);
                            }
                          }}
                          placeholder="Hoặc dán URL ảnh..."
                          className="flex-1 h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => handleLoadImageFromUrl("logo", logoUrl)}
                          disabled={loadingLogoUrl || !logoUrl.trim()}
                          className="px-4 h-9 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                        >
                          {loadingLogoUrl ? (
                            <>
                              <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                              <span>Đang tải...</span>
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-sm">download</span>
                              <span>Tải</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </FormField>

                  <FormField label="Ảnh bìa shop (Tùy chọn)">
                    <div className="space-y-3">
                      <input
                        type="file"
                        ref={coverInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload("coverImage", e.target.files?.[0] || null)}
                      />
                      <div
                        onClick={() => coverInputRef.current?.click()}
                        onPaste={(e) => handlePasteImage("coverImage", e)}
                        tabIndex={0}
                        className="w-full h-24 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer text-gray-400 gap-1 overflow-hidden focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {formData.coverImage ? (
                          <img src={formData.coverImage} alt="Cover" className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-2xl">image</span>
                            <span className="text-xs">Tải ảnh bìa hoặc dán ảnh (Ctrl+V)</span>
                          </>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={coverImageUrl}
                          onChange={(e) => setCoverImageUrl(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleLoadImageFromUrl("coverImage", coverImageUrl);
                            }
                          }}
                          placeholder="Hoặc dán URL ảnh..."
                          className="flex-1 h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => handleLoadImageFromUrl("coverImage", coverImageUrl)}
                          disabled={loadingCoverUrl || !coverImageUrl.trim()}
                          className="px-4 h-9 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                        >
                          {loadingCoverUrl ? (
                            <>
                              <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                              <span>Đang tải...</span>
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-sm">download</span>
                              <span>Tải</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </FormField>
                </div>

                <FormField label="Mô tả shop">
                  <textarea 
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Giới thiệu ngắn gọn về shop của bạn, sản phẩm bạn bán..."
                    className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-sm resize-none"
                  />
                </FormField>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-700 my-8"></div>

              {/* Step 2: Thông tin liên hệ */}
              <div className="mb-10">
                <StepHeader step="2" title="Thông tin liên hệ" />
                
                <FormField label="Số điện thoại" required>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">call</span>
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Nhập số điện thoại"
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-emerald-500 outline-none text-sm"
                      required
                    />
                  </div>
                </FormField>

                <FormField label="Email">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">mail</span>
                    <input 
                      type="email" 
                      value={formData.email}
                      disabled
                      className="w-full h-11 pl-10 pr-24 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed outline-none text-sm"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 pointer-events-none">*Không thể thay đổi</span>
                  </div>
                </FormField>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-700 my-8"></div>

              {/* Step 3: Địa chỉ */}
              <div className="mb-8">
                <StepHeader step="3" title="Địa chỉ" />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                  <FormField label="Tỉnh / Thành phố" required>
                    <select
                      value={formData.provinceCode}
                      onChange={(e) => setFormData({ ...formData, provinceCode: e.target.value, districtCode: "", wardCode: "" })}
                      disabled={loadingProvinces}
                      className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      required
                    >
                      <option value="">{loadingProvinces ? "Đang tải..." : "Chọn Tỉnh/Thành"}</option>
                      {provinces.map((province) => (
                        <option key={province.code} value={province.code}>
                          {province.name}
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Quận / Huyện" required>
                    <select
                      value={formData.districtCode}
                      onChange={(e) => setFormData({ ...formData, districtCode: e.target.value, wardCode: "" })}
                      disabled={!formData.provinceCode || loadingDistricts}
                      className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      required
                    >
                      <option value="">
                        {!formData.provinceCode
                          ? "Chọn tỉnh trước"
                          : loadingDistricts
                          ? "Đang tải..."
                          : "Chọn Quận/Huyện"}
                      </option>
                      {districts.map((district) => (
                        <option key={district.code} value={district.code}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Phường / Xã" required>
                    <select
                      value={formData.wardCode}
                      onChange={(e) => setFormData({ ...formData, wardCode: e.target.value })}
                      disabled={!formData.districtCode || loadingWards}
                      className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      required
                    >
                      <option value="">
                        {!formData.districtCode
                          ? "Chọn quận trước"
                          : loadingWards
                          ? "Đang tải..."
                          : "Chọn Phường/Xã"}
                      </option>
                      {wards.map((ward) => (
                        <option key={ward.code} value={ward.code}>
                          {ward.name}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>

                <FormField label="Địa chỉ chi tiết" required>
                  <input 
                    type="text" 
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    placeholder="Số nhà, tên đường, tòa nhà..."
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-emerald-500 outline-none text-sm"
                    required
                  />
                </FormField>
              </div>

              {/* Footer Actions */}
              <div className="border-t border-gray-100 dark:border-gray-700 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-gray-500 text-center sm:text-left">
                  Thông tin cửa hàng sẽ được cập nhật ngay sau khi bạn lưu.
                </div>
                
                <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => navigate("/seller/dashboard")}
                    disabled={loading}
                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 font-bold text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Đang lưu..." : "Lưu thay đổi"}
                    {!loading && <span className="material-symbols-outlined text-[18px]">check</span>}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}

