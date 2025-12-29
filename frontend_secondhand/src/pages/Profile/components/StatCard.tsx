type Props = {
  title: string;
  value: string;
  hint?: string;
  icon: string;
  tone?: "green" | "orange" | "blue";
};

export default function StatCard({ title, value, hint, icon, tone = "green" }: Props) {
  // Định nghĩa màu sắc cho từng tone
  const colorStyles = {
    green: {
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      text: "text-emerald-600 dark:text-emerald-400",
      hint: "text-emerald-600 dark:text-emerald-400",
    },
    orange: {
      bg: "bg-orange-50 dark:bg-orange-500/10",
      text: "text-orange-600 dark:text-orange-400",
      hint: "text-orange-600 dark:text-orange-400",
    },
    blue: {
      bg: "bg-blue-50 dark:bg-blue-500/10",
      text: "text-blue-600 dark:text-blue-400",
      hint: "text-blue-600 dark:text-blue-400",
    },
  };

  const currentStyle = colorStyles[tone];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-gray-700 transition-all hover:-translate-y-1 duration-200">
      <div className="flex justify-between items-start">
        {/* Phần nội dung bên trái */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h4>
          <div className="text-2xl font-black text-gray-900 dark:text-white mt-2 tracking-tight">
            {value}
          </div>
          
          {hint && (
            <div className={`flex items-center gap-1 text-xs font-bold mt-2 ${currentStyle.hint}`}>
              {/* Giả lập icon tăng trưởng nhỏ */}
              <span className="material-symbols-outlined text-[14px] font-bold">trending_up</span>
              <span>{hint}</span>
            </div>
          )}
        </div>

        {/* Phần Icon bên phải */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${currentStyle.bg}`}>
          <span className={`material-symbols-outlined text-[24px] ${currentStyle.text}`}>
            {icon}
          </span>
        </div>
      </div>
    </div>
  );
}