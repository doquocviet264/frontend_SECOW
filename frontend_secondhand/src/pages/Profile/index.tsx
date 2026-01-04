import { useMemo, useState, useEffect } from "react";
import type { Address, Order, ProfileTabKey, UserProfile, ActivityItem } from "./types";
import ProfileSidebar from "./components/ProfileSidebar";
import ProfileHeaderCard from "./components/ProfileHeaderCard";
import OverviewTab from "./components/OverviewTab";
import PersonalInfoTab from "./components/PersonalInfoTab";
import AddressesTab from "./components/AddressesTab";
import OrdersTab from "./components/OrdersTab";
import PageLayout from "@/components/layout/PageLayout";
import { authService } from "@/services/authService";
import { orderService, type Order as ApiOrder } from "@/services/orderService";
import { userService } from "@/services/userService";

export default function ProfilePage() {
  const [active, setActive] = useState<ProfileTabKey>("overview");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Map API order status to component order status
  const mapOrderStatus = (status: ApiOrder["status"]): Order["status"] => {
    switch (status) {
      case "pending":
      case "confirmed":
      case "packaged":
        return "processing";
      case "shipped":
        return "shipping";
      case "delivered":
        return "completed";
      case "cancelled":
      case "rejected":
        return "cancelled";
      default:
        return "processing";
    }
  };

  // Fetch user data and orders
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user profile
        const userResponse = await authService.getMe();
        if (userResponse.success && userResponse.data?.user) {
          const apiUser = userResponse.data.user as any;
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

        // Fetch orders for activities (only recent ones)
        const ordersResponse = await orderService.getMyOrders({ limit: 5 });
        if (ordersResponse.success && ordersResponse.data?.orders) {
          // Generate activities from recent orders
          const mappedActivities: ActivityItem[] = ordersResponse.data.orders.map((apiOrder, index) => {
            const firstItem = apiOrder.items[0];
            const orderStatus = mapOrderStatus(apiOrder.status);
            return {
              id: `ac${index + 1}`,
              title: firstItem?.productName || `Đơn hàng ${apiOrder.orderNumber}`,
              subtitle:
                orderStatus === "completed"
                  ? "Đã giao hàng thành công"
                  : orderStatus === "shipping"
                  ? "Đang vận chuyển"
                  : "Đang chờ xử lý",
              amount: apiOrder.totalAmount,
              badgeText:
                orderStatus === "completed"
                  ? "Hoàn thành"
                  : orderStatus === "shipping"
                  ? "Đang giao"
                  : "Chờ xử lý",
              badgeTone:
                orderStatus === "completed"
                  ? "green"
                  : orderStatus === "shipping"
                  ? "blue"
                  : "yellow",
              imageUrl: firstItem?.productImage,
            };
          });
          setActivities(mappedActivities);
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
    // Stats will be calculated from activities or fetched separately
    const delivering = activities.filter((a) => a.badgeTone === "blue").length;
    const selling = 0; // TODO: Fetch from seller API if user is seller
    const walletVnd = 0; // TODO: Fetch from wallet/transaction API
    return { delivering, selling, walletVnd };
  }, [activities]);

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
                rating={{
                  score: 4.8,
                  total: 125,
                  bars: [
                    { star: 5, percent: 77 },
                    { star: 4, percent: 15 },
                    { star: 3, percent: 5 },
                    { star: 2, percent: 1 },
                    { star: 1, percent: 2 },
                  ],
                }}
                activities={activities}
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
