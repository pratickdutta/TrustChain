'use client';
import { useState, useEffect } from 'react';
import useWalletStore from '@/store/walletStore';
import { authAPI, scoreAPI } from '@/lib/api';
import { StellarWalletsKit, Networks } from '@creit.tech/stellar-wallets-kit';
import { FreighterModule, FREIGHTER_ID } from '@creit.tech/stellar-wallets-kit/modules/freighter';
import { AlbedoModule } from '@creit.tech/stellar-wallets-kit/modules/albedo';
import { LobstrModule } from '@creit.tech/stellar-wallets-kit/modules/lobstr';
import { xBullModule } from '@creit.tech/stellar-wallets-kit/modules/xbull';

export default function WalletConnect({ compact = false }: { compact?: boolean }) {
  const { setWallet, setScore, setConnecting, isConnecting } = useWalletStore();
  const [pubKeyInput, setPubKeyInput] = useState('');
  const [mode, setMode] = useState<'freighter' | 'manual'>('freighter');
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        StellarWalletsKit.init({
          network: Networks.TESTNET,
          selectedWalletId: FREIGHTER_ID,
          modules: [
            new FreighterModule(),
            new AlbedoModule(),
            new LobstrModule(),
            new xBullModule(),
          ],
        });
        StellarWalletsKit.setTheme({
          "background": "rgba(18, 10, 34, 0.75)",
          "background-secondary": "rgba(255, 255, 255, 0.05)",
          "foreground-strong": "#ffffff",
          "foreground": "rgba(255, 255, 255, 0.9)",
          "foreground-secondary": "rgba(255, 255, 255, 0.6)",
          "primary": "#8B5CF6",
          "primary-foreground": "#ffffff",
          "transparent": "transparent",
          "lighter": "rgba(255, 255, 255, 0.1)",
          "light": "rgba(255, 255, 255, 0.05)",
          "light-gray": "rgba(255, 255, 255, 0.1)",
          "gray": "rgba(255, 255, 255, 0.2)",
          "danger": "#ef4444",
          "border": "rgba(255, 255, 255, 0.15)",
          "shadow": "0 8px 32px rgba(0, 0, 0, 0.6)",
          "border-radius": "16px",
          "font-family": "var(--font-sans), sans-serif",
        });
      } catch (e) {
        console.warn('Kit already initialized', e);
      }
    }
  }, []);

  const connectWalletsKit = async () => {
    setConnecting(true);
    setError('');
    try {

      const { address: pubKey } = await StellarWalletsKit.authModal();
      
      if (!pubKey) {
        throw new Error('Wallet connection was cancelled or failed.');
      }

      // Use the standard auth flow with the returned public key
      const { nonce } = await authAPI.challenge(pubKey);
      const { token, user } = await authAPI.verify(pubKey, nonce);
      setWallet(pubKey, token, user);
      
      const userScore = await scoreAPI.me();
      setScore(userScore);
    } catch (err: any) {
      console.error('Wallet connect error:', err);
      // Avoid showing error if user just closed the modal
      if (err.message && !err.message.includes('closed') && !err.message.includes('cancel')) {
        setError(err.message || 'Failed to authenticate');
      }
    } finally {
      setConnecting(false);
    }
  };

  const connectManual = async () => {
    if (!pubKeyInput.trim()) return;
    setConnecting(true);
    setError('');
    try {
      const { nonce } = await authAPI.challenge(pubKeyInput.trim());
      const { token, user } = await authAPI.verify(pubKeyInput.trim(), nonce);
      setWallet(pubKeyInput.trim(), token, user);
      const userScore = await scoreAPI.me();
      setScore(userScore);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setConnecting(false);
    }
  };

  if (compact) {
    return (
      <button onClick={connectWalletsKit} disabled={isConnecting} className="btn btn-primary">
        {isConnecting ? 'Connecting...' : '🔐 Connect Wallet'}
      </button>
    );
  }

  return (
    <div style={{ maxWidth: 420, margin: '0 auto' }}>
      <div className="glass-card" style={{ padding: 32 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 8, fontSize: '1.4rem' }}>Connect Your Wallet</h2>
        <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: 28 }}>
          Authenticate with your Stellar keypair to access TrustChain
        </p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {(['freighter', 'manual'] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                flex: 1, padding: '10px', borderRadius: 'var(--radius-md)',
                background: mode === m ? 'rgba(108,99,255,0.15)' : 'transparent',
                border: `1px solid ${mode === m ? 'rgba(108,99,255,0.5)' : 'var(--color-border)'}`,
                color: mode === m ? 'var(--color-primary-light)' : 'var(--color-text-secondary)',
                cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500,
                transition: 'all 0.2s',
              }}
            >
              {m === 'freighter' ? '🌟 Web3 Wallet' : '🔑 Public Key'}
            </button>
          ))}
        </div>

        {mode === 'freighter' ? (
          <div>
            <div style={{
              padding: 16, borderRadius: 'var(--radius-md)',
              background: 'rgba(108,99,255,0.06)', border: '1px solid rgba(108,99,255,0.2)',
              marginBottom: 20, fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.6,
            }}>
              <strong style={{ color: 'var(--color-primary-light)' }}>Multi-Wallet Support</strong> is here. 
              Connect securely using Freighter, Albedo, Lobstr, xBull, and more.
            </div>
            <button onClick={connectWalletsKit} disabled={isConnecting} className="btn btn-primary" style={{ width: '100%' }}>
              {isConnecting ? (
                <><span className="animate-spin" style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} /> Connecting...</>
              ) : '🌟 Connect Web3 Wallet'}
            </button>
            <p style={{ textAlign: 'center', marginTop: 12, fontSize: '0.78rem', color: 'var(--color-muted)' }}>
              Supports Freighter, Albedo, Lobstr, & xBull
            </p>
          </div>
        ) : (
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 8 }}>
              Your Stellar Public Key (starts with G...)
            </label>
            <input
              className="input"
              value={pubKeyInput}
              onChange={e => setPubKeyInput(e.target.value)}
              placeholder="GABC...XYZ"
              style={{ marginBottom: 16, fontFamily: 'monospace', fontSize: '0.8rem' }}
            />
            <button onClick={connectManual} disabled={isConnecting || !pubKeyInput} className="btn btn-primary" style={{ width: '100%' }}>
              {isConnecting ? 'Authenticating...' : 'Continue →'}
            </button>
            <p style={{ marginTop: 12, fontSize: '0.78rem', color: 'var(--color-muted)', lineHeight: 1.5 }}>
              💡 You can get a testnet public key from{' '}
              <a href="https://laboratory.stellar.org/#account-creator" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-light)' }}>
                Stellar Laboratory
              </a>
            </p>
          </div>
        )}

        {error && (
          <div style={{
            marginTop: 16, padding: 12, borderRadius: 'var(--radius-md)',
            background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.3)',
            color: '#FF4757', fontSize: '0.8rem',
          }}>
            ⚠️ {error}
          </div>
        )}
      </div>
    </div>
  );
}
