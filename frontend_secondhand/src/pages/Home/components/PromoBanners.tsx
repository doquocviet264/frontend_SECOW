type Banner = {
  title: string;
  desc: string;
  cta: string;
  imageUrl: string;
};

type Props = {
  items: Banner[];
};

export default function PromoBanners({ items }: Props) {
  return (
    <section className="w-full max-w-[1280px] px-4 md:px-8 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((b) => (
          <div key={b.title} className="rounded-xl overflow-hidden relative h-48 md:h-60 group cursor-pointer">
            <div className="absolute inset-0 bg-black/40 z-10 transition-colors group-hover:bg-black/30" />
            <img className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={b.imageUrl} alt={b.title} />
            <div className="relative z-20 h-full flex flex-col justify-center p-8">
              <h3 className="text-white text-2xl font-bold mb-2">{b.title}</h3>
              <p className="text-white/90 text-sm mb-4">{b.desc}</p>
              <button className="w-fit px-4 py-2 bg-white text-black text-sm font-bold rounded hover:bg-[var(--color-primary)] hover:text-white transition-colors">
                {b.cta}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
