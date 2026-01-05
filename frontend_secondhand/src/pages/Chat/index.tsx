import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { messageService, type ConversationListItem, type MessageItem } from "@/services/messageService";
import { getSocket } from "@/config/socket";
import { authService } from "@/services/authService";
import PageLayout from "@/components/layout/PageLayout";

export default function ChatPage() {
  const queryClient = useQueryClient();
  const currentUser = authService.getCurrentUser();
  const [activeConversation, setActiveConversation] = React.useState<ConversationListItem | null>(null);
  const [input, setInput] = React.useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const targetUserId = searchParams.get("with") || "";
  const targetUserName = searchParams.get("name") || "";
  const [query, setQuery] = React.useState("");
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);
  const productId = searchParams.get("productId") || "";
  const productTitle = searchParams.get("productTitle") || "";
  const productPrice = searchParams.get("productPrice") || "";
  const productImage = searchParams.get("productImage") || "";
  const LAST_CHAT_KEY = "chat:last";

  const { data: convData } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => messageService.getConversations(),
  });

  const conversationId = activeConversation?.id;
  const { data: msgData, isLoading: isLoadingMessages } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => (conversationId ? messageService.getMessages(conversationId) : Promise.resolve({ messages: [] as MessageItem[] })),
    enabled: !!conversationId,
  });

  React.useEffect(() => {
    const socket = getSocket();
    const onNewMessage = (payload: { conversationId: string; message: MessageItem }) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      if (payload.conversationId === conversationId) {
        queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      }
    };
    const onConversationUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    };
    const onMessageRead = () => {
      if (conversationId) queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
    };
    socket.on("message:new", onNewMessage);
    socket.on("conversation:updated", onConversationUpdated);
    socket.on("message:read", onMessageRead);
    return () => {
      socket.off("message:new", onNewMessage);
      socket.off("conversation:updated", onConversationUpdated);
      socket.off("message:read", onMessageRead);
    };
  }, [queryClient, conversationId]);

  // Auto-select conversation if ?with={userId} is present
  React.useEffect(() => {
    if (!convData?.conversations || !targetUserId) return;
    const found = convData.conversations.find((c) => c.participants.some((p) => p._id === targetUserId));
    if (found) {
      setActiveConversation(found);
    }
  }, [convData?.conversations, targetUserId]);

  // Restore last active conversation when no ?with=
  React.useEffect(() => {
    if (!convData?.conversations || targetUserId) return;
    try {
      const raw = localStorage.getItem(LAST_CHAT_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as {
        userId?: string;
        conversationId?: string;
        withUserId?: string;
      } | null;
      if (!saved || saved.userId !== currentUser?.id) return;
      if (saved.conversationId) {
        const foundByConv = convData.conversations.find((c) => c.id === saved.conversationId);
        if (foundByConv) {
          setActiveConversation(foundByConv);
          return;
        }
      }
      if (saved.withUserId) {
        const foundByUser = convData.conversations.find((c) => c.participants.some((p) => p._id === saved.withUserId));
        if (foundByUser) {
          setActiveConversation(foundByUser);
        }
      }
    } catch {
      // ignore parse errors
    }
  }, [convData?.conversations, targetUserId, currentUser?.id]);
  // Persist last active conversation
  React.useEffect(() => {
    if (!activeConversation || !currentUser?.id) return;
    try {
      const other = activeConversation.participants[0];
      const payload = {
        userId: currentUser.id,
        conversationId: activeConversation.id,
        withUserId: other?._id,
      };
      localStorage.setItem(LAST_CHAT_KEY, JSON.stringify(payload));
    } catch {
      // ignore
    }
  }, [activeConversation?.id, currentUser?.id]);

  const handleSend = async () => {
    if (!input.trim() || !activeConversation) return;
    const receiverId = activeConversation.participants[0]?._id;
    if (!receiverId) return;
    await messageService.sendMessage({
      receiverId,
      content: input.trim(),
      product: productId
        ? {
            productId,
            title: productTitle,
            price: Number(productPrice) || undefined,
            image: productImage || undefined,
          }
        : undefined,
    });
    setInput("");
    // Clear product context after first send
    if (productId) {
      clearProductContext();
    }
    if (activeConversation?.id) {
      queryClient.invalidateQueries({ queryKey: ["messages", activeConversation.id] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    }
  };

  // Allow starting a new chat directly with ?with= if no conversation exists yet
  const handleSendNew = async () => {
    if (!input.trim() || !targetUserId) return;
    await messageService.sendMessage({
      receiverId: targetUserId,
      content: input.trim(),
      product: productId
        ? {
            productId,
            title: productTitle,
            price: Number(productPrice) || undefined,
            image: productImage || undefined,
          }
        : undefined,
    });
    setInput("");
    // Clear product context after first send
    if (productId) {
      clearProductContext();
    }
    const updated = await messageService.getConversations();
    const found = updated.conversations.find((c) => c.participants.some((p) => p._id === targetUserId));
    if (found) setActiveConversation(found);
    // Persist last chat target if no conversation yet
    try {
      localStorage.setItem(
        LAST_CHAT_KEY,
        JSON.stringify({ userId: currentUser?.id, withUserId: targetUserId })
      );
    } catch {}
    queryClient.invalidateQueries({ queryKey: ["conversations"] });
    if (found?.id) {
      queryClient.invalidateQueries({ queryKey: ["messages", found.id] });
    }
  };

  // Helpers
  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    const last = parts.pop() || "";
    const first = parts.shift() || "";
    return (first[0] || "U") + (last[0] || "");
  };
  const filteredConversations =
    convData?.conversations?.filter((c) =>
      (c.participants[0]?.name || "").toLowerCase().includes(query.toLowerCase())
    ) || [];
  const formatVND = (v: number) => new Intl.NumberFormat("vi-VN").format(v) + "đ";
  const clearProductContext = React.useCallback(() => {
    const next = new URLSearchParams(searchParams);
    next.delete("productId");
    next.delete("productTitle");
    next.delete("productPrice");
    next.delete("productImage");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  return (
    <PageLayout>
    <div className="mx-auto max-w-[1800px] 2xl:max-w-[1920px] p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 w-full flex-1">
      {/* Sidebar */}
      <div className="border rounded-xl h-full overflow-hidden bg-white">
        <div className="p-4 border-b flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">forum</span>
          <div className="font-semibold">Cuộc trò chuyện</div>
        </div>
        <div className="p-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2 top-2.5 text-gray-400 text-[18px]">search</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm theo tên..."
              className="w-full pl-9 pr-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
        <div className="overflow-y-auto flex-1">
          {filteredConversations.map((c) => {
            const other = c.participants[0];
            const selected = activeConversation?.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveConversation(c)}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 border-b hover:bg-gray-50 transition-colors ${
                  selected ? "bg-gray-100" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-600">
                  {getInitials(other?.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium truncate">{other?.name || "Người dùng"}</div>
                    {c.unreadCount > 0 && (
                      <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">{c.unreadCount}</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 truncate">{c.lastMessage?.content || "Bắt đầu trò chuyện"}</div>
                </div>
              </button>
            );
          })}
          {!filteredConversations.length && (
            <div className="p-4 text-sm text-gray-500">Chưa có cuộc trò chuyện</div>
          )}
        </div>
      </div>

      {/* Chat panel */}
      <div className="lg:col-span-2 border rounded-xl h-full flex flex-col bg-white">
        {/* Header */}
        <div className="p-4 border-b flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
            {getInitials(
              activeConversation
                ? activeConversation.participants[0]?.name
                : targetUserId
                ? targetUserName || "Người bán"
                : "?"
            )}
          </div>
          <div className="flex-1">
            <div className="font-semibold">
              {activeConversation
                ? activeConversation.participants[0]?.name
                : targetUserId
                ? targetUserName || "Người bán"
                : "Chọn một cuộc trò chuyện"}
            </div>
            <div className="text-xs text-gray-500">An toàn giao dịch • Bảo mật tin nhắn</div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 to-white">
          {isLoadingMessages && <div className="text-sm text-gray-500">Đang tải tin nhắn...</div>}
          {msgData?.messages?.map((m) => {
            const mine = m.sender._id === currentUser?.id;
            return (
              <div key={m._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[72%]`}>
                  <div
                    className={`px-3 py-2 rounded-2xl ${
                      mine ? "bg-primary text-white rounded-br-md" : "bg-white border rounded-bl-md"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.content}</div>
                    {m.product && (
                      m.product.productId ? (
                        <Link to={`/products/${m.product.productId}`} className="block mt-2">
                          <div
                            className={`border rounded-lg p-2 flex items-center gap-2 ${mine ? "bg-white/10 border-white/20" : "bg-gray-50"} hover:bg-gray-100/80 transition-colors`}
                          >
                            <div className="w-12 h-12 rounded-md bg-white border overflow-hidden flex items-center justify-center">
                              {m.product.image ? (
                                <img src={m.product.image} alt={m.product.title || "product"} className="w-full h-full object-cover" />
                              ) : (
                                <span className="material-symbols-outlined text-gray-400">image</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className={`text-sm ${mine ? "text-white" : "text-gray-800"} truncate underline`}>{m.product.title || "Sản phẩm"}</div>
                              {typeof m.product.price === "number" && (
                                <div className={`text-xs ${mine ? "text-white/80" : "text-primary"}`}>
                                  {formatVND(Number(m.product.price))}
                                </div>
                              )}
                            </div>
                          </div>
                        </Link>
                      ) : (
                        <div
                          className={`mt-2 border rounded-lg p-2 flex items-center gap-2 ${mine ? "bg-white/10 border-white/20" : "bg-gray-50"}`}
                        >
                          <div className="w-12 h-12 rounded-md bg-white border overflow-hidden flex items-center justify-center">
                            {m.product.image ? (
                              <img src={m.product.image} alt={m.product.title || "product"} className="w-full h-full object-cover" />
                            ) : (
                              <span className="material-symbols-outlined text-gray-400">image</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className={`text-sm ${mine ? "text-white" : "text-gray-800"} truncate`}>{m.product.title || "Sản phẩm"}</div>
                            {typeof m.product.price === "number" && (
                              <div className={`text-xs ${mine ? "text-white/80" : "text-primary"}`}>
                                {formatVND(Number(m.product.price))}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                  <div className={`text-[11px] mt-1 ${mine ? "text-right text-white/80" : "text-gray-400"}`}>
                    {new Date(m.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            );
          })}
          {!msgData?.messages?.length && activeConversation && (
            <div className="text-sm text-gray-500">Hãy bắt đầu cuộc trò chuyện</div>
          )}
          {!activeConversation && targetUserId && (
            <div className="text-sm text-gray-500">
              Bạn chưa có cuộc trò chuyện với người bán này. Hãy gửi tin nhắn đầu tiên.
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Composer */}
        <div className="p-3 border-t">
          {productId && (
            <div className="mb-3 border rounded-lg p-3 flex items-center gap-3 bg-gray-50">
              <Link to={`/products/${productId}`} className="flex items-center gap-3 min-w-0 flex-1 group">
                <div className="w-12 h-12 rounded-md bg-white border overflow-hidden flex items-center justify-center">
                  {productImage ? (
                    <img src={productImage} alt={productTitle} className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-gray-400">image</span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-medium truncate group-hover:underline">{productTitle || "Sản phẩm"}</div>
                  {productPrice && <div className="text-sm text-primary">{formatVND(Number(productPrice))}</div>}
                </div>
              </Link>
              <button
                className="text-gray-500 hover:text-red-500"
                onClick={() => {
                  clearProductContext();
                }}
                title="Bỏ chọn sản phẩm"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (activeConversation) handleSend();
                  else if (targetUserId) handleSendNew();
                }
              }}
              placeholder="Nhập tin nhắn..."
              className="flex-1 border rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={activeConversation ? handleSend : handleSendNew}
              className="h-10 px-4 rounded-full bg-primary text-white disabled:opacity-50 flex items-center gap-1"
              disabled={(!activeConversation && !targetUserId) || !input.trim()}
            >
              <span className="material-symbols-outlined text-[20px]">send</span>
              Gửi
            </button>
          </div>
        </div>
      </div>
    </div>
    </PageLayout>
  );
}


