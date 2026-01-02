import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { storeService } from "@/services/storeService";
import { addressService, type Province, type District, type Ward } from "@/services/addressService";
import { authService } from "@/services/authService";
// --- TYPES & DATA ---
type BenefitItem = {
  icon: string;
  title: string;
  desc: string;
};

const BENEFITS: BenefitItem[] = [
  {
    icon: "publish",
    title: "Đăng bán dễ dàng",
    desc: "Đăng sản phẩm nhanh chóng với công cụ tối ưu hình ảnh và nội dung.",
  },
  {
    icon: "inventory_2",
    title: "Quản lý đơn hàng",
    desc: "Theo dõi trạng thái đơn hàng, vận chuyển và thanh toán tập trung.",
  },
  {
    icon: "chat",
    title: "Chat với người mua",
    desc: "Tương tác trực tiếp, thương lượng giá cả và chốt đơn nhanh chóng.",
  },
  {
    icon: "monitoring",
    title: "Theo dõi doanh thu",
    desc: "Báo cáo hiệu suất chi tiết giúp bạn tối ưu hóa việc kinh doanh.",
  },
];

// --- COMPONENTS CON ---

// 1. Tiêu đề từng bước (Step Header)
const StepHeader = ({ step, title }: { step: string; title: string }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
      {step}
    </div>
    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
  </div>
);

// 2. Input Field Wrapper
const FormField = ({ label, required, children, note }: any) => (
  <div className="mb-5">
    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {note && <p className="text-xs text-gray-400 mt-1.5">{note}</p>}
  </div>
);

// --- MAIN PAGE ---

export default function BecomeSellerPage() {
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
  const [scope, setScope] = useState<"nationwide" | "local">("nationwide");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // File upload refs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Load user info and provinces on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load user info
        const userResponse = await authService.getMe();
        if (userResponse.success && userResponse.data?.user) {
          const user = userResponse.data.user as any;
          setFormData((prev) => ({
            ...prev,
            email: user.email || "",
            phone: user.phone || "",
          }));
        }

        // Load provinces
        setLoadingProvinces(true);
        const provincesData = await addressService.getProvinces();
        setProvinces(provincesData);
      } catch (err: any) {
        setError("Không thể tải dữ liệu. Vui lòng thử lại.");
        console.error(err);
      } finally {
        setLoadingProvinces(false);
      }
    };

    loadData();
  }, []);

  // Load districts when province changes
  useEffect(() => {
    if (!formData.provinceCode) {
      setDistricts([]);
      setWards([]);
      setFormData((prev) => ({ ...prev, districtCode: "", wardCode: "" }));
      return;
    }

    const loadDistricts = async () => {
      try {
        setLoadingDistricts(true);
        const data = await addressService.getDistrictsByProvince(formData.provinceCode);
        setDistricts(data);
        setWards([]);
        setFormData((prev) => ({ ...prev, districtCode: "", wardCode: "" }));
      } catch (err: any) {
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
      setFormData((prev) => ({ ...prev, wardCode: "" }));
      return;
    }

    const loadWards = async () => {
      try {
        setLoadingWards(true);
        const data = await addressService.getWardsByDistrict(formData.districtCode);
        setWards(data);
        setFormData((prev) => ({ ...prev, wardCode: "" }));
      } catch (err: any) {
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

    // Convert to base64 (for now, in production should upload to cloud storage)
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData((prev) => ({ ...prev, [type]: base64String }));
    };
    reader.readAsDataURL(file);
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.storeName.trim()) {
      setError("Vui lòng nhập tên shop");
      return;
    }

    if (!formData.phone.trim()) {
      setError("Vui lòng nhập số điện thoại");
      return;
    }

    if (!/^[0-9]{10,11}$/.test(formData.phone)) {
      setError("Số điện thoại không hợp lệ");
      return;
    }

    if (!formData.email.trim()) {
      setError("Vui lòng nhập email");
      return;
    }

    if (!formData.street.trim()) {
      setError("Vui lòng nhập địa chỉ chi tiết");
      return;
    }

    if (!formData.provinceCode) {
      setError("Vui lòng chọn tỉnh/thành phố");
      return;
    }

    if (!formData.districtCode) {
      setError("Vui lòng chọn quận/huyện");
      return;
    }

    if (!formData.wardCode) {
      setError("Vui lòng chọn phường/xã");
      return;
    }

    try {
      setLoading(true);

      // Build full address
      const selectedProvince = provinces.find((p) => p.code === formData.provinceCode);
      const selectedDistrict = districts.find((d) => d.code === formData.districtCode);
      const selectedWard = wards.find((w) => w.code === formData.wardCode);

      const fullAddress = [
        formData.street,
        selectedWard?.name,
        selectedDistrict?.name,
        selectedProvince?.name,
      ]
        .filter(Boolean)
        .join(", ");

      // Submit registration
      const response = await storeService.registerStore({
        storeName: formData.storeName,
        description: formData.description || undefined,
        address: fullAddress,
        phone: formData.phone,
        email: formData.email,
        logo: formData.logo || undefined,
        coverImage: formData.coverImage || undefined,
      });

      if (response.success) {
        setSuccess(true);
        // Không redirect vì cần chờ admin duyệt
        // setTimeout(() => {
        //   navigate("/profile");
        // }, 3000);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.");
      console.error("Error registering store:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
            Đăng ký trở thành người bán
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl">
            Biến những món đồ cũ thành cơ hội kinh doanh mới. Hoàn tất thông tin bên dưới để mở cửa hàng của bạn ngay hôm nay.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* === LEFT COLUMN: BENEFITS & SUPPORT === */}
          <div className="lg:col-span-4 space-y-6">
            {/* Benefits Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-emerald-500 filled">verified</span>
                <h3 className="font-bold text-gray-900 dark:text-white">Quyền lợi người bán</h3>
              </div>

              <div className="space-y-6">
                {BENEFITS.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-gray-600 dark:text-gray-300 text-[20px]">
                        {item.icon}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Support Box */}
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-800/30">
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">Cần hỗ trợ?</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn trong quá trình đăng ký.
              </p>
              <button className="flex items-center gap-1 text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:underline">
                Liên hệ ngay 
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* === RIGHT COLUMN: REGISTRATION FORM === */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
              
              {success ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-emerald-500 text-4xl">check_circle</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Đăng ký thành công!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Đơn đăng ký của bạn đã được gửi. Vui lòng chờ admin phê duyệt.
                  </p>
                  <p className="text-sm text-amber-600 dark:text-amber-400 mb-6">
                    Bạn sẽ nhận được thông báo khi đơn đăng ký được phê duyệt.
                  </p>
                  <button
                    onClick={() => navigate("/profile")}
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all"
                  >
                    Về trang cá nhân
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                  )}

                  {/* --- Step 1: Thông tin Shop --- */}
                  <div className="mb-10">
                    <StepHeader step="1" title="Thông tin Shop" />
                    
                    <FormField label="Tên shop" required>
                      <input 
                        type="text" 
                        value={formData.storeName}
                        onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                        placeholder="Nhập tên shop của bạn (VD: Tiệm Đồ Cũ Sài Gòn)"
                        className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-sm"
                        required
                      />
                    </FormField>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-5">
                      <FormField label="Ảnh đại diện shop">
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
                            className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer text-gray-400 overflow-hidden"
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
                          </div>
                        </div>
                      </FormField>

                      <FormField label="Ảnh bìa shop (Tùy chọn)">
                        <input
                          type="file"
                          ref={coverInputRef}
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload("coverImage", e.target.files?.[0] || null)}
                        />
                        <div
                          onClick={() => coverInputRef.current?.click()}
                          className="w-full h-24 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer text-gray-400 gap-1 overflow-hidden"
                        >
                          {formData.coverImage ? (
                            <img src={formData.coverImage} alt="Cover" className="w-full h-full object-cover" />
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-2xl">image</span>
                              <span className="text-xs">Tải ảnh bìa</span>
                            </>
                          )}
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

                  {/* --- Step 2: Thông tin liên hệ --- */}
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

                    <FormField label="Email (Đăng nhập)" required>
                       <div className="relative">
                          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">mail</span>
                          <input 
                            type="email" 
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            disabled
                            className="w-full h-11 pl-10 pr-24 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed outline-none text-sm"
                            required
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 pointer-events-none">*Không thể thay đổi</span>
                        </div>
                    </FormField>
                  </div>

              <div className="border-t border-gray-100 dark:border-gray-700 my-8"></div>

                  {/* --- Step 3: Địa chỉ & Khu vực --- */}
                  <div className="mb-8">
                    <StepHeader step="3" title="Địa chỉ & Khu vực" />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                       <FormField label="Tỉnh / Thành phố" required>
                          <select
                            value={formData.provinceCode}
                            onChange={(e) => setFormData({ ...formData, provinceCode: e.target.value })}
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
                            onChange={(e) => setFormData({ ...formData, districtCode: e.target.value })}
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

                {/* Checkbox */}
                <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 mb-6">
                  <input type="checkbox" id="diffAddress" className="mt-1 w-4 h-4 text-emerald-500 rounded border-gray-300 focus:ring-emerald-500" />
                  <label htmlFor="diffAddress" className="text-sm cursor-pointer select-none">
                     <span className="font-bold text-gray-900 dark:text-white block mb-0.5">Địa chỉ lấy hàng khác với địa chỉ shop?</span>
                     <span className="text-gray-500 dark:text-gray-400 text-xs">Chọn nếu bạn có kho hàng hoặc địa điểm lấy hàng riêng biệt.</span>
                  </label>
                </div>

                {/* Radio Cards: Scope */}
                <div className="space-y-3">
                   <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Phạm vi bán hàng</label>
                   
                   <div 
                      onClick={() => setScope("nationwide")}
                      className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${scope === 'nationwide' ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-500' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-emerald-300'}`}
                   >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${scope === 'nationwide' ? 'border-emerald-500' : 'border-gray-300'}`}>
                         {scope === 'nationwide' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                      </div>
                      <div>
                         <div className="text-sm font-bold text-gray-900 dark:text-white">Toàn quốc</div>
                         <div className="text-xs text-gray-500">Sẵn sàng giao hàng đến mọi tỉnh thành</div>
                      </div>
                   </div>

                   <div 
                      onClick={() => setScope("local")}
                      className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${scope === 'local' ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-500' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-emerald-300'}`}
                   >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${scope === 'local' ? 'border-emerald-500' : 'border-gray-300'}`}>
                         {scope === 'local' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                      </div>
                      <div>
                         <div className="text-sm font-bold text-gray-900 dark:text-white">Khu vực ưu tiên (Nội thành)</div>
                         <div className="text-xs text-gray-500">Chỉ bán và giao hàng trong khu vực lân cận</div>
                      </div>
                   </div>
                </div>
              </div>

                  {/* --- Footer Actions --- */}
                  <div className="border-t border-gray-100 dark:border-gray-700 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                     <div className="text-xs text-gray-500 text-center sm:text-left">
                        Bằng cách đăng ký, bạn đồng ý với <a href="#" className="font-bold underline text-gray-900 dark:text-white">Điều khoản & Chính sách</a> của chúng tôi.
                     </div>
                     
                     <div className="flex gap-3 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => navigate(-1)}
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
                           {loading ? "Đang xử lý..." : "Đăng ký Shop"}
                           {!loading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
                        </button>
                     </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </PageLayout>
  );
}