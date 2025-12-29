type Props = {
  count: number;
};

export default function CartHeader({ count }: Props) {
  return (
    <div className="flex flex-wrap justify-between gap-3 pb-6 border-b border-[#e7f3eb] dark:border-white/10 mb-6">
      <div className="flex min-w-72 flex-col gap-2">
        <h1 className="text-text-main dark:text-white tracking-tight text-3xl font-bold leading-tight">
          Giỏ hàng <span className="text-primary">({count})</span>
        </h1>
        <p className="text-text-secondary dark:text-slate-400 text-sm font-normal leading-normal">
          Kiểm tra lại các món đồ second-hand cực chất bạn đã chọn.
        </p>
      </div>
    </div>
  );
}
