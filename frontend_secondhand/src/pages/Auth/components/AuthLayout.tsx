import React from "react";

type Props = {
  children: React.ReactNode;
  title: string;
  subtitle: string;
};

export default function AuthLayout({ children, title, subtitle }: Props) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* --- LEFT COLUMN: IMAGE & BRANDING --- */}
        <div className="relative w-full md:w-5/12 hidden md:block">
          {/* Background Image */}
          <img 
            src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800" 
            alt="SecondLife Background" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/40"></div>

          {/* Content Overlay */}
          <div className="absolute inset-0 p-10 flex flex-col justify-between text-white z-10">
            {/* Top Badge */}
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold border border-white/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                CỘNG ĐỒNG XANH
              </span>
            </div>

            {/* Bottom Text */}
            <div>
              <h2 className="text-3xl font-black leading-tight mb-4">
                Trao cơ hội mới cho đồ cũ
              </h2>
              <p className="text-white/80 text-sm leading-relaxed mb-8">
                Tham gia cùng hơn 2 triệu người dùng tại SecondLife. Mua bán, trao đổi và góp phần bảo vệ môi trường ngay hôm nay.
              </p>

              {/* Social Proof Avatars */}
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-9 h-9 rounded-full border-2 border-white/50 overflow-hidden bg-gray-300">
                      <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <span className="text-xs font-bold text-white">+2k thành viên mới tuần này</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: FORM CONTAINER --- */}
        <div className="w-full md:w-7/12 p-8 sm:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{title}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">{subtitle}</p>
            {children}
          </div>
        </div>

      </div>
    </div>
  );
}
