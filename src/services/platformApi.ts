// Platform API Integration Service
// Platform API integration via app.onlyfansapi.com

const API_BASE = 'https://app.onlyfansapi.com/api';

// Account IDs for each model (from OnlyFansAPI accounts endpoint)
export const ACCOUNT_IDS = {
  ashley: 'acct_71750a6057e34776b9b6ca0903b5ee1a',  // ashleyxmorris - 9778 subs
  izzie: 'acct_6140bb9805e9416a928d4d7a788f3939',   // izzierae - 11395 subs
  willow: 'acct_f968a6be8f2041dcb9d52f8113f2d258',  // willowxjoy - 1497 subs
  // olivia: 'acct_c423cf3f392c4025aba7cbbea507a9cb', // Olivia paid (not on dashboard)
  // lucinda: 'acct_62e65e4c2c0740b386cde14811762f4d', // Lucinda (dropped per Luke)
} as const;

// API key - fallback to built-in key if not set in localStorage
const DEFAULT_API_KEY = 'ofapi_Lk9Mh9QRXmdL17xMllrWFxp6FiWwx4uBHkIORdO5b9c8e63a';
const getApiKey = () => {
  return localStorage.getItem('platform-api-key') || DEFAULT_API_KEY;
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

// Parsed weekly earnings from the earning-statistics endpoint
export interface WeeklyEarnings {
  grossTotal: number;
  netTotal: number;
  tips: number;       // gross
  messages: number;   // gross (chat_messages / PPV)
  error?: string;
}

// Helper: get the start of the current week (Monday 00:00 UTC)
function getWeekStartTimestamp(): number {
  const now = new Date();
  const day = now.getUTCDay(); // 0=Sun, 1=Mon, ...
  const diff = day === 0 ? 6 : day - 1; // days since Monday
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - diff));
  return Math.floor(monday.getTime() / 1000);
}

// Parse the raw earning-statistics response into weekly earnings
function parseWeeklyEarnings(raw: any): WeeklyEarnings {
  const data = raw?.data || raw;
  const months = data?.list?.months || {};
  const weekStart = getWeekStartTimestamp();

  let grossTotal = 0;
  let netTotal = 0;
  let tips = 0;
  let messages = 0;

  for (const [, categories] of Object.entries(months)) {
    const cats = categories as Record<string, any>;
    for (const [catName, entries] of Object.entries(cats)) {
      if (!Array.isArray(entries)) continue;
      for (const entry of entries) {
        if (entry.time >= weekStart) {
          grossTotal += entry.gross || 0;
          netTotal += entry.net || 0;
          if (catName === 'tips') {
            tips += entry.gross || 0;
          } else if (catName === 'chat_messages') {
            messages += entry.gross || 0;
          }
        }
      }
    }
  }

  return { grossTotal, netTotal, tips, messages };
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

  // Daily Earning Stats — parse per-transaction data from earning-statistics endpoint
  async getDailyEarningStats(accountId: string): Promise<{ grossToday: number; netToday: number; transactions: Array<{ time: number; gross: number; net: number; category: string }> } | null> {
    try {
      const response = await fetch(`${API_BASE}/${accountId}/payouts/earning-statistics`, {
        headers: getHeaders(),
      });
      if (!response.ok) return null;
      const raw = await response.json();
      const data = raw.data || raw;
      const months = data?.list?.months || {};
      const todayStr = new Date().toISOString().split('T')[0];
      let grossToday = 0;
      let netToday = 0;
      const transactions: Array<{ time: number; gross: number; net: number; category: string }> = [];
      for (const [, categories] of Object.entries(months)) {
        const cats = categories as Record<string, any>;
        for (const [catName, entries] of Object.entries(cats)) {
          if (!Array.isArray(entries)) continue;
          for (const entry of entries) {
            const entryDate = new Date(entry.time * 1000).toISOString().split('T')[0];
            if (entryDate === todayStr) {
              grossToday += entry.gross || 0;
              netToday += entry.net || 0;
              transactions.push({ time: entry.time, gross: entry.gross || 0, net: entry.net || 0, category: catName });
            }
          }
        }
      }
      return { grossToday, netToday, transactions };
    } catch (e) {
      console.error('Failed to fetch daily earning stats:', e);
      return null;
    }
  },

  // Get daily earnings for all accounts
  async getAllDailyEarnings(): Promise<Record<string, { grossToday: number; netToday: number; transactions: Array<{ time: number; gross: number; net: number; category: string }> } | null>> {
    const results: Record<string, { grossToday: number; netToday: number; transactions: Array<{ time: number; gross: number; net: number; category: string }> } | null> = {};
    for (const [name, id] of Object.entries(ACCOUNT_IDS)) {
      results[name] = await this.getDailyEarningStats(id);
    }
    return results;
  },

  // Earning Statistics (raw — returns the full API response)
  async getEarningStats(accountId: string): Promise<EarningStats | null> {
    try {
      const response = await fetch(`${API_BASE}/${accountId}/payouts/earning-statistics`, {
        headers: getHeaders(),
      });
      if (!response.ok) {
        console.error(`[OF API] earning-statistics ${accountId} HTTP ${response.status}`);
        return null;
      }
      return response.json();
    } catch (e) {
      console.error('Failed to fetch earning stats:', e);
      return null;
    }
  },

  // Get all accounts earning stats
  async getAllEarningStats(): Promise<Record<string, EarningStats | null>> {
    const results: Record<string, EarningStats | null> = {};
    for (const [name, id] of Object.entries(ACCOUNT_IDS)) {
      results[name] = await this.getEarningStats(id);
    }
    return results;
  },

  // Weekly Earnings — parsed from earning-statistics
  async getWeeklyEarnings(accountId: string): Promise<WeeklyEarnings> {
    try {
      const response = await fetch(`${API_BASE}/${accountId}/payouts/earning-statistics`, {
        headers: getHeaders(),
      });
      if (!response.ok) {
        console.error(`[OF API] weekly earnings ${accountId} HTTP ${response.status}`);
        return { grossTotal: 0, netTotal: 0, tips: 0, messages: 0, error: `HTTP ${response.status}` };
      }
      const raw = await response.json();
      console.log(`[OF API] Raw earning-statistics for ${accountId}:`, JSON.stringify(raw).slice(0, 500));
      const weekly = parseWeeklyEarnings(raw);
      console.log(`[OF API] Parsed weekly for ${accountId}:`, weekly);
      return weekly;
    } catch (e) {
      console.error(`[OF API] Failed weekly earnings ${accountId}:`, e);
      return { grossTotal: 0, netTotal: 0, tips: 0, messages: 0, error: String(e) };
    }
  },

  // Get weekly earnings for all accounts
  async getAllWeeklyEarnings(): Promise<Record<string, WeeklyEarnings>> {
    const results: Record<string, WeeklyEarnings> = {};
    for (const [name, id] of Object.entries(ACCOUNT_IDS)) {
      results[name] = await this.getWeeklyEarnings(id);
    }
    console.log('[OF API] All weekly earnings:', results);
    return results;
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
    // Use accounts endpoint instead of individual account endpoint (more reliable)
    try {
      const response = await fetch(`${API_BASE}/accounts`, {
        headers: getHeaders(),
      });
      if (!response.ok) return 0;
      const accounts = await response.json();
      const account = accounts.find((a: any) => a.id === accountId);
      return account?.onlyfans_user_data?.subscribersCount || 0;
    } catch (e) {
      console.error('Failed to fetch subscriber count:', e);
      return 0;
    }
  },
};

export default platformApi;
