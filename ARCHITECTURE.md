# TrustChain — Architecture Document

> **Version:** 1.0.0 | **Network:** Stellar Testnet | **Status:** MVP (Blue Belt)

---

## 1. System Overview

TrustChain is a decentralized micro-credit infrastructure built on the Stellar blockchain. The architecture follows a layered approach separating client, API, application logic, and blockchain concerns.

```
┌──────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                 │
│   Next.js 14 (App Router) · TypeScript · Zustand · Tailwind CSS     │
│   Pages: Landing · Dashboard · Circles · Loans · Leaderboard         │
└──────────────────────────────────┬───────────────────────────────────┘
                                   │ HTTPS REST API
┌──────────────────────────────────▼───────────────────────────────────┐
│                           API LAYER                                   │
│         Node.js / Express · Helmet · CORS · Rate Limiting            │
│   Routes: /auth · /users · /circles · /loans · /score · /stellar    │
└─────┬────────────────┬──────────────────┬────────────────┬───────────┘
      │                │                  │                │
┌─────▼──────┐  ┌──────▼────────┐  ┌─────▼──────┐  ┌─────▼──────────┐
│    Auth    │  │ Credit Engine │  │    Loan    │  │  Trust Graph   │
│  Service   │  │  (Scoring)    │  │   Engine   │  │   Manager      │
│            │  │  T·B·A Model  │  │  Tiers     │  │  Attestations  │
└─────┬──────┘  └──────┬────────┘  └─────┬──────┘  └─────┬──────────┘
      │                │                  │                │
┌─────▼────────────────▼──────────────────▼────────────────▼──────────┐
│                          DATA LAYER                                   │
│    In-Memory (MVP) → PostgreSQL + MongoDB + Redis (Production)       │
└──────────────────────────────────┬───────────────────────────────────┘
                                   │
┌──────────────────────────────────▼───────────────────────────────────┐
│                     STELLAR BLOCKCHAIN LAYER                          │
│   Stellar SDK · Horizon API · Friendbot (Testnet) · Stellar Expert  │
│   Assets: XLM (native) · TRUST (custom Stellar asset)               │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Architecture

### 2.1 Frontend (Next.js 14)

```
frontend/src/
├── app/
│   ├── layout.tsx          # Root layout, SEO metadata
│   ├── globals.css         # Design system, CSS variables, components
│   ├── page.tsx            # Landing page (hero, how-it-works, connect)
│   ├── dashboard/page.tsx  # User dashboard (score, loans, stellar account)
│   ├── circles/page.tsx    # Trust circles (create, join, attest)
│   ├── loans/page.tsx      # Loan center (request, repay, history)
│   └── leaderboard/page.tsx# Community leaderboard
├── components/
│   ├── Navbar.tsx          # Navigation with wallet connection
│   ├── ScoreGauge.tsx      # SVG credit score gauge component
│   └── WalletConnect.tsx   # Freighter + manual key connection
├── lib/
│   └── api.ts              # Typed API client (all backend endpoints)
└── store/
    └── walletStore.ts      # Zustand wallet/auth state
```

**Key Design Decisions:**
- Server Components for layouts (SEO)
- Client Components for interactive elements (wallet, score)
- Zustand over Context for wallet state (simpler, no provider wrapping)
- CSS Variables for theming instead of Tailwind utility flood

### 2.2 Backend (Node.js / Express)

```
backend/src/
├── server.js               # Express app, middleware, route mounting
├── db.js                   # In-memory database (Map-based, MVP)
├── middleware/
│   └── auth.js             # JWT verification middleware
├── routes/
│   ├── auth.js             # POST /challenge, POST /verify
│   ├── users.js            # GET/PUT /me, GET /:pubKey
│   ├── circles.js          # CRUD circles + attestations
│   ├── loans.js            # Request, list, repay + global stats
│   ├── score.js            # Score fetch and recalculation
│   └── stellar.js          # Account info, tx history, Friendbot
└── services/
    ├── creditEngine.js     # T·B·A scoring algorithm
    └── stellar.js          # Stellar SDK integration
```

---

## 3. Credit Scoring Algorithm

### Formula
```
Final Score (0–1000) = T + B + A
```

| Component | Weight | Range | Description |
|-----------|--------|-------|-------------|
| Trust Score (T) | 40% | 0–400 | PageRank-inspired graph attestation |
| Behavior Score (B) | 40% | 0–400 | Repayment history & consistency |
| Activity Score (A) | 20% | 0–200 | Wallet age, circles, transactions |

### Trust Score Graph Algorithm
```
T(u) = Σ [w(v,u) · normalized_score(v)] for all attesters v
     × 400 (scale to max weight)

Attestation weight w(v,u):
  Base:              0.5
  Time bonus:       +0.1 (after 30 days)
  Credibility bonus: +0.15 (attester repaid a loan)
  Credibility penalty: -0.3 (attester defaulted)
```

### Behavior Score
```
B = (on_time_repayments / total_loans) × 320
  + active_days_streak × 0.5
  - default_count × 80
  - overdue_days × 2
  [clamped to 0–400]
```

### Activity Score
```
A = min(80, wallet_age_days × 0.5)
  + min(60, circle_count × 20)
  + min(60, attestations_given × 10)
  [clamped to 0–200]
```

---

## 4. Authentication Flow

```
1. Client sends pubKey to POST /api/auth/challenge
2. Server generates UUID nonce, stores with 5min expiry
3. Client receives nonce string
4. (Freighter) Client signs nonce via freighter.signMessage()
5. Client sends { pubKey, nonce, signature } to POST /api/auth/verify
6. Server verifies nonce match (Phase 1) / signature (Phase 2)
7. Server creates/fetches user record, issues JWT (24h)
8. JWT stored in localStorage, sent as Bearer token on all API calls
```

---

## 5. Loan Lifecycle

```
States: DRAFT → SUBMITTED → APPROVED → [DISBURSED] → REPAYING → REPAID
                                    ↘ OVERDUE → DEFAULTED

Tier Eligibility:
  Bronze:   Score ≥ 450, max $50,  14 days, 2% TRUST fee
  Silver:   Score ≥ 600, max $200, 30 days, 1.5% TRUST fee  
  Gold:     Score ≥ 750, max $1000, 90 days, 1% TRUST fee
  Platinum: Score ≥ 900, max $5000, 180 days, 0.5% TRUST fee
```

---

## 6. Stellar Integration

### Testnet Operations
| Operation | Method | Details |
|-----------|--------|---------|
| Account Lookup | `server.loadAccount(pubKey)` | XLM + TRUST balances |
| Fund Account | Friendbot HTTP GET | `friendbot.stellar.org?addr=...` |
| Transaction History | `server.payments().forAccount()` | Last 10 payments |
| Explorer Links | `stellar.expert/explorer/testnet` | Account + tx links |

### Mainnet (Phase 2 Plan)
- Loan disbursement via `Operation.payment()` XLM/USDC
- TRUST token issuance via `Operation.payment()` custom asset
- Soroban contracts for loan agreements
- Horizon streaming for real-time repayment detection

---

## 7. Security Measures

| Layer | Measure |
|-------|---------|
| API | Helmet.js security headers |
| API | Rate limiting: 100 req/min/IP |
| API | CORS allowlist (frontend URL only) |
| Auth | JWT HS256, 24h expiry |
| Auth | Nonce-based challenge (5min TTL) |
| Trust | Sybil resistance: bidirectional attestation required |
| Trust | Attestation cooldown enforced per pair |
| Trust | Circle max 20 members, creator cannot leave |
| Data | Zod schema validation on all inputs |
| Data | Parameterized queries (Prisma — Phase 2) |

---

## 8. Data Flow Diagram

```
User Connects Wallet
        │
        ▼
  GET /auth/challenge ──► Server generates nonce
        │
        ▼ (user signs with Freighter)
  POST /auth/verify ◄──── Verify nonce → Issue JWT
        │
        ▼
  Dashboard loads:
    ├── GET /users/me      ──► User profile + loans + circles
    ├── GET /score/me      ──► T·B·A credit score
    └── GET /stellar/account/:key ──► XLM + TRUST balances
        │
        ▼
  User joins circle:
    POST /circles/:id/attest ──► Trust graph updated
    POST /score/recalculate  ──► Scores recomputed for all members
        │
        ▼
  User requests loan:
    POST /loans ──► Eligibility check → Tier match → Loan created
        │
        ▼
  User repays:
    POST /loans/:id/repay ──► Score updated (+ TRUST tokens if on-time)
```

---

## 9. Deployment Architecture

```
Production (Phase 2):
  Frontend: Vercel (Next.js SSR/SSG)
  Backend:  Railway / Render (Node.js)
  Database: PostgreSQL (Supabase) + MongoDB Atlas + Upstash Redis
  Blockchain: Stellar Mainnet

Development (Phase 1 / MVP):
  Frontend: localhost:3000
  Backend:  localhost:4000
  Database: In-memory (Map-based)
  Blockchain: Stellar Testnet
```

---

## 10. Future Architecture Additions

| Feature | Technology |
|---------|-----------|
| Soroban loan contracts | Rust + stellar-sdk (soroban) |
| Real-time score updates | WebSocket (ws library — scaffolded) |
| Email notifications | Resend / SendGrid |
| AI risk scoring | Python FastAPI (TensorFlow/scikit-learn) |
| USDC support | Stellar Asset (circle.com EURC or USDC) |
| DAO governance | Custom Soroban voting contract |
| Mobile wallet | Stellar Albedo or in-app keypair |
| ZK identity | Polygon ID / zkPass integration |
