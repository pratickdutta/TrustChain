const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function getToken(): string | null {
  if (typeof window !== 'undefined') return localStorage.getItem('tc_token');
  return null;
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `API error ${res.status}`);
  }
  return data as T;
}

// ─── Auth ─────────────────────────────────────────────────────────────────
export const authAPI = {
  challenge: (pubKey: string) =>
    apiFetch<{ nonce: string; message: string }>('/auth/challenge', {
      method: 'POST',
      body: JSON.stringify({ pubKey }),
    }),

  verify: (pubKey: string, nonce: string, signature?: string) =>
    apiFetch<{ token: string; user: any }>('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ pubKey, nonce, signature }),
    }),
};

// ─── Users ────────────────────────────────────────────────────────────────
export const usersAPI = {
  me: () => apiFetch<any>('/users/me'),
  update: (data: { displayName?: string }) =>
    apiFetch<any>('/users/me', { method: 'PUT', body: JSON.stringify(data) }),
  getByPubKey: (pubKey: string) => apiFetch<any>(`/users/${pubKey}`),
  leaderboard: () => apiFetch<any[]>('/users'),
};

// ─── Score ────────────────────────────────────────────────────────────────
export const scoreAPI = {
  me: () => apiFetch<any>('/score/me'),
  recalculate: () =>
    apiFetch<any>('/score/recalculate', { method: 'POST' }),
};

// ─── Circles ──────────────────────────────────────────────────────────────
export const circlesAPI = {
  create: (data: { name: string; description?: string; isPublic?: boolean }) =>
    apiFetch<any>('/circles', { method: 'POST', body: JSON.stringify(data) }),
  list: () => apiFetch<any[]>('/circles'),
  public: () => apiFetch<any[]>('/circles/public'),
  get: (id: string) => apiFetch<any>(`/circles/${id}`),
  join: (id: string, inviteCode?: string) =>
    apiFetch<any>(`/circles/${id}/join`, {
      method: 'POST',
      body: JSON.stringify({ inviteCode }),
    }),
  attest: (id: string, targetPubKey: string, weight: number) =>
    apiFetch<any>(`/circles/${id}/attest`, {
      method: 'POST',
      body: JSON.stringify({ targetPubKey, weight }),
    }),
  leave: (id: string) =>
    apiFetch<any>(`/circles/${id}/leave`, { method: 'DELETE' }),
};

// ─── Loans ────────────────────────────────────────────────────────────────
export const loansAPI = {
  request: (data: { amount: number; currency?: string; durationDays?: number; purpose: string }) =>
    apiFetch<any>('/loans', { method: 'POST', body: JSON.stringify(data) }),
  list: () => apiFetch<any[]>('/loans'),
  get: (id: string) => apiFetch<any>(`/loans/${id}`),
  repay: (id: string, amount: number, txHash?: string) =>
    apiFetch<any>(`/loans/${id}/repay`, {
      method: 'POST',
      body: JSON.stringify({ amount, txHash }),
    }),
  globalStats: () => apiFetch<any>('/loans/stats/global'),
};

// ─── Stellar ──────────────────────────────────────────────────────────────
export const stellarAPI = {
  account: (pubKey: string) => apiFetch<any>(`/stellar/account/${pubKey}`),
  transactions: (pubKey: string) => apiFetch<any[]>(`/stellar/transactions/${pubKey}`),
  fundTestnet: (pubKey: string) =>
    apiFetch<any>('/stellar/fund-testnet', {
      method: 'POST',
      body: JSON.stringify({ pubKey }),
    }),
  network: () => apiFetch<any>('/stellar/network'),
};
