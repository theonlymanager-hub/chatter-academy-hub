// OnlyFans API Integration
// Docs: https://docs.onlyfansapi.com
// API Base: https://app.onlyfansapi.com/api/

const OF_API_BASE = 'https://app.onlyfansapi.com/api';
const OF_API_KEY = 'ofapi_Lk9Mh9QRXmdL17xMllrWFxp6FiWwx4uBHkIORdO5b9c8e63a';

interface ApiOptions {
  method?: string;
  params?: Record<string, string | number | boolean>;
  body?: Record<string, unknown>;
}

async function ofApiRequest(endpoint: string, options: ApiOptions = {}) {
  const { method = 'GET', params, body } = options;
  
  const url = new URL(`${OF_API_BASE}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
  }

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${OF_API_KEY}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const response = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OF API Error ${response.status}: ${errorText}`);
  }

  return response.json();
}

// ============ ACCOUNTS ============

export async function listAccounts() {
  return ofApiRequest('/accounts');
}

export async function getAccountStatus(accountId: string) {
  return ofApiRequest(`/accounts/${accountId}`);
}

// ============ EARNINGS ============

export async function getEarningStatistics(accountId: string, period: 'daily' | 'weekly' | 'monthly' = 'daily') {
  return ofApiRequest(`/accounts/${accountId}/earning-statistics`, {
    params: { period },
  });
}

export async function listTransactions(accountId: string, options: { offset?: number; limit?: number; type?: string } = {}) {
  return ofApiRequest(`/accounts/${accountId}/transactions/earnings`, {
    params: {
      offset: options.offset || 0,
      limit: options.limit || 50,
      ...(options.type ? { type: options.type } : {}),
    },
  });
}

// ============ FANS ============

export async function listAllFans(accountId: string, options: { offset?: number; limit?: number; sort?: string } = {}) {
  return ofApiRequest(`/accounts/${accountId}/fans`, {
    params: {
      offset: options.offset || 0,
      limit: options.limit || 50,
      sort: options.sort || 'total_spent_desc',
    },
  });
}

export async function listActiveFans(accountId: string, options: { offset?: number; limit?: number } = {}) {
  return ofApiRequest(`/accounts/${accountId}/fans/active`, {
    params: {
      offset: options.offset || 0,
      limit: options.limit || 50,
    },
  });
}

export async function listExpiredFans(accountId: string, options: { offset?: number; limit?: number } = {}) {
  return ofApiRequest(`/accounts/${accountId}/fans/expired`, {
    params: {
      offset: options.offset || 0,
      limit: options.limit || 50,
    },
  });
}

export async function listLatestFans(accountId: string, options: { offset?: number; limit?: number } = {}) {
  return ofApiRequest(`/accounts/${accountId}/fans/latest`, {
    params: {
      offset: options.offset || 0,
      limit: options.limit || 50,
    },
  });
}

// ============ CHATS ============

export async function listChats(accountId: string, options: { offset?: number; limit?: number } = {}) {
  return ofApiRequest(`/accounts/${accountId}/chats`, {
    params: {
      offset: options.offset || 0,
      limit: options.limit || 50,
    },
  });
}

export async function listChatMessages(accountId: string, chatId: string, options: { offset?: number; limit?: number } = {}) {
  return ofApiRequest(`/accounts/${accountId}/chats/${chatId}/messages`, {
    params: {
      offset: options.offset || 0,
      limit: options.limit || 50,
    },
  });
}

// ============ MASS MESSAGING ============

export async function sendMassMessage(accountId: string, message: {
  text: string;
  mediaIds?: number[];
  price?: number;
  scheduledAt?: string;
  fanListIds?: string[];
}) {
  return ofApiRequest(`/accounts/${accountId}/mass-messages`, {
    method: 'POST',
    body: message as Record<string, unknown>,
  });
}

// ============ MEDIA / VAULT ============

export async function listVaultMedia(accountId: string, options: { offset?: number; limit?: number } = {}) {
  return ofApiRequest(`/accounts/${accountId}/vault/media`, {
    params: {
      offset: options.offset || 0,
      limit: options.limit || 50,
    },
  });
}

export async function listVaultLists(accountId: string) {
  return ofApiRequest(`/accounts/${accountId}/vault/lists`);
}

// ============ HELPER: Get all account IDs ============

export async function getAllAccountIds(): Promise<{ id: string; name: string }[]> {
  const accounts = await listAccounts();
  return (accounts?.data || []).map((a: { id: string; username?: string; name?: string }) => ({
    id: a.id,
    name: a.username || a.name || a.id,
  }));
}

// ============ HELPER: Calculate LTV ============

export async function calculateModelLTV(accountId: string): Promise<{
  totalRevenue: number;
  activeFanCount: number;
  ltv: number;
  topSpenders: Array<{ name: string; totalSpent: number }>;
}> {
  const [earnings, activeFans, topFans] = await Promise.all([
    getEarningStatistics(accountId, 'monthly'),
    listActiveFans(accountId, { limit: 1 }),
    listAllFans(accountId, { limit: 10, sort: 'total_spent_desc' }),
  ]);

  const totalRevenue = earnings?.data?.total || 0;
  const activeFanCount = activeFans?.meta?.total || activeFans?.data?.length || 0;
  const ltv = activeFanCount > 0 ? totalRevenue / activeFanCount : 0;

  const topSpenders = (topFans?.data || []).slice(0, 5).map((f: { name?: string; username?: string; spending?: { total?: number } }) => ({
    name: f.name || f.username || 'Unknown',
    totalSpent: f.spending?.total || 0,
  }));

  return { totalRevenue, activeFanCount, ltv, topSpenders };
}
