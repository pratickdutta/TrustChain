import { create } from 'zustand';

export interface User {
  id: string;
  stellarPublicKey: string;
  displayName: string;
  createdAt: string;
  lastActiveAt: string;
  kycLevel: number;
  trustTokens: number;
}

export interface CreditScore {
  totalScore: number;
  trustScore: number;
  behaviorScore: number;
  activityScore: number;
  tier: string;
  computedAt: string;
  version: number;
}

interface WalletState {
  pubKey: string | null;
  token: string | null;
  user: User | null;
  score: CreditScore | null;
  isConnecting: boolean;
  isConnected: boolean;

  // Setters
  setWallet: (pubKey: string, token: string, user: User) => void;
  setScore: (score: CreditScore) => void;
  setUser: (user: User) => void;
  disconnect: () => void;
  setConnecting: (val: boolean) => void;
}

const useWalletStore = create<WalletState>((set) => ({
  pubKey: null,
  token: null,
  user: null,
  score: null,
  isConnecting: false,
  isConnected: false,

  setWallet: (pubKey, token, user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tc_token', token);
      localStorage.setItem('tc_pubkey', pubKey);
    }
    set({ pubKey, token, user, isConnected: true, isConnecting: false });
  },

  setScore: (score) => set({ score }),
  setUser: (user) => set({ user }),

  disconnect: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tc_token');
      localStorage.removeItem('tc_pubkey');
    }
    set({ pubKey: null, token: null, user: null, score: null, isConnected: false });
  },

  setConnecting: (val) => set({ isConnecting: val }),
}));

export default useWalletStore;
