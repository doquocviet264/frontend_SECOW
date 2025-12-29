import { useState } from "react";
import SellerSidebar from "./components/SellerSidebar";
import ShopBanner from "./components/ShopBanner";
import ShopProductGrid from "./components/ShopProductGrid";
import type { ShopProfile, ProductItem } from "./types";
import PageLayout from "@/components/layout/PageLayout";
// --- MOCK DATA ---
const MOCK_SHOP: ShopProfile = {
  id: "S123",
  name: "Minh's Vintage Shop",
  avatarUrl: "https://i.pravatar.cc/300?u=minhvintage",
  location: "TP. Hồ Chí Minh",
  isTrusted: true,
  bannerUrl: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=2070&auto=format&fit=crop",
  description: "Mỗi món đồ đều có câu chuyện riêng. Cam kết hàng chính hãng, độ mới cao và đã được giặt ủi thơm tho.",
  stats: {
    rating: 4.9,
    reviewCount: 120,
    soldCount: 500,
    responseRate: 98,
    responseTime: "Trong 1h",
    joinedDate: "Tháng 8, 2021",
    followerCount: 2400
  }
};

const MOCK_PRODUCTS: ProductItem[] = [
  {
    id: "1",
    title: "Áo khoác Denim Levi's Trucker Type III",
    price: 450000,
    originalPrice: 600000,
    imageUrl: "https://images.unsplash.com/photo-1605908502724-9093a79a1b39?auto=format&fit=crop&q=80&w=300",
    badge: "95% NEW",
    condition: "2 giờ trước",
    postedTime: "Size M"
  },
  {
    id: "2",
    title: "Giày Nike Air Force 1 White Size 42",
    price: 850000,
    imageUrl: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=300",
    badge: "LIKE NEW",
    condition: "5 giờ trước",
    postedTime: "Size 42"
  },
  {
    id: "3",
    title: "Áo Sơ mi Vintage Họa tiết 90s",
    price: 180000,
    imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=300",
    badge: "GOOD",
    condition: "1 ngày trước",
    postedTime: "Unisex"
  },
  {
    id: "4",
    title: "Túi Tote Canvas Minimalist",
    price: 90000,
    imageUrl: "https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?auto=format&fit=crop&q=80&w=300",
    condition: "2 ngày trước",
    postedTime: "Handmade"
  },
  {
    id: "5",
    title: "Máy ảnh Film Canon AE-1 + Lens 50mm",
    price: 3200000,
    imageUrl: "https://images.unsplash.com/photo-1626544827763-d516dce335ca?auto=format&fit=crop&q=80&w=300",
    badge: "AUTH",
    condition: "3 ngày trước",
    postedTime: "Hoạt động tốt"
  },
  {
    id: "6",
    title: "Áo Flannel Uniqlo Caro Đỏ Đen",
    price: 220000,
    imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=300",
    condition: "4 ngày trước",
    postedTime: "Size L"
  },
  {
    id: "7",
    title: "Giày Vans Old Skool Black",
    price: 550000,
    imageUrl: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=300",
    condition: "1 tuần trước",
    postedTime: "Cond 90%"
  },
  {
    id: "8",
    title: "Áo Len Cổ Lọ Hàn Quốc",
    price: 150000,
    imageUrl: "https://images.unsplash.com/photo-1620799140408-ed5341cd2431?auto=format&fit=crop&q=80&w=300",
    status: "sold",
    condition: "Đã bán 2 ngày trước",
    postedTime: "Freesize"
  }
];

export default function SellerProfilePage() {
  return (
    <PageLayout>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Sidebar (1 column) */}
        <div className="lg:col-span-1">
          <SellerSidebar shop={MOCK_SHOP} />
        </div>

        {/* Main Content (3 columns) */}
        <div className="lg:col-span-3">
          <ShopBanner 
            bannerUrl={MOCK_SHOP.bannerUrl} 
            description={MOCK_SHOP.description}
          />
          <ShopProductGrid products={MOCK_PRODUCTS} />
        </div>
        
      </div>
    </div>
    </PageLayout>
  );
}