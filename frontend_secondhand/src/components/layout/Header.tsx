import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { authService } from "@/services/authService";
import { storeService } from "@/services/storeService";
import type { AuthUser } from "@/types/auth";
import StorePendingModal from "@/components/StorePendingModal";
import { useCart } from "@/store/cart";
import { messageService } from "@/services/messageService";
import { getSocket } from "@/config/socket";

const NAV = [
  { label: "Trang chủ", href: "/" },
  { label: "Sản phẩm", href: "/products" },
];

function Logo() {
  return (
    <Link
      to="/"
      className="flex items-center gap-2 lg:gap-4 text-[var(--text-light)] dark:text-white cursor-pointer"
    >
      <div className="size-8 text-[var(--color-primary)]">
        <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
          <path
            clipRule="evenodd"
            d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z"
            fill="currentColor"
            fillRule="evenodd"
          />
        </svg>
      </div>
      <h2 className="text-lg lg:text-xl font-black leading-tight tracking-tight">
        Chợ Đồ Cũ
      </h2>
    </Link>
  );
}

type HeaderProps = {
  onSearchChange?: (value: string) => void;
  searchValue?: string;
};

export default function Header({ onSearchChange, searchValue = "" }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showStorePendingModal, setShowStorePendingModal] = useState(false);
  const [isCheckingStore, setIsCheckingStore] = useState(false);
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser() as AuthUser | null;
  const { cartCount } = useCart();
  const [unread, setUnread] = useState(0);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [notifItems, setNotifItems] = useState<
    Array<{ senderId: string; senderName: string; conversationId: string; count: number; lastAt: string }>
  >([]);
  const [notifUnread, setNotifUnread] = useState(0);

  // Đóng menu khi route thay đổi
  useEffect(() => {
    setShowUserMenu(false);
  }, [location.pathname]);

  // Unread messages badge
  useEffect(() => {
    if (!isAuthenticated) {
      setUnread(0);
      setNotifUnread(0);
      setNotifItems([]);
      return;
    }
    let mounted = true;
    const loadUnread = async () => {
      try {
        const res = await messageService.getConversations();
        const conversations = res.conversations || [];
        const total = conversations.reduce((s: number, c: any) => s + (c.unreadCount || 0), 0);
        if (mounted) {
          setUnread(total);
          // Khởi tạo danh sách thông báo từ các hội thoại đang có tin chưa đọc
          const initNotifs = conversations
            .filter((c: any) => (c.unreadCount || 0) > 0)
            .map((c: any) => {
              const other = (c.participants && c.participants[0]) || { _id: "", name: "Người dùng" };
              return {
                senderId: other._id || other.id,
                senderName: other.name || "Người dùng",
                conversationId: c.id,
                count: c.unreadCount || 0,
                lastAt: c.lastMessage?.createdAt || c.updatedAt || new Date().toISOString(),
              };
            });
          setNotifItems(initNotifs);
          // Badge hiển thị theo số dòng thông báo (số người gửi), không phải tổng tin nhắn
          setNotifUnread(initNotifs.length);
        }
      } catch {
        /* ignore */
      }
    };
    loadUnread();
    const socket = getSocket();
    const refresh = () => loadUnread();
    const onNew = (payload: { conversationId: string; message: any }) => {
      const msg = payload?.message;
      if (!msg || !msg.sender) return;
      // Chỉ tạo thông báo cho người nhận
      const myId = user?.id;
      const receiverId = (msg.receiver && (msg.receiver._id || msg.receiver.id)) || msg.receiver;
      if (myId && receiverId && receiverId.toString() !== myId.toString()) {
        return;
      }
      const senderId = msg.sender._id || msg.sender.id;
      const existed = notifItems.some((i) => i.senderId === senderId);
      setNotifItems((prev) => {
        const idx = prev.findIndex((i) => i.senderId === senderId);
        const item = {
          senderId,
          senderName: msg.sender.name || "Người dùng",
          conversationId: payload.conversationId,
          count: 1,
          lastAt: msg.createdAt || new Date().toISOString(),
        };
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = {
            ...next[idx],
            count: next[idx].count + 1,
            lastAt: item.lastAt,
            conversationId: item.conversationId,
          };
          return next;
        }
        return [item, ...prev].slice(0, 20);
      });
      // Tăng badge nếu là dòng thông báo mới (người gửi mới)
      setNotifUnread((c) => c + (existed ? 0 : 1));
      refresh();
    };
    socket.on("message:new", onNew);
    socket.on("message:read", refresh);
    socket.on("conversation:updated", refresh);
    return () => {
      mounted = false;
      socket.off("message:new", onNew);
      socket.off("message:read", refresh);
      socket.off("conversation:updated", refresh);
    };
  }, [isAuthenticated]);

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "vừa xong";
    if (mins < 60) return `${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    return `${days} ngày trước`;
  };

  const handleSellClick = async () => {
    if (!isAuthenticated) {
      navigate("/auth/signin");
      return;
    }
    
    if (user?.role === "admin") {
      navigate("/seller/products");
      return;
    }

    // Kiểm tra xem user đã đăng ký thành người bán chưa (có store chưa)
    setIsCheckingStore(true);
    try {
      const storeResponse = await storeService.getMyStore();
      if (storeResponse.success && storeResponse.data?.store) {
        // User đã đăng ký store
        const store = storeResponse.data.store;
        if (!store.isApproved) {
          // Store đang chờ duyệt
          setShowStorePendingModal(true);
          setIsCheckingStore(false);
          return;
        }
        // Store đã được duyệt -> hiển thị trang quản lý sản phẩm
        navigate("/seller/products");
      } else {
        // Chưa có store -> điều hướng đến trang đăng ký thành người bán
        navigate("/become-seller");
      }
    } catch (error: any) {
      console.error("Error checking store status:", error);
      // Nếu lỗi 404 hoặc không có store -> điều hướng đến trang đăng ký
      if (error?.response?.status === 404) {
        navigate("/become-seller");
      } else {
        // Nếu có lỗi khác, vẫn cho phép vào trang (có thể là lỗi mạng)
        navigate("/seller/products");
      }
    } finally {
      setIsCheckingStore(false);
    }
  };

  const handleCartClick = () => {
    if (!isAuthenticated) {
      navigate("/auth/signin");
      return;
    }
    navigate("/cart");
  };

  const handleAccountClick = () => {
    if (!isAuthenticated) {
      navigate("/auth/signin");
      return;
    }
    navigate("/profile");
  };

  const handleLogout = () => {
    authService.logout();
    setShowUserMenu(false);
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid bg-white dark:bg-[var(--surface-dark)] px-4 lg:px-10 py-3 shadow-sm border-b-[var(--border-light)] dark:border-b-[var(--border-dark)]">
      <div className="flex items-center gap-4 lg:gap-8 flex-1">
        <div className="flex items-center gap-2 lg:gap-4">
          <Logo />
        </div>

        <label className="hidden md:flex flex-col min-w-40 w-full max-w-[480px] h-10">
          <div className="flex w-full flex-1 items-stretch rounded-lg h-full overflow-hidden border border-[var(--border-light)] dark:border-[var(--border-dark)]">
            <div className="text-[var(--muted-green)] flex border-none bg-[var(--bg-light)] dark:bg-[var(--bg-dark)] items-center justify-center pl-4 pr-2">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="flex w-full min-w-0 flex-1 resize-none bg-[var(--bg-light)] dark:bg-[var(--bg-dark)] text-[var(--text-light)] dark:text-white placeholder:text-[var(--muted-green)] focus:outline-0 px-2 text-sm font-normal leading-normal border-none"
              placeholder="Tìm kiếm quần áo, đồ điện tử, sách..."
            />
          </div>
        </label>
      </div>

      <div className="flex items-center justify-end gap-4 lg:gap-8">
        <nav className="hidden lg:flex items-center gap-6">
          {NAV.map((n) => (
            <Link
              key={n.label}
              to={n.href}
              className="text-[var(--text-light)] dark:text-white text-sm font-medium hover:text-[var(--color-primary)] transition-colors"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex gap-2 lg:gap-3 relative">
          <button
            onClick={handleSellClick}
            disabled={isCheckingStore}
            className="flex h-10 items-center justify-center overflow-hidden rounded-lg bg-[var(--color-primary)] px-4 text-[var(--text-light)] text-sm font-bold shadow-md hover:brightness-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCheckingStore ? (
              <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
            ) : (
              <span className="truncate">Đăng bán ngay</span>
            )}
          </button>

          {isAuthenticated && (
            <>
              <button
                onClick={handleCartClick}
                className="hidden sm:flex size-10 items-center justify-center rounded-lg bg-[var(--border-light)] dark:bg-[var(--chip-dark)] text-[var(--text-light)] dark:text-white hover:bg-[color:rgba(19,236,91,0.2)] transition-colors relative"
                title="Giỏ hàng"
              >
                <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 flex items-center justify-center rounded-full bg-primary text-black text-[10px] font-bold leading-none">
                    {cartCount}
                  </span>
                )}
              </button>

              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifMenu((s) => !s);
                    setNotifUnread(0); // reset unread on open
                  }}
                  className="hidden sm:flex size-10 items-center justify-center rounded-lg bg-[var(--border-light)] dark:bg-[var(--chip-dark)] text-[var(--text-light)] dark:text-white hover:bg-[color:rgba(19,236,91,0.2)] transition-colors relative"
                  title="Thông báo"
                >
                  <span className="material-symbols-outlined text-[20px]">notifications</span>
                  {notifUnread > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                      {notifUnread}
                    </span>
                  )}
                </button>
                {showNotifMenu && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-[var(--surface-dark)] rounded-lg shadow-lg border border-[var(--border-light)] dark:border-[var(--border-dark)] overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-[var(--border-light)] dark:border-[var(--border-dark)] flex items-center justify-between">
                      <div className="font-semibold text-[var(--text-light)] dark:text-white">Thông báo</div>
                      <button
                        className="text-xs text-[var(--muted-green)] hover:text-[var(--color-primary)]"
                        onClick={() => {
                          setNotifItems([]);
                          setNotifUnread(0);
                        }}
                      >
                        Xóa tất cả
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifItems.length === 0 ? (
                        <div className="px-4 py-6 text-sm text-gray-500">Chưa có thông báo</div>
                      ) : (
                        notifItems.map((n) => {
                          const isSeller = user?.role === "seller";
                          const roleLabel = isSeller ? "khách hàng" : "người bán";
                          const countText = n.count > 1 ? `${n.count} tin nhắn mới` : "1 tin nhắn mới";
                          const line = `Có ${countText} từ ${roleLabel} ${n.senderName}`;
                          return (
                            <button
                              key={`${n.senderId}-${n.lastAt}`}
                              onClick={() => {
                                navigate(`/chat?with=${n.senderId}&name=${encodeURIComponent(n.senderName)}`);
                                setShowNotifMenu(false);
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-[var(--bg-light)] dark:hover:bg-[var(--bg-dark)] transition-colors"
                            >
                              <div className="text-sm text-[var(--text-light)] dark:text-white">
                                {line}
                              </div>
                              <div className="text-xs text-[var(--muted-green)] mt-0.5">{timeAgo(n.lastAt)}</div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => navigate("/chat")}
                className="flex size-10 items-center justify-center rounded-lg bg-[var(--border-light)] dark:bg-[var(--chip-dark)] text-[var(--text-light)] dark:text-white hover:bg-[color:rgba(19,236,91,0.2)] transition-colors relative"
                title="Tin nhắn"
              >
                <span className="material-symbols-outlined text-[20px]">forum</span>
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                    {unread}
                  </span>
                )}
              </button>
            </>
          )}

          <div className="relative">
            <button
              onClick={() => {
                if (isAuthenticated) {
                  setShowUserMenu(!showUserMenu);
                } else {
                  handleAccountClick();
                }
              }}
              className="flex size-10 items-center justify-center rounded-lg bg-[var(--border-light)] dark:bg-[var(--chip-dark)] text-[var(--text-light)] dark:text-white hover:bg-[color:rgba(19,236,91,0.2)] transition-colors"
              title={isAuthenticated ? user?.name || "Tài khoản" : "Đăng nhập"}
            >
              <span className="material-symbols-outlined text-[20px]">account_circle</span>
            </button>

            {isAuthenticated && showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[var(--surface-dark)] rounded-lg shadow-lg border border-[var(--border-light)] dark:border-[var(--border-dark)] overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-[var(--border-light)] dark:border-[var(--border-dark)]">
                  <p className="text-sm font-medium text-[var(--text-light)] dark:text-white">
                    {user?.name || "Người dùng"}
                  </p>
                  <p className="text-xs text-[var(--muted-green)]">{user?.email}</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-[var(--text-light)] dark:text-white hover:bg-[var(--bg-light)] dark:hover:bg-[var(--bg-dark)] transition-colors"
                  >
                    Trang cá nhân
                  </button>
                  {user?.role === "seller" || user?.role === "admin" ? (
                    <button
                      onClick={() => {
                        navigate(user?.role === "admin" ? "/admin" : "/seller");
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-[var(--text-light)] dark:text-white hover:bg-[var(--bg-light)] dark:hover:bg-[var(--bg-dark)] transition-colors"
                    >
                      {user?.role === "admin" ? "Bảng điều khiển Admin" : "Bảng điều khiển"}
                    </button>
                  ) : null}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-[var(--bg-light)] dark:hover:bg-[var(--bg-dark)] transition-colors"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay để đóng menu khi click bên ngoài */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}

      {/* Modal thông báo store đang chờ duyệt */}
      <StorePendingModal
        isOpen={showStorePendingModal}
        onClose={() => setShowStorePendingModal(false)}
      />
    </header>
  );
}
