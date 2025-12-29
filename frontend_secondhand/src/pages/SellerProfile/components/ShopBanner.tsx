import type { ShopProfile } from "../types";

type Props = {
  bannerUrl: string;
  description: string;
};

export default function ShopBanner({ bannerUrl, description }: Props) {
  return (
    <div className="relative w-full h-48 sm:h-64 rounded-3xl overflow-hidden mb-8 group">
      {/* Background Image */}
      <img 
        src={bannerUrl} 
        alt="Shop Banner" 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
      />
      
      {/* Gradient Overlay & Text */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6 sm:p-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Chuyên đồ Vintage & Secondhand tuyển chọn
        </h2>
        <p className="text-white/80 text-sm max-w-2xl leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}