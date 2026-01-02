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

export default function ProfilePage() {
  const [active, setActive] = useState<ProfileTabKey>("overview");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Map API order status to component order status
  const mapOrderStatus = (status: ApiOrder["status"]): Order["status"] => {
    switch (status) {
      case "pending":
      case "confirmed":
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

          // Map address from user data
          if (apiUser.address) {
            const addressParts = [];
            if (apiUser.address.street) addressParts.push(apiUser.address.street);
            if (apiUser.address.ward) addressParts.push(apiUser.address.ward);
            if (apiUser.address.district) addressParts.push(apiUser.address.district);
            if (apiUser.address.city) addressParts.push(apiUser.address.city);

            if (addressParts.length > 0) {
              setAddresses([
                {
                  id: "main",
                  receiver: apiUser.name || "",
                  phone: apiUser.phone || "",
                  isDefault: true,
                  addressLine: addressParts.join(", "),
                },
              ]);
            }
          }
        }

        // Fetch orders
        const ordersResponse = await orderService.getMyOrders({ limit: 50 });
        if (ordersResponse.success && ordersResponse.data?.orders) {
          const mappedOrders: Order[] = ordersResponse.data.orders.map((apiOrder) => ({
            id: apiOrder.orderNumber,
            createdAt: new Date(apiOrder.createdAt).toISOString().split("T")[0],
            status: mapOrderStatus(apiOrder.status),
            itemCount: apiOrder.items.reduce((sum, item) => sum + item.quantity, 0),
            total: apiOrder.totalAmount,
          }));
          setOrders(mappedOrders);

          // Generate activities from recent orders
          const recentOrders = mappedOrders.slice(0, 5);
          const mappedActivities: ActivityItem[] = recentOrders.map((order, index) => {
            const firstItem = ordersResponse.data.orders[index]?.items[0];
            return {
              id: `ac${index + 1}`,
              title: firstItem?.productName || `Đơn hàng ${order.id}`,
              subtitle:
                order.status === "completed"
                  ? "Đã giao hàng thành công"
                  : order.status === "shipping"
                  ? "Đang vận chuyển"
                  : "Đang chờ xử lý",
              amount: order.total,
              badgeText:
                order.status === "completed"
                  ? "Hoàn thành"
                  : order.status === "shipping"
                  ? "Đang giao"
                  : "Chờ xử lý",
              badgeTone:
                order.status === "completed"
                  ? "green"
                  : order.status === "shipping"
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
    const delivering = orders.filter((o) => o.status === "shipping").length;
    const selling = 0; // TODO: Fetch from seller API if user is seller
    const walletVnd = 0; // TODO: Fetch from wallet/transaction API
    return { delivering, selling, walletVnd };
  }, [orders]);

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
            {active === "address" ? <AddressesTab addresses={addresses} /> : null}
            {active === "orders" ? <OrdersTab orders={orders} /> : null}
          </div>
        </div>
      </main>
    </PageLayout>
  );
}
