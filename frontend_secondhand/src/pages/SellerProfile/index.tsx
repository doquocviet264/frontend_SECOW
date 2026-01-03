import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SellerSidebar from "./components/SellerSidebar";
import ShopBanner from "./components/ShopBanner";
import ShopProductGrid from "./components/ShopProductGrid";
import type { ShopProfile, ProductItem } from "./types";
import PageLayout from "@/components/layout/PageLayout";
import { storeService } from "@/services/storeService";
import axios from "@/config/axios";
import type { Store } from "@/services/storeService";
import type { Product } from "@/types/product";

export default function SellerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [shop, setShop] = useState<ShopProfile | null>(null);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShopData = async () => {
      if (!id) {
        setError("Không tìm thấy ID cửa hàng");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch store data
        const storeResponse = await storeService.getStoreById(id);
        if (!storeResponse.success || !storeResponse.data?.store) {
          setError("Không tìm thấy cửa hàng");
          setLoading(false);
          return;
        }

        const store: Store = storeResponse.data.store;

        // Map Store to ShopProfile
        const shopProfile: ShopProfile = {
          id: store._id,
          name: store.storeName,
          avatarUrl: store.logo || "https://via.placeholder.com/300",
          location: store.address || "Chưa cập nhật",
          isTrusted: store.isApproved || false,
          bannerUrl: store.coverImage || "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=2070&auto=format&fit=crop",
          description: store.description || "Chưa có mô tả",
          stats: {
            rating: store.rating?.average || 0,
            reviewCount: store.rating?.count || 0,
            soldCount: store.totalSales || 0,
            responseRate: 98, // TODO: Calculate from actual data
            responseTime: "Trong 1h", // TODO: Calculate from actual data
            joinedDate: new Date(store.createdAt).toLocaleDateString("vi-VN", {
              month: "long",
              year: "numeric",
            }),
            followerCount: 0, // TODO: Add follower feature
          },
        };

        setShop(shopProfile);

        // Fetch products by seller
        const sellerId = typeof store.seller === "string" ? store.seller : store.seller._id;
        const productsResponse = await axios.get(`/v1/products/`, {
          params: {
            sellerId,
            status: "active",
            limit: 50,
          },
        });

        if (productsResponse.data?.success && productsResponse.data?.data?.products) {
          const apiProducts: Product[] = productsResponse.data.data.products;
          const mappedProducts: ProductItem[] = apiProducts.map((p) => ({
            id: p._id,
            title: p.title,
            price: p.price,
            originalPrice: p.originalPrice,
            imageUrl: p.images?.[0] || "https://via.placeholder.com/300",
            badge: p.condition === "new" ? "MỚI" : p.condition === "like_new" ? "LIKE NEW" : p.condition === "good" ? "GOOD" : undefined,
            condition: p.location || "Chưa cập nhật",
            postedTime: new Date(p.createdAt).toLocaleDateString("vi-VN"),
            status: p.status === "active" ? "available" : "sold",
          }));
          setProducts(mappedProducts);
        }
      } catch (err: any) {
        console.error("Error fetching shop data:", err);
        setError(err?.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu cửa hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchShopData();
  }, [id]);

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Đang tải thông tin cửa hàng...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !shop) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 flex items-center justify-center">
          <div className="text-center">
            <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">error_outline</span>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Không tìm thấy cửa hàng</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error || "Cửa hàng không tồn tại hoặc chưa được duyệt"}</p>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Sidebar (1 column) */}
          <div className="lg:col-span-1">
            <SellerSidebar shop={shop} />
          </div>

          {/* Main Content (3 columns) */}
          <div className="lg:col-span-3">
            <ShopBanner 
              bannerUrl={shop.bannerUrl} 
              description={shop.description}
            />
            <ShopProductGrid products={products} />
          </div>
          
        </div>
      </div>
    </PageLayout>
  );
}