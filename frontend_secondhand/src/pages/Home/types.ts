export type Category = {
  name: string;
  imageUrl: string;
};

export type Product = {
  id?: string;
  title: string;
  imageUrl: string;
  price: string;
  location: string;
  timeAgo: string;
  badge?: string;
};
export type ConditionTag = "Like New" | "Tốt" | "Khá" | "Cũ";

export type ProductCardModel = {
  id: string;
  title: string;
  priceText: string;
  imageUrl: string;
  condition: ConditionTag;
  conditionColor: "primary" | "blue" | "orange" | "gray";
  photosCount?: number;
  sellerName: string;
  sellerAvatarUrl?: string;
  sellerInitial?: string; // fallback
  sellerInitialBg?: string; // tailwind bg-...
  sellerInitialText?: string; // tailwind text-...
  location: string;
  timeAgo: string;
  isLiked?: boolean;
};
