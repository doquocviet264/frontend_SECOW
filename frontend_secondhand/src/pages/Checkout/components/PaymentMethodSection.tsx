import type { PaymentMethod } from "../types";

type Props = {
  value: PaymentMethod;
  onChange: (m: PaymentMethod) => void;
};

function OptionCard({
  checked,
  icon,
  title,
  onClick,
}: {
  checked: boolean;
  icon: string;
  title: string;
  onClick: () => void;
}) {
  return (
    <label className="cursor-pointer relative">
      <input className="peer sr-only" type="radio" checked={checked} onChange={onClick} />
      <div
        className={[
          "h-full flex flex-col items-center justify-center p-4 rounded-lg bg-white dark:bg-surface-dark/50 transition-all",
          " hover:bg-gray-50 dark:hover:bg-surface-dark",
          checked ? "bg-primary/5" : "",
        ].join(" ")}
      >
        <span
          className={[
            "material-symbols-outlined text-3xl mb-2",
            checked ? "text-primary" : "text-text-muted",
          ].join(" ")}
        >
          {icon}
        </span>
        <span className="text-sm font-bold text-center">{title}</span>
      </div>

      {checked ? (
        <div className="absolute top-2 right-2 text-primary">
          <span className="material-symbols-outlined text-lg">check_circle</span>
        </div>
      ) : null}
    </label>
  );
}

export default function PaymentMethodSection({ value, onChange }: Props) {
  return (
    <section className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-text-main text-primary text-xs font-black">
          3
        </span>
        Phương thức thanh toán
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <OptionCard
          checked={value === "cod"}
          icon="payments"
          title="Thanh toán khi nhận hàng (COD)"
          onClick={() => onChange("cod")}
        />
        <OptionCard
          checked={value === "bank"}
          icon="account_balance"
          title="Chuyển khoản ngân hàng"
          onClick={() => onChange("bank")}
        />
        <OptionCard
          checked={value === "wallet"}
          icon="account_balance_wallet"
          title="Ví điện tử MoMo / ZaloPay"
          onClick={() => onChange("wallet")}
        />
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-800 flex gap-3 items-start">
        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-lg mt-0.5">
          info
        </span>
        <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
          Với phương thức COD, bạn chỉ thanh toán khi đã nhận và kiểm tra hàng. 2HandMarket giữ tiền của người bán trong 3 ngày để đảm bảo quyền lợi của bạn.
        </p>
      </div>
    </section>
  );
}
