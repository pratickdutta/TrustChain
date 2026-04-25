# 🔐 Security Policy

## Supported Versions

| Version | Status      |
|---------|-------------|
| 1.0.x   | ✅ Active   |
| < 1.0   | ❌ Unsupported |

---

## 🛡️ Security Architecture

### 1. Authentication & Authorization
- **Wallet-Signed Nonces**: All authentication is cryptographic. The server issues a UUID nonce, the user signs it with their Freighter private key, and the server verifies the ed25519 signature using `@stellar/stellar-sdk`. No passwords ever exist.
- **JWT Tokens**: Session tokens are 24-hour JWTs signed with a 32-byte `JWT_SECRET` stored in environment variables. All sensitive API routes require a valid `Authorization: Bearer <token>` header.
- **Admin Gating**: Privileged operations (Score recalculation, full user listing) require the caller's public key to match `NEXT_PUBLIC_ADMIN_PUBKEY` set in the server environment.
- **Nonce TTL**: Nonces expire in 5 minutes via MongoDB TTL index. Replaying a captured nonce after expiry results in a hard `400 Nonce expired` rejection.

### 2. Smart Contract Security (Soroban)
- **Soroban Rust Contracts**: All loan lifecycle, score registry, and circle anchoring logic is implemented in Rust using the Soroban SDK. Rust's type system eliminates entire classes of memory safety bugs (overflows, use-after-free) at the compiler level.
- **On-Chain Immutability**: Once a loan is issued or a score is stored on-chain, the transaction is permanent on the Stellar Testnet ledger and cannot be altered by the application layer.
- **Input Validation**: All contract entry points validate input amounts, borrower IDs, and token addresses before execution. Negative amounts and zero-duration loans are rejected at the contract level.
- **Deployed Contracts (Testnet)**:
  - Loan: `CCGAK2YJ2WPGE74QTYPXHX5NONQWZMTF6NY2JWHLGDZZC3MYPDBUVWMV`
  - Score: `CB6P6UZEYJ77DGSLRIGJY4YK4HFMYGQNZAIJQWXYTVZ2A4STSXMIJP2W`
  - Circle: `CB4ED6IJTJSSG7WJVL7ZK43EU4NVYL5WT2COT2METRE4FZODSCRM7HE7`

### 3. API Security
- **Input Validation**: All API routes validate the shape of request bodies and reject malformed input with `400` errors before touching the database.
- **CORS**: Next.js API routes restrict cross-origin requests by default.
- **Rate Limiting**: The Vercel deployment applies request-level rate limiting. The nonce system inherently throttles authentication attempts (1 nonce per `pubKey` at a time).
- **No Sensitive Data Exposure**: API responses never return internal MongoDB `_id` fields, JWT secrets, or other sensitive server-side values to the client.

### 4. Fee Sponsorship (Advanced Feature Security)
- **Server-Side Signing**: The `STELLAR_SPONSOR_SECRET_KEY` (treasury key) is only ever accessed server-side in the `/api/stellar/sponsor-tx` route. It is never exposed to the client.
- **Auth-Gated**: The sponsorship endpoint requires a valid JWT — unauthenticated callers cannot submit arbitrary XDR for sponsorship.
- **XDR Validation**: The inner transaction XDR is parsed against `Networks.TESTNET` before wrapping. Invalid or mainnet XDR will throw a parse error and be rejected.

### 5. Environment Variables
All secrets are managed via environment variables and are never committed to version control:

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | JWT signing key (min 32 chars) |
| `NEXT_PUBLIC_ADMIN_PUBKEY` | Admin wallet public key |
| `STELLAR_SPONSOR_SECRET_KEY` | Protocol treasury Freighter key for fee bumps |

---

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability in TrustChain, **please do NOT open a public GitHub issue**.

Instead, please contact the maintainer directly:

- **Email**: [pratickdutta006@gmail.com](mailto:pratickdutta006@gmail.com)
- **GitHub**: [@pratickdutta](https://github.com/pratickdutta)

Please include:
1. A clear description of the vulnerability
2. Steps to reproduce
3. Potential impact assessment
4. Any suggested fix (optional)

We aim to respond to all security reports within **48 hours** and will credit responsible disclosure.

---

## ✅ Security Checklist

- [x] Cryptographic wallet-signature authentication
- [x] JWT with 24-hour expiry
- [x] Admin-only endpoint gating
- [x] Nonce expiry (5 min TTL via MongoDB)
- [x] Rust smart contracts (memory-safe by default)
- [x] No secret keys in client-side code
- [x] Fee sponsorship key server-side only
- [x] Input validation on all API routes
- [x] No sensitive data in API responses
- [x] Environment variable secrets management
- [x] Deployed on Vercel (DDoS protection, TLS enforced)
- [x] Public GitHub repository (transparent, auditable)
