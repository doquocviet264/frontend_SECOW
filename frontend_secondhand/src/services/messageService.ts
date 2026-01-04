import axios from "@/config/axios";

export type ConversationListItem = {
  id: string;
  participants: Array<{ _id: string; name: string; avatar?: string }>;
  lastMessage?: {
    _id: string;
    content: string;
    sender: string;
    receiver: string;
    createdAt: string;
  };
  unreadCount: number;
  updatedAt: string;
};

export type MessageItem = {
  _id: string;
  conversation: string;
  sender: { _id: string; name: string; avatar?: string };
  receiver: { _id: string; name: string; avatar?: string };
  content: string;
  images: string[];
  product?: {
    productId?: string;
    title?: string;
    price?: number;
    image?: string;
  };
  isRead: boolean;
  createdAt: string;
  readAt?: string;
};

const PREFIX = "/v1/messages";

export const messageService = {
  async getConversations(): Promise<{ conversations: ConversationListItem[] }> {
    const res = await axios.get(`${PREFIX}/conversations`);
    return res.data.data;
  },

  async getMessages(conversationId: string, page = 1, limit = 50): Promise<{ messages: MessageItem[] }> {
    const res = await axios.get(`${PREFIX}/conversations/${conversationId}`, {
      params: { page, limit },
    });
    return res.data.data;
  },

  async sendMessage(payload: {
    receiverId: string;
    content: string;
    images?: string[];
    product?: { productId?: string; title?: string; price?: number; image?: string };
  }) {
    const res = await axios.post(`${PREFIX}`, payload);
    return res.data.data.message as MessageItem;
  },

  async markAsRead(messageId: string) {
    await axios.put(`${PREFIX}/${messageId}/read`);
  },
};


