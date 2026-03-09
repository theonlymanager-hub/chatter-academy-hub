// Platform API Integration Service
// Generic creator platform API integration

const API_BASE = 'https://api.example.com/v1';

// Note: API key should be stored securely, not in client code
// This will be proxied through a backend in production
const getHeaders = (apiKey: string) => ({
  'Authorization': `Bearer ${apiKey}`,
  'Content-Type': 'application/json',
});

export interface Chat {
  id: string;
  fanId: string;
  fanUsername: string;
  fanName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  text: string;
  fromFan: boolean;
  createdAt: string;
  price?: number;
  isPurchased?: boolean;
}

export interface EarningStats {
  total: number;
  subscriptions: number;
  tips: number;
  messages: number;
  posts: number;
  referrals: number;
  streams: number;
  period: string;
}

export interface Transaction {
  id: string;
  type: 'subscription' | 'tip' | 'message' | 'post' | 'referral' | 'stream';
  amount: number;
  fanId: string;
  fanUsername: string;
  description: string;
  createdAt: string;
}

export interface Fan {
  id: string;
  username: string;
  name: string;
  totalSpent: number;
  subscriptionStatus: 'active' | 'expired' | 'none';
  subscribedAt?: string;
  expiredAt?: string;
  isOnline: boolean;
}

// API Functions
export const platformApi = {
  // Chats
  async listChats(apiKey: string, accountId: string): Promise<Chat[]> {
    const response = await fetch(`${API_BASE}/accounts/${accountId}/chats`, {
      headers: getHeaders(apiKey),
    });
    if (!response.ok) throw new Error('Failed to fetch chats');
    return response.json();
  },

  async listChatMessages(apiKey: string, accountId: string, chatId: string): Promise<ChatMessage[]> {
    const response = await fetch(`${API_BASE}/accounts/${accountId}/chats/${chatId}/messages`, {
      headers: getHeaders(apiKey),
    });
    if (!response.ok) throw new Error('Failed to fetch messages');
    return response.json();
  },

  // Earnings
  async getEarningStats(apiKey: string, accountId: string, period: string = 'today'): Promise<EarningStats> {
    const response = await fetch(`${API_BASE}/accounts/${accountId}/earnings/stats?period=${period}`, {
      headers: getHeaders(apiKey),
    });
    if (!response.ok) throw new Error('Failed to fetch earning stats');
    return response.json();
  },

  async listTransactions(apiKey: string, accountId: string, params?: {
    type?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<Transaction[]> {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.set('type', params.type);
    if (params?.startDate) queryParams.set('start_date', params.startDate);
    if (params?.endDate) queryParams.set('end_date', params.endDate);
    if (params?.limit) queryParams.set('limit', params.limit.toString());

    const response = await fetch(`${API_BASE}/accounts/${accountId}/earnings/transactions?${queryParams}`, {
      headers: getHeaders(apiKey),
    });
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return response.json();
  },

  // Fans
  async listFans(apiKey: string, accountId: string, status?: 'active' | 'expired' | 'all'): Promise<Fan[]> {
    const endpoint = status === 'active' 
      ? 'fans/active' 
      : status === 'expired' 
        ? 'fans/expired' 
        : 'fans';
    
    const response = await fetch(`${API_BASE}/accounts/${accountId}/${endpoint}`, {
      headers: getHeaders(apiKey),
    });
    if (!response.ok) throw new Error('Failed to fetch fans');
    return response.json();
  },

  // Message Attribution (for chatter tracking)
  async getMessageEarnings(apiKey: string, accountId: string, startDate: string, endDate: string): Promise<Transaction[]> {
    return this.listTransactions(apiKey, accountId, {
      type: 'message',
      startDate,
      endDate,
    });
  },
};

export default platformApi;
