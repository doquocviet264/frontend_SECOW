export type WishlistItem = {
  id: string;
  name: string;
  brand: string; // VD: Levi's, Sony, Canon
  category: string; // VD: Áo khoác, Điện tử
  price: number;
  originalPrice?: number;
  imageUrl: string;
  badge?: {
    text: string;
    color: "green" | "orange" | "blue"; // Màu badge
  };
  isSoldOut?: boolean; // Trạng thái đã bán
};