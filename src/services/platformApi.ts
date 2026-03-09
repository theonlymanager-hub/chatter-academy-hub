// Platform API Integration Service
// OnlyFans API integration via app.onlyfansapi.com

const API_BASE = 'https://app.onlyfansapi.com/api';

// Account IDs for each model
export const ACCOUNT_IDS = {
  ashley: 'acct_71750a6057e34776b9b6ca0903b5ee1a',
  izzie: 'acct_6140bb9805e9416a928d4d7a788f3939',
  willow: 'acct_f968a6be8f2041dcb9d52f8113f2d258',
  lucinda: 'acct_62e65e4c2c0740b386cde14811762f4d',
} as const;

// Note: API key should be stored securely - in production use environment variables
// For now using localStorage for demo purposes
const getApiKey = () => {
  return localStorage.getItem('platform-api-key') || '';
};

const getHeaders = (apiKey?: string) => ({
  'Authorization': `Bearer ${apiKey || getApiKey()}`,
  'Content-Type': 'application/json',
});

export interface AccountStats {
  id: string;
  name: string;
  subscribersCount: number;
  postsCount: number;
  favoritesCount: number;
  location: string;
  subscribedOnData?: {
    price: number;
    status: string;
  };
}

export interface Chat {
  id: string;
  fan: {
    id: number;
    name: string;
    username: string;
    subscribedOnData?: {
      totalSumm: number;
      status: string;
    };
    lastSeen?: string;
  };
  lastMessage?: {
    text: string;
    createdAt: string;
  };
}

export interface ChatMessage {
  id: string;
  text: string;
  fromUser: boolean;
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
}

export interface Fan {
  id: number;
  username: string;
  name: string;
  totalSpent: number;
  status: 'active' | 'expired';
  subscribedAt?: string;
  lastSeen?: string;
}

// API Functions
export const platformApi = {
  // Set API Key
  setApiKey(key: string) {
    localStorage.setItem('platform-api-key', key);
  },

  getApiKey() {
    return getApiKey();
  },

  // Account Stats
  async getAccountStats(accountId: string): Promise<AccountStats | null> {
    try {
      const response = await fetch(`${API_BASE}/${accountId}`, {
        headers: getHeaders(),
      });
      if (!response.ok) return null;
      return response.json();
    } catch (e) {
      console.error('Failed to fetch account stats:', e);
      return null;
    }
  },

  // Get all accounts stats
  async getAllAccountsStats(): Promise<Record<string, AccountStats | null>> {
    const results: Record<string, AccountStats | null> = {};
    for (const [name, id] of Object.entries(ACCOUNT_IDS)) {
      results[name] = await this.getAccountStats(id);
    }
    return results;
  },

  // Chats
  async listChats(accountId: string, limit: number = 20): Promise<Chat[]> {
    try {
      const response = await fetch(`${API_BASE}/${accountId}/chats?limit=${limit}`, {
        headers: getHeaders(),
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data.data || [];
    } catch (e) {
      console.error('Failed to fetch chats:', e);
      return [];
    }
  },

  // Get chat messages
  async getChatMessages(accountId: string, chatId: string): Promise<ChatMessage[]> {
    try {
      const response = await fetch(`${API_BASE}/${accountId}/chats/${chatId}/messages`, {
        headers: getHeaders(),
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data.data || [];
    } catch (e) {
      console.error('Failed to fetch messages:', e);
      return [];
    }
  },

  // Get top spenders from recent chats
  async getTopSpenders(accountId: string, limit: number = 10): Promise<Fan[]> {
    try {
      const chats = await this.listChats(accountId, 50);
      const fans: Fan[] = chats
        .filter(c => c.fan?.subscribedOnData?.totalSumm > 0)
        .map(c => ({
          id: c.fan.id,
          username: c.fan.username,
          name: c.fan.name,
          totalSpent: c.fan.subscribedOnData?.totalSumm || 0,
          status: c.fan.subscribedOnData?.status === 'active' ? 'active' : 'expired',
          lastSeen: c.fan.lastSeen,
        }))
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, limit);
      return fans;
    } catch (e) {
      console.error('Failed to get top spenders:', e);
      return [];
    }
  },

  // Calculate total revenue from recent chats (rough estimate)
  async getRevenueEstimate(accountId: string): Promise<number> {
    try {
      const chats = await this.listChats(accountId, 100);
      return chats.reduce((sum, c) => sum + (c.fan?.subscribedOnData?.totalSumm || 0), 0);
    } catch (e) {
      return 0;
    }
  },

  // Get active subscribers count
  async getActiveSubscribers(accountId: string): Promise<number> {
    const stats = await this.getAccountStats(accountId);
    return stats?.subscribersCount || 0;
  },
};

export default platformApi;
