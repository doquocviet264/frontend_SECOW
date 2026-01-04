import { useMemo, useState } from "react";

type Props = {
  images: string[];
};

export default function ProductGallery({ images }: Props) {
  const safeImages = useMemo(() => (images?.length ? images : ["https://placehold.co/1200x900"]), [images]);
  const [active, setActive] = useState(0);

  const activeUrl = safeImages[Math.min(active, safeImages.length - 1)];

  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-full max-w-md mx-auto aspect-[3/2] rounded-xl overflow-hidden border border-border-color dark:border-white/10 bg-surface-light dark:bg-surface-dark group">
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold">
            {safeImages.length} ảnh
          </span>
        </div>

        <img
          src={activeUrl}
          alt="product"
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 max-w-md mx-auto">
        {safeImages.slice(0, 5).map((url, idx) => (
          <button
            key={url}
            type="button"
            onClick={() => setActive(idx)}
            className={[
              "relative aspect-square rounded-lg overflow-hidden border transition-all",
              idx === active ? "border-primary ring-2 ring-primary" : "border-transparent hover:border-primary/50",
            ].join(" ")}
            aria-label={`thumbnail-${idx + 1}`}
          >
            <img src={url} alt={`thumb-${idx + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
