import React, { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
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
  // State giả lập cho Radio "Phạm vi bán hàng"
  const [scope, setScope] = useState<"nationwide" | "local">("nationwide");

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
              
              {/* --- Step 1: Thông tin Shop --- */}
              <div className="mb-10">
                <StepHeader step="1" title="Thông tin Shop" />
                
                <FormField label="Tên shop" required>
                  <input 
                    type="text" 
                    placeholder="Nhập tên shop của bạn (VD: Tiệm Đồ Cũ Sài Gòn)"
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-sm"
                  />
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-5">
                  <FormField label="Ảnh đại diện shop">
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer text-gray-400">
                        <span className="material-symbols-outlined text-2xl">add_a_photo</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        <div>Định dạng: .JPEG, .PNG</div>
                        <div>Kích thước tối ưu: 300x300px</div>
                      </div>
                    </div>
                  </FormField>

                  <FormField label="Ảnh bìa shop (Tùy chọn)">
                    <div className="w-full h-24 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer text-gray-400 gap-1">
                       <span className="material-symbols-outlined text-2xl">image</span>
                       <span className="text-xs">Tải ảnh bìa</span>
                    </div>
                  </FormField>
                </div>

                <FormField label="Mô tả shop">
                   <textarea 
                     rows={3}
                     placeholder="Giới thiệu ngắn gọn về shop của bạn, sản phẩm bạn bán..."
                     className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-sm resize-none"
                   />
                </FormField>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-700 my-8"></div>

              {/* --- Step 2: Thông tin liên hệ --- */}
              <div className="mb-10">
                <StepHeader step="2" title="Thông tin liên hệ" />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Họ và tên người đại diện" required>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">person</span>
                      <input 
                        type="text" 
                        defaultValue="Nguyễn Văn A"
                        className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-emerald-500 outline-none text-sm"
                      />
                    </div>
                  </FormField>

                  <FormField label="Số điện thoại" required>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">call</span>
                      <input 
                        type="text" 
                        defaultValue="0901234567"
                        className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-emerald-500 outline-none text-sm"
                      />
                    </div>
                  </FormField>
                </div>

                <FormField label="Email (Đăng nhập)">
                   <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">mail</span>
                      <input 
                        type="text" 
                        defaultValue="nguyenvana@gmail.com"
                        disabled
                        className="w-full h-11 pl-10 pr-24 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed outline-none text-sm"
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
                      <select className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm outline-none focus:border-emerald-500">
                         <option>Chọn Tỉnh/Thành</option>
                      </select>
                   </FormField>
                   <FormField label="Quận / Huyện" required>
                      <select className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm outline-none focus:border-emerald-500">
                         <option>Chọn Quận/Huyện</option>
                      </select>
                   </FormField>
                   <FormField label="Phường / Xã" required>
                      <select className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm outline-none focus:border-emerald-500">
                         <option>Chọn Phường/Xã</option>
                      </select>
                   </FormField>
                </div>

                <FormField label="Địa chỉ chi tiết" required>
                  <input 
                    type="text" 
                    placeholder="Số nhà, tên đường, tòa nhà..."
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-emerald-500 outline-none text-sm"
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
                    <button className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 font-bold text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                       Hủy bỏ
                    </button>
                    <button className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2">
                       Đăng ký Shop
                       <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                 </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
    </PageLayout>
  );
}