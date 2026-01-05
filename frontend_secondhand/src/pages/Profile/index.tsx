import { useMemo, useState, useEffect } from "react";
import type { Address, ProfileTabKey, UserProfile } from "./types";
import ProfileSidebar from "./components/ProfileSidebar";
import ProfileHeaderCard from "./components/ProfileHeaderCard";
import OverviewTab from "./components/OverviewTab";
import PersonalInfoTab from "./components/PersonalInfoTab";
import AddressesTab from "./components/AddressesTab";
import OrdersTab from "./components/OrdersTab";
import PageLayout from "@/components/layout/PageLayout";
import { authService } from "@/services/authService";
import { orderService } from "@/services/orderService";
import { userService } from "@/services/userService";
import { storeService } from "@/services/storeService";
import { reviewService } from "@/services/reviewService";
import { productService } from "@/services/productService";

export default function ProfilePage() {
  const [active, setActive] = useState<ProfileTabKey>("overview");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<string>("user");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selling, setSelling] = useState(0);
  const [newProductsThisWeek, setNewProductsThisWeek] = useState(0);
  const [delivering, setDelivering] = useState(0);
  const [rating, setRating] = useState<{
    score: number;
    total: number;
    bars: { star: number; percent: number }[];
  }>({
    score: 0,
    total: 0,
    bars: [
      { star: 5, percent: 0 },
      { star: 4, percent: 0 },
      { star: 3, percent: 0 },
      { star: 2, percent: 0 },
      { star: 1, percent: 0 },
    ],
  });

  // Fetch user data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user profile
        const userResponse = await authService.getMe();
        let userId: string | null = null;
        if (userResponse.success && userResponse.data?.user) {
          const apiUser = userResponse.data.user as any;
          userId = apiUser._id;
          const createdAt = apiUser.createdAt || apiUser.created_at;
          const joinedYear = createdAt 
            ? new Date(createdAt).getFullYear() 
            : new Date().getFullYear();
          
          const userProfile: UserProfile = {
            fullName: apiUser.name || "",
            email: apiUser.email || "",
            phone: apiUser.phone || "",
            joinedYear,
            verified: apiUser.isEmailVerified || false,
            avatarUrl: apiUser.avatar || "",
          };
          setUser(userProfile);
          setUserRole(apiUser.role || "user");
        }

        // Fetch addresses from new API
        const addressesResponse = await userService.getAddresses();
        if (addressesResponse.success && addressesResponse.data?.addresses) {
          const mappedAddresses: Address[] = addressesResponse.data.addresses.map((addr: any) => {
            const addressParts = [];
            if (addr.street) addressParts.push(addr.street);
            if (addr.ward) addressParts.push(addr.ward);
            if (addr.district) addressParts.push(addr.district);
            if (addr.city) addressParts.push(addr.city);

            return {
              id: addr._id || addr.id,
              receiver: addr.receiver || "",
              phone: addr.phone || "",
              isDefault: addr.isDefault || false,
              addressLine: addressParts.join(", "),
              street: addr.street,
              city: addr.city,
              district: addr.district,
              ward: addr.ward,
              provinceCode: addr.provinceCode,
              districtCode: addr.districtCode,
              wardCode: addr.wardCode,
              label: addr.label,
            };
          });
          setAddresses(mappedAddresses);
        }

        // Fetch delivering orders count
        try {
          const ordersResponse = await orderService.getMyOrders({ limit: 100 });
          if (ordersResponse.success && ordersResponse.data?.orders) {
            const deliveringCount = ordersResponse.data.orders.filter(
              (order: any) => order.status === "shipped"
            ).length;
            setDelivering(deliveringCount);
          }
        } catch (orderErr) {
          console.error("Error fetching orders:", orderErr);
        }

        // Fetch new products this week if user is seller
        if (userId) {
          try {
            // Calculate start of this week (Monday)
            const now = new Date();
            const dayOfWeek = now.getDay();
            const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - diff);
            startOfWeek.setHours(0, 0, 0, 0);

            const productsResponse = await productService.getSellerProducts({
              limit: 1000, // Get all products to count
              page: 1,
            });

            if (productsResponse.success && productsResponse.data?.products) {
              const products = productsResponse.data.products;
              const newProductsCount = products.filter((product: any) => {
                const createdAt = new Date(product.createdAt || product.created_at);
                return createdAt >= startOfWeek;
              }).length;
              setNewProductsThisWeek(newProductsCount);
            }
          } catch (productErr) {
            console.error("Error fetching new products:", productErr);
          }
        }

        // Fetch store stats if user is seller
        try {
          const storeStatsResponse = await storeService.getStoreStats();
          if (storeStatsResponse.success && storeStatsResponse.data?.stats) {
            const stats = storeStatsResponse.data.stats;
            // Set selling count
            setSelling(stats.products?.active || 0);

            // Set rating from store stats
            if (stats.rating && userId) {
              const avgRating = stats.rating.average || 0;
              const totalReviews = stats.rating.count || 0;

              // Fetch reviews to calculate rating bars
              try {
                const reviewsResponse = await reviewService.getSellerReviews(userId, { limit: 100 });
                
                if (reviewsResponse.success && reviewsResponse.data?.reviews) {
                  const reviews = reviewsResponse.data.reviews;
                  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
                  
                  reviews.forEach((review: any) => {
                    const ratingValue = review.rating;
                    if (ratingValue >= 1 && ratingValue <= 5) {
                      ratingCounts[ratingValue as keyof typeof ratingCounts]++;
                    }
                  });

                  const bars = [5, 4, 3, 2, 1].map((star) => ({
                    star,
                    percent: totalReviews > 0 ? Math.round((ratingCounts[star as keyof typeof ratingCounts] / totalReviews) * 100) : 0,
                  }));

                  setRating({
                    score: avgRating,
                    total: totalReviews,
                    bars,
                  });
                } else {
                  // Fallback: use store rating without bars detail
                  setRating({
                    score: avgRating,
                    total: totalReviews,
                    bars: [
                      { star: 5, percent: 0 },
                      { star: 4, percent: 0 },
                      { star: 3, percent: 0 },
                      { star: 2, percent: 0 },
                      { star: 1, percent: 0 },
                    ],
                  });
                }
              } catch (reviewErr) {
                console.error("Error fetching reviews:", reviewErr);
                // Fallback: use store rating without bars detail
                setRating({
                  score: avgRating,
                  total: totalReviews,
                  bars: [
                    { star: 5, percent: 0 },
                    { star: 4, percent: 0 },
                    { star: 3, percent: 0 },
                    { star: 2, percent: 0 },
                    { star: 1, percent: 0 },
                  ],
                });
              }
            }
          }
        } catch (storeErr: any) {
          // User is not a seller or store doesn't exist - that's okay
          // Keep default values (selling = 0, rating = default)
          console.log("User is not a seller or store not found:", storeErr?.response?.status);
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu");
        console.error("Error fetching profile data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = useMemo(() => {
    return { delivering, selling, newProductsThisWeek };
  }, [delivering, selling, newProductsThisWeek]);

  const handleLogout = () => {
    authService.logout();
  };

  if (loading) {
    return (
      <PageLayout>
        <main className="w-full max-w-[1280px] mx-auto px-4 md:px-10 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Đang tải dữ liệu...</p>
            </div>
          </div>
        </main>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <main className="w-full max-w-[1280px] mx-auto px-4 md:px-10 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
              >
                Thử lại
              </button>
            </div>
          </div>
        </main>
      </PageLayout>
    );
  }

  if (!user) {
    return (
      <PageLayout>
        <main className="w-full max-w-[1280px] mx-auto px-4 md:px-10 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-gray-600 dark:text-gray-400">Không tìm thấy thông tin người dùng</p>
          </div>
        </main>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <main className="w-full max-w-[1280px] mx-auto px-4 md:px-10 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <ProfileSidebar
              user={user}
              active={active}
              onChange={setActive}
              onLogout={handleLogout}
            />
          </div>

          <div className="lg:col-span-9 space-y-6">
            <ProfileHeaderCard user={user} onEdit={() => setActive("personal")} />

            {active === "overview" ? (
              <OverviewTab
                stats={stats}
                rating={rating}
                userRole={userRole}
                onTabChange={setActive}
              />
            ) : null}

            {active === "personal" ? <PersonalInfoTab user={user} /> : null}
            {active === "address" ? (
              <AddressesTab
                addresses={addresses}
                onAddressAdded={async () => {
                  // Refresh addresses from new API
                  try {
                    const addressesResponse = await userService.getAddresses();
                    if (addressesResponse.success && addressesResponse.data?.addresses) {
                      const mappedAddresses: Address[] = addressesResponse.data.addresses.map((addr: any) => {
                        const addressParts = [];
                        if (addr.street) addressParts.push(addr.street);
                        if (addr.ward) addressParts.push(addr.ward);
                        if (addr.district) addressParts.push(addr.district);
                        if (addr.city) addressParts.push(addr.city);

                        return {
                          id: addr._id || addr.id,
                          receiver: addr.receiver || "",
                          phone: addr.phone || "",
                          isDefault: addr.isDefault || false,
                          addressLine: addressParts.join(", "),
                          street: addr.street,
                          city: addr.city,
                          district: addr.district,
                          ward: addr.ward,
                          provinceCode: addr.provinceCode,
                          districtCode: addr.districtCode,
                          wardCode: addr.wardCode,
                          label: addr.label,
                        };
                      });
                      setAddresses(mappedAddresses);
                    }
                  } catch (err) {
                    console.error("Error refreshing addresses:", err);
                  }
                }}
              />
            ) : null}
            {active === "orders" ? <OrdersTab /> : null}
          </div>
        </div>
      </main>
    </PageLayout>
  );
}
