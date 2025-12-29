type Props = {
  backgroundImage: string;
};

export default function HeroSection({ backgroundImage }: Props) {
  return (
    <section className="w-full max-w-[1280px] px-4 md:px-8 py-6">
      <div
        className="relative w-full overflow-hidden rounded-xl bg-cover bg-center h-[300px] md:h-[400px] flex items-center p-6 md:p-12 shadow-lg group"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url("${backgroundImage}")`,
        }}
      >
        <div className="relative z-10 flex flex-col gap-4 max-w-[600px]">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-3 py-1 w-fit">
            <span className="material-symbols-outlined text-[var(--color-primary)] text-sm">eco</span>
            <span className="text-white text-xs font-bold uppercase tracking-wider">
              Tiết kiệm &amp; Bảo vệ môi trường
            </span>
          </div>

          <h1 className="text-white text-3xl md:text-5xl font-black leading-tight tracking-tight">
            Cũ người mới ta <br />
            <span className="text-[var(--color-primary)]">Săn deal cực đã</span>
          </h1>

          <p className="text-white/90 text-sm md:text-lg font-medium max-w-[480px]">
            Khám phá hàng ngàn món đồ chất lượng với giá cực hời. Đăng bán dễ dàng, mua sắm an toàn.
          </p>

          <div className="flex flex-wrap gap-3 mt-2">
            <button className="h-12 px-6 rounded-lg bg-[var(--color-primary)] text-[var(--text-light)] font-bold text-base hover:brightness-95 transition-all shadow-[0_0_20px_rgba(19,236,91,0.3)]">
              Mua sắm ngay
            </button>
            <button className="h-12 px-6 rounded-lg bg-white/10 backdrop-blur-md text-white font-bold text-base border border-white/30 hover:bg-white/20 transition-all">
              Tìm hiểu thêm
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
