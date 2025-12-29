import { useMemo, useState } from "react";
import type { Address, Order, ProfileTabKey, UserProfile, ActivityItem } from "./types";
import ProfileSidebar from "./components/ProfileSidebar";
import ProfileHeaderCard from "./components/ProfileHeaderCard";
import OverviewTab from "./components/OverviewTab";
import PersonalInfoTab from "./components/PersonalInfoTab";
import AddressesTab from "./components/AddressesTab";
import OrdersTab from "./components/OrdersTab";
import PageLayout from "@/components/layout/PageLayout";
const MOCK_USER: UserProfile = {
  fullName: "Nguyễn Văn A",
  email: "nguyenvana@example.com",
  phone: "090****123",
  joinedYear: 2023,
  verified: true,
  avatarUrl: "",
};

const MOCK_ADDRESSES: Address[] = [
  {
    id: "ad1",
    receiver: "Nguyễn Văn A",
    phone: "0901234567",
    isDefault: true,
    addressLine: "123 Đường ABC, Quận Hoàn Kiếm, Hà Nội",
  },
  {
    id: "ad2",
    receiver: "Nguyễn Văn A",
    phone: "0901234567",
    label: "Văn phòng",
    addressLine: "Keangnam, Phạm Hùng, Nam Từ Liêm, Hà Nội",
  },
];

const MOCK_ORDERS: Order[] = [
  { id: "DH-10231", createdAt: "2025-12-20", status: "completed", itemCount: 2, total: 2500000 },
  { id: "DH-10212", createdAt: "2025-12-16", status: "shipping", itemCount: 1, total: 350000 },
  { id: "DH-10198", createdAt: "2025-12-10", status: "processing", itemCount: 3, total: 1200000 },
];

const MOCK_ACTIVITIES: ActivityItem[] = [
  {
    id: "ac1",
    title: "Máy ảnh Film Vintage Canon ...",
    subtitle: "Đã giao hàng thành công",
    amount: 2500,
    badgeText: "Hoàn thành",
    badgeTone: "green",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAkXBBXi5cIhibT7MN4bGIXgAbMPz5piZWOF1RUdyXTK5ipYluUB68r258rwmgliysvEQkkKUAGeYgRer3-iTOxkEk27x-DMoYq8z1IgLWhV6t0sZWqIf-wnkKF2wCLAdhyGMBCRyiN9tO7SvWuMgguPE1siuO1emTIIkNLlIh_lPcHtl3f79j7DbTBX5JVo4mSWtlCP0FRqVWE3MLO172rmlRXOD0C2heLfjkc5jrZIPOFxNEAzmEgiR2h3iaXEnsXqjtU9xVUofTL",
  },
  {
    id: "ac2",
    title: "Áo khoác Denim Jacket Size M",
    subtitle: "Đang vận chuyển",
    amount: 350,
    badgeText: "Đang giao",
    badgeTone: "blue",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDLG_kwBdX61QO5PuvqRnm5H_5zgZidjrTS_PlGWYFlr6nR0Z2-6GvRAr3XoTI0RA6yCn-4TQWe7cILs9-2bnKe1Bez_ZzmH-odWjnAuaEpQdFXU3xiNqMh1CfQ5qOhtCo9WEe2j_KAJ-UwNi8_TKUSjju7gbrJ2ekTQT_xgmlqwuD6Hgl8FZXBbpPc-lQ_lvvJ7DK9_n5rysccaIgmwAF5qdfq-ecaa1T9bc35o_8N4MuePNN5Od9elYioKZGXsTsNZVxLlmxnnyt2",
  },
  {
    id: "ac3",
    title: "Đăng bán: Giày Sneaker Nike cũ",
    subtitle: "Đang chờ duyệt",
    badgeText: "Chờ duyệt",
    badgeTone: "yellow",
  },
];

export default function ProfilePage() {
  const [active, setActive] = useState<ProfileTabKey>("overview");

  const stats = useMemo(() => {
    const delivering = MOCK_ORDERS.filter((o) => o.status === "shipping").length;
    const selling = 12;
    const walletVnd = 1250000;
    return { delivering, selling, walletVnd };
  }, []);

  return (
    <PageLayout>
      <main className="w-full max-w-[1280px] mx-auto px-4 md:px-10 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <ProfileSidebar
              user={MOCK_USER}
              active={active}
              onChange={setActive}
              onLogout={() => console.log("LOGOUT")}
            />
          </div>

          <div className="lg:col-span-9 space-y-6">

            <ProfileHeaderCard user={MOCK_USER} onEdit={() => setActive("personal")} />

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
                activities={MOCK_ACTIVITIES}
              />
            ) : null}

            {active === "personal" ? <PersonalInfoTab user={MOCK_USER} /> : null}
            {active === "address" ? <AddressesTab addresses={MOCK_ADDRESSES} /> : null}
            {active === "orders" ? <OrdersTab orders={MOCK_ORDERS} /> : null}
          </div>
        </div>
      </main>
    </PageLayout>
  );
}
