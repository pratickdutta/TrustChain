const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

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
  leaderboard: (filter?: string) => apiFetch<any[]>(filter ? `/users?filter=${filter}` : '/users'),
};

// ─── Score ────────────────────────────────────────────────────────────────
export const scoreAPI = {
  me: () => apiFetch<any>('/score/me'),
  recalculate: () =>
    apiFetch<any>('/score/recalculate', { method: 'POST' }),
  devBoost: () =>
    apiFetch<any>('/dev/boost-score', { method: 'POST' }),
};

// ─── Circles ──────────────────────────────────────────────────────────────
export const circlesAPI = {
  create: (data: { name: string; description?: string; isPublic?: boolean; circleRules?: string; socialLink?: string }) =>
    apiFetch<any>('/circles', { method: 'POST', body: JSON.stringify(data) }),
  list: () => apiFetch<any[]>('/circles'),
  public: () => apiFetch<any[]>('/circles/public'),
  search: (q: string) => apiFetch<any[]>(`/circles?q=${encodeURIComponent(q)}`),
  searchByUCI: (uci: string) => apiFetch<any[]>(`/circles?uci=${encodeURIComponent(uci)}`),
  get: (id: string) => apiFetch<any>(`/circles/${id}`),
  patch: (id: string, data: { name?: string; description?: string; circleRules?: string; isPublic?: boolean; borrowApprovalEnabled?: boolean; socialLink?: string }) =>
    apiFetch<any>(`/circles/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  join: (id: string, inviteCode?: string) =>
    apiFetch<any>(`/circles/${id}/join`, {
      method: 'POST',
      body: JSON.stringify({ inviteCode }),
    }),
  approveJoin: (id: string, targetPubKey: string, action: 'APPROVE' | 'REJECT') =>
    apiFetch<any>(`/circles/${id}/approve-join`, {
      method: 'POST',
      body: JSON.stringify({ targetPubKey, action }),
    }),
  attest: (id: string, targetPubKey: string, weight: number) =>
    apiFetch<any>(`/circles/${id}/attest`, {
      method: 'POST',
      body: JSON.stringify({ targetPubKey, weight }),
    }),
  leave: (id: string) =>
    apiFetch<any>(`/circles/${id}/leave`, { method: 'DELETE' }),
  delete: (id: string) =>
    apiFetch<any>(`/circles/${id}`, { method: 'DELETE' }),
};


// ─── Loans ────────────────────────────────────────────────────────────────
export const loansAPI = {
  request: (data: { amount: number; currency?: string; durationDays?: number; purpose: string; fundingSource?: string; lenderKey?: string; poolId?: string }) =>
    apiFetch<any>('/loans', { method: 'POST', body: JSON.stringify(data) }),
  list: () => apiFetch<any[]>('/loans'),
  get: (id: string) => apiFetch<any>(`/loans/${id}`),
  repay: (id: string, amount: number, txHash?: string) =>
    apiFetch<any>(`/loans/${id}/repay`, {
      method: 'POST',
      body: JSON.stringify({ amount, txHash }),
    }),
  markDefault: (id: string) =>
    apiFetch<any>(`/loans/${id}/default`, { method: 'POST' }),
  globalStats: () => apiFetch<any>('/loans/stats/global'),
};

// ─── Lender ───────────────────────────────────────────────────────────────
export const lenderAPI = {
  getSettings: () => apiFetch<any>('/lender/settings'),
  updateSettings: (data: { isLender?: boolean; maxExposure?: number; manualReview?: boolean; minBorrowerScore?: number }) =>
    apiFetch<any>('/lender/settings', { method: 'PUT', body: JSON.stringify(data) }),
  inbox: () => apiFetch<any[]>('/lender/inbox'),
  decide: (loanId: string, decision: 'APPROVE' | 'REJECT', note?: string) =>
    apiFetch<any>(`/lender/inbox/${loanId}/decide`, {
      method: 'POST',
      body: JSON.stringify({ decision, note }),
    }),
  portfolio: () => apiFetch<any>('/lender/portfolio'),
  browse: () => apiFetch<any[]>('/lender/browse'),
};

// ─── Pools ────────────────────────────────────────────────────────────────
export const poolsAPI = {
  getPayouts: () => apiFetch<any[]>('/pools/payouts'),
  browse: () => apiFetch<any[]>('/pools/browse'),
  updateSettings: (circleId: string, data: { openToOutside?: boolean; manualApproval?: boolean; minBorrowerScore?: number; maxLoanPerBorrower?: number }) =>
    apiFetch<any>(`/pools/${circleId}/settings`, { method: 'PUT', body: JSON.stringify(data) }),
  disablePool: (circleId: string) =>
    apiFetch<any>(`/pools/${circleId}/settings`, { method: 'DELETE' }),
  deposit: (circleId: string, amount: number) =>
    apiFetch<any>(`/pools/${circleId}/deposit`, { method: 'POST', body: JSON.stringify({ amount }) }),
  withdraw: (circleId: string, amount: number) =>
    apiFetch<any>(`/pools/${circleId}/withdraw`, { method: 'POST', body: JSON.stringify({ amount }) }),
  getUserDeposit: (circleId: string) =>
    apiFetch<{ total: number; accruedInterest: number; deposits: any[] }>(`/pools/${circleId}/deposit`),
  inbox: (circleId: string) => apiFetch<any[]>(`/pools/${circleId}/inbox`),
  decide: (circleId: string, loanId: string, decision: 'APPROVE' | 'REJECT', note?: string) =>
    apiFetch<any>(`/pools/${circleId}/inbox/${loanId}/decide`, {
      method: 'POST',
      body: JSON.stringify({ decision, note }),
    }),
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

  // Advanced Feature: Fee Bump Sponsorship (Gasless Transactions)
  // Wraps a user-signed XDR envelope in a FeeBumpTransaction so the protocol
  // treasury pays the Stellar network fee, giving users a gasless experience.
  sponsorTx: (signedXdr: string) =>
    apiFetch<{ success: boolean; hash: string; explorerLink: string; message: string }>(
      '/stellar/sponsor-tx',
      { method: 'POST', body: JSON.stringify({ signedXdr }) }
    ),
};

