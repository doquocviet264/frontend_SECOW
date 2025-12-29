type TrustItem = {
  icon: string;
  title: string;
  desc: string;
};

const ITEMS: TrustItem[] = [
  { icon: "verified_user", title: "Người bán uy tín", desc: "Xác thực danh tính" },
  { icon: "payments", title: "Thanh toán an toàn", desc: "Giữ tiền đến khi nhận hàng" },
  { icon: "local_shipping", title: "Giao hàng nhanh", desc: "Hỗ trợ vận chuyển toàn quốc" },
  { icon: "support_agent", title: "Hỗ trợ 24/7", desc: "Giải đáp mọi thắc mắc" },
];

export default function TrustIndicators() {
  return (
    <section className="w-full max-w-[1280px] px-4 md:px-8 py-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full bg-white dark:bg-[var(--surface-dark)] rounded-lg p-6 border border-[var(--border-light)] dark:border-[var(--border-dark)] shadow-sm">
        {ITEMS.map((it) => (
          <div key={it.title} className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-[color:rgba(19,236,91,0.1)] flex items-center justify-center text-[var(--color-primary)]">
              <span className="material-symbols-outlined">{it.icon}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold">{it.title}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{it.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
