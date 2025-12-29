import WishlistHeader from "./components/WishlistHeader";
import WishlistToolbar from "./components/WishlistToolbar";
import WishlistItemCard from "./components/WishlistItem";
import type { WishlistItem } from "./types";
import PageLayout from "@/components/layout/PageLayout";
const MOCK_WISHLIST: WishlistItem[] = [
  {
    id: "1",
    name: "Vintage Denim Jacket - Size M",
    brand: "Levi's",
    category: "Áo khoác",
    price: 250000,
    originalPrice: 350000,
    imageUrl: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&q=80&w=400",
    badge: { text: "Mới 90%", color: "green" }
  },
  {
    id: "2",
    name: "Sony Walkman 1990",
    brand: "Sony",
    category: "Điện tử",
    price: 500000,
    imageUrl: "https://images.unsplash.com/photo-1622340792366-d476685da010?auto=format&fit=crop&q=80&w=400", // Thay ảnh minh họa radio/cassette
    badge: { text: "Hàng sưu tầm", color: "orange" }
  },
  {
    id: "3",
    name: "Leather Crossbody Bag",
    brand: "Local Brand",
    category: "Túi xách",
    price: 320000,
    imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=400",
    isSoldOut: true // Sản phẩm này đã bán
  },
  {
    id: "4",
    name: "Adidas Originals Sneaker - Size 42",
    brand: "Adidas",
    category: "Giày dép",
    price: 850000,
    imageUrl: "https://images.unsplash.com/photo-1520256862855-398228c41684?auto=format&fit=crop&q=80&w=400",
    badge: { text: "Fullbox", color: "green" }
  },
  {
    id: "5",
    name: "Canon AE-1 Program",
    brand: "Canon",
    category: "Máy ảnh",
    price: 3200000,
    imageUrl: "https://images.unsplash.com/photo-1626544827763-d516dce335ca?auto=format&fit=crop&q=80&w=400",
    badge: { text: "Mới 95%", color: "green" }
  }
];

export default function WishlistPage() {
  return (
    <PageLayout>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <WishlistHeader count={MOCK_WISHLIST.length} />
        
        <WishlistToolbar />

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {MOCK_WISHLIST.map((item) => (
            <WishlistItemCard key={item.id} item={item} />
          ))}
          
          {/* Mock Empty State if needed */}
          {MOCK_WISHLIST.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-400">
               <span className="material-symbols-outlined text-6xl mb-3">favorite</span>
               <p>Chưa có sản phẩm nào trong danh sách yêu thích</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </PageLayout>
  );
}