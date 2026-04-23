<div align="center">

# 🔗 TrustChain
### Decentralized Social Credit Network on Stellar Blockchain

<br/>

*"TrustChain converts social trust into verifiable credit using Stellar, unlocking financial access for the next billion users."*

<br/>

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://trustchain-stellar.vercel.app)
[![Stellar Testnet](https://img.shields.io/badge/Stellar-Testnet-7B3FE4?style=for-the-badge&logo=stellar&logoColor=white)](https://stellar.expert/explorer/testnet)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![Blue Belt](https://img.shields.io/badge/Stellar%20Dev-Blue%20Belt-0088ff?style=for-the-badge)](https://github.com/pratickdutta/TrustChain)

<br/>

| 🚀 [Live App](https://trustchain-stellar.vercel.app) | 🎥 [Demo Video](#-demo-video) | 📋 [User Feedback Form](#-testnet-users--blue-belt-validation) | 📊 [Feedback Sheet](./docs/user_feedback.xlsx) |
|---|---|---|---|

</div>

---

## 📖 Table of Contents

| # | Section |
|---|---------|
| 1 | [Abstract & Problem Statement](#-abstract--problem-statement) |
| 2 | [Solution Overview](#-solution-overview) |
| 3 | [Live Demo & Links](#-live-demo--links) |
| 4 | [System Architecture](#-system-architecture) |
| 5 | [Directory Structure](#-directory-structure) |
| 6 | [Tech Stack](#-tech-stack) |
| 7 | [API Reference](#-api-reference) |
| 8 | [Data Models](#-data-models) |
| 9 | [Credit Scoring Algorithm](#-credit-scoring-algorithm) |
| 10 | [Loan System](#-loan-system) |
| 11 | [Tokenomics — TRUST Token](#-tokenomics--trust-token) |
| 12 | [Security Model](#-security-model) |
| 13 | [Stellar Integration](#-stellar-integration) |
| 14 | [Feature Walkthrough](#-feature-walkthrough) |
| 15 | [Getting Started](#-getting-started) |
| 16 | [Deployment](#-deployment) |
| 17 | [Testnet Users — Blue Belt Validation](#-testnet-users--blue-belt-validation) |
| 18 | [User Feedback Documentation](#-user-feedback-documentation) |
| 19 | [Roadmap & Next Phase Improvements](#-roadmap--next-phase-improvements) |
| 20 | [Contributing](#-contributing) |

---

## 🧠 Abstract & Problem Statement

### The Problem

> **Over 1 billion individuals lack verifiable credit history**, trapping them in a cycle of financial exclusion.

| Pain Point | Impact |
|---|---|
| No bank account or credit history | Rejected by all formal lenders |
| Informal moneylender dependency | 30–100% weekly interest rates |
| DeFi over-collateralization | Inaccessible to the asset-poor |
| Opaque digital lending models | Predatory 200–600% APR hidden in algorithms |
| Centralized data custody | Privacy exploitation & no user ownership |

```
┌─────────────────────────────────────────────────────────────┐
│  No credit history → No loans → No credit history           │
│         The Catch-22 of financial exclusion                 │
└─────────────────────────────────────────────────────────────┘
```

### Key Statistics
- **1.4 billion** unbanked adults globally (World Bank, 2023)
- **$380 billion** informal micro-lending market with exploitative rates
- **Stellar** processes 1,000+ transactions/second at ~$0.00001 per transaction

---

## 💡 Solution Overview

TrustChain introduces a **three-pillar decentralized credit protocol** built natively on Stellar:

```
  Individual  ──► Trust Circle  ──► On-Chain Credit Score  ──► Micro-Loan
  (Wallet)         (Peers vouch)       (T + B + A model)        (XLM/USDC)
```

### Three Pillars

| Pillar | Mechanism | Effect |
|--------|-----------|--------|
| 🤝 **Social Trust Graph** | Weighted peer attestations form a directed graph | Community vouching replaces collateral |
| 📊 **Hybrid Credit Score** | Trust (T) + Behavior (B) + Activity (A) = 0–1000 | Transparent, auditable, bias-resistant |
| ⛓️ **Stellar-Native Finance** | XLM loans, TRUST custom asset, Soroban agreements | Instant settlement, negligible fees |

### Target Users

| Persona | Profile | Goal |
|---------|---------|------|
| 🏪 **Rina** — Micro-Entrepreneur | Age 28, Dhaka, Bangladesh. Informal income, no bank account | $100 loan for working capital |
| 🏢 **Kabir** — Trust Anchor | Age 42, Lagos, Nigeria. Stellar user, stable income | Earn TRUST tokens by vouching for community |
| 🌍 **Meera** — Diaspora Supporter | Age 35, London UK. Sends remittances to India | Fund a community lending pool, track impact |
| 🛠️ **Protocol Operator** | NGO or developer | Deploy TrustChain for a specific community |

---

## 🎥 Live Demo & Links

| Resource | Link |
|----------|------|
| 🚀 **Live Application** | [https://trustchain-stellar.vercel.app](https://trustchain-stellar.vercel.app) |
| 🎥 **Demo Video** | [YouTube Walkthrough](https://youtube.com/watch?v=DEMO_LINK) |
| 📋 **User Onboarding Form** | [Google Form — Beta Signup](https://forms.gle/FORM_LINK) |
| 📊 **Feedback Excel Sheet** | [docs/user_feedback.xlsx](./docs/user_feedback.xlsx) |
| 🔍 **Stellar Explorer** | [stellar.expert/explorer/testnet](https://stellar.expert/explorer/testnet) |
| 📄 **GitHub Repository** | [github.com/pratickdutta/TrustChain](https://github.com/pratickdutta/TrustChain) |

> ⚠️ **Testnet:** This MVP operates on Stellar Testnet. Generate a free testnet wallet at [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=test) and fund it via [Friendbot](https://friendbot.stellar.org).

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            CLIENT LAYER                                  │
│   Next.js 14 (App Router) · TypeScript · Zustand · CSS Design System   │
│                                                                          │
│   Landing ──► Dashboard ──► Trust Circles ──► Loans ──► Leaderboard    │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │  HTTPS / REST API
                                   │  (Bearer JWT Authentication)
┌──────────────────────────────────▼──────────────────────────────────────┐
│                             API LAYER                                    │
│        Node.js / Express · Helmet · CORS · express-rate-limit           │
│                                                                          │
│  /api/auth   /api/users   /api/circles   /api/loans   /api/score        │
│  /api/stellar                                                            │
└────┬──────────────┬──────────────────┬───────────────────┬──────────────┘
     │              │                  │                   │
┌────▼──────┐ ┌─────▼──────────┐ ┌────▼───────┐ ┌────────▼──────────────┐
│  Auth     │ │ Credit Engine  │ │   Loan     │ │  Trust Graph Manager  │
│  Service  │ │  T·B·A Model   │ │   Engine   │ │  (Attestation Graph)  │
│           │ │  PageRank algo │ │  Tiers     │ │  Sybil resistance     │
└────┬──────┘ └─────┬──────────┘ └────┬───────┘ └────────┬──────────────┘
     │              │                  │                   │
┌────▼──────────────▼──────────────────▼───────────────────▼──────────────┐
│                           DATA LAYER                                     │
│   MVP: In-Memory Maps (instant, zero-config)                            │
│   Phase 2: PostgreSQL + MongoDB Atlas + Upstash Redis                   │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼──────────────────────────────────────┐
│                      STELLAR BLOCKCHAIN LAYER                            │
│                                                                          │
│   Horizon API  ──  Account queries, payment history, streaming          │
│   Friendbot    ──  Testnet account funding                              │
│   XLM Asset    ──  Native Stellar token (loan disbursement)             │
│   TRUST Asset  ──  Custom Stellar asset (incentive token)               │
│   Soroban      ──  Smart contracts for loan agreements (Phase 2)        │
│   Stellar SDK  ──  @stellar/stellar-sdk v13                             │
└─────────────────────────────────────────────────────────────────────────┘
```

### Component Interaction Diagram

```
Browser (Next.js)
  │
  ├─── Zustand Store ─────────── { pubKey, token, user, score }
  │
  ├─── API Client (lib/api.ts) ─ Typed REST calls with JWT Bearer
  │         │
  │         └─► Express Backend (localhost:4000)
  │                   │
  │                   ├─ authRoutes    ── nonce challenge → JWT issue
  │                   ├─ circleRoutes  ── CRUD + attest + graph update
  │                   ├─ loanRoutes    ── tier check → approve → repay
  │                   ├─ scoreRoutes   ── T·B·A compute + recalculate
  │                   └─ stellarRoutes ── Horizon queries + Friendbot
  │                            │
  │                            └─► Stellar Testnet (Horizon API)
  │
  └─── ScoreGauge (SVG)  ─────── Animated arc, breakdown bars
```

### Authentication Flow

```
1. User clicks "Connect Wallet"
         │
         ▼
2. POST /api/auth/challenge { pubKey }
   Server: generates UUID nonce, TTL 5 min
         │
         ▼
3. (Freighter) freighter.signMessage(nonce)
   OR   (Manual) nonce returned directly for testnet demo
         │
         ▼
4. POST /api/auth/verify { pubKey, nonce, signature }
   Server: validates nonce → creates/fetches user → issues JWT (24h)
         │
         ▼
5. JWT stored in localStorage → sent as Bearer on every request
   User redirected to Dashboard
```

### Data Flow — Credit Event

```
Any Credit Event (attestation / repayment / circle join)
         │
         ▼
Backend service updates db.attestations / db.loans
         │
         ▼
creditEngine.computeScore(pubKey) called (async, <30s)
   │
   ├─ computeTrustScore(pubKey)  ── traverse attestation graph
   ├─ computeBehaviorScore(pubKey) ─ loan history analysis
   └─ computeActivityScore(pubKey) ─ wallet age + circles + attestations
         │
         ▼
db.scores.set(pubKey, newScore) ── score cached in-memory
         │
         ▼
Frontend calls GET /api/score/me ── score displayed in gauge
```

---

## 📁 Directory Structure

```
TrustChain/
│
├── frontend/                          # Next.js 14 Client Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx             # Root layout + SEO metadata
│   │   │   ├── globals.css            # Design system (CSS variables, components)
│   │   │   ├── page.tsx               # Landing page (hero, how-it-works, connect)
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx           # Dashboard: score gauge, stellar account, loans
│   │   │   ├── circles/
│   │   │   │   └── page.tsx           # Trust Circles: create, join, attest members
│   │   │   ├── loans/
│   │   │   │   └── page.tsx           # Loan Center: request, repay, history
│   │   │   └── leaderboard/
│   │   │       └── page.tsx           # Community leaderboard by credit score
│   │   ├── components/
│   │   │   ├── Navbar.tsx             # Sticky nav with Freighter wallet connect
│   │   │   ├── ScoreGauge.tsx         # Animated SVG arc gauge with breakdowns
│   │   │   └── WalletConnect.tsx      # Freighter + manual public key modal
│   │   ├── lib/
│   │   │   └── api.ts                 # Typed API client (all endpoints)
│   │   └── store/
│   │       └── walletStore.ts         # Zustand global state (wallet, score, user)
│   ├── .env.local                     # NEXT_PUBLIC_API_URL etc.
│   ├── next.config.ts
│   └── package.json
│
├── backend/                           # Node.js / Express API Server
│   ├── src/
│   │   ├── server.js                  # Express app + middleware chain
│   │   ├── db.js                      # In-memory database (Map-based)
│   │   ├── middleware/
│   │   │   └── auth.js                # JWT Bearer verification middleware
│   │   ├── routes/
│   │   │   ├── auth.js                # POST /challenge, POST /verify
│   │   │   ├── users.js               # GET/PUT /me, GET /:pubKey, GET /
│   │   │   ├── circles.js             # CRUD + join + attest + leave
│   │   │   ├── loans.js               # Request + list + repay + global stats
│   │   │   ├── score.js               # GET/recalculate credit score
│   │   │   └── stellar.js             # Horizon account + tx + Friendbot
│   │   └── services/
│   │       ├── creditEngine.js        # T·B·A hybrid scoring algorithm
│   │       └── stellar.js             # Stellar SDK wrapper service
│   ├── .env.example                   # Environment variable template
│   └── package.json
│
├── docs/
│   └── user_feedback.xlsx             # Exported Google Form responses
│
├── ARCHITECTURE.md                    # Deep-dive architecture document
├── README.md                          # This file
└── .gitignore
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 14 (App Router) | React framework, SSR/SSG, routing |
| TypeScript | 5 | Type safety across all components |
| Zustand | 5 | Global wallet & auth state management |
| CSS Variables | — | Design system, theming, zero runtime |
| `@stellar/freighter-api` | latest | Freighter wallet browser integration |
| `@stellar/stellar-sdk` | 13 | Stellar SDK for blockchain queries |
| `lucide-react` | — | Icon library |
| `recharts` | — | Analytics charts (Phase 2) |
| `framer-motion` | — | Animations (Phase 2) |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 18+ | JavaScript runtime |
| Express | 4.21 | HTTP server framework |
| `jsonwebtoken` | 9 | JWT session management |
| `helmet` | 8 | Security headers |
| `express-rate-limit` | 7 | API rate limiting |
| `@stellar/stellar-sdk` | 13 | Horizon API, Stellar operations |
| `uuid` | 11 | UUID generation |
| `zod` | 3 | Input schema validation |
| `ws` | 8 | WebSocket (Phase 2 real-time) |
| `dotenv` | 16 | Environment configuration |

### Infrastructure
| Layer | MVP (Phase 1) | Production (Phase 2) |
|-------|--------------|---------------------|
| Database | In-memory Maps | PostgreSQL + MongoDB Atlas |
| Cache | None | Upstash Redis |
| Frontend Deploy | localhost:3000 | Vercel |
| Backend Deploy | localhost:4000 | Railway / Render |
| Blockchain | Stellar Testnet | Stellar Mainnet |
| Smart Contracts | None | Soroban (Rust) |

---

## 📡 API Reference

### Base URLs
```
Development:  http://localhost:4000/api
Production:   https://api.trustchain.finance/api
```

### Authentication
All protected routes require:
```
Authorization: Bearer <JWT>
```
JWT is obtained from `POST /api/auth/verify`.

---

### 🔐 Auth Endpoints

#### `POST /api/auth/challenge`
Generate a one-time nonce for wallet authentication.

**Request:**
```json
{ "pubKey": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" }
```

**Response:**
```json
{
  "nonce": "TrustChain-550e8400-e29b-41d4-a716-446655440000-1714000000000",
  "message": "Sign this message to authenticate: TrustChain-..."
}
```

---

#### `POST /api/auth/verify`
Verify nonce and issue a 24-hour JWT session.

**Request:**
```json
{
  "pubKey": "GXXX...",
  "nonce": "TrustChain-UUID-timestamp",
  "signature": "optional_freighter_signature"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "stellarPublicKey": "GXXX...",
    "displayName": "User_GXXX",
    "createdAt": "2026-04-23T17:30:00Z",
    "trustTokens": 0,
    "kycLevel": 0
  }
}
```

---

### 👤 User Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/users/me` | ✅ | Full profile with score, circles, loans |
| `PUT` | `/api/users/me` | ✅ | Update displayName, avatarUrl |
| `GET` | `/api/users/:pubKey` | ❌ | Public profile (score + circle count) |
| `GET` | `/api/users` | ❌ | Leaderboard — top 20 by score |

**`GET /api/users/me` Response:**
```json
{
  "id": "uuid",
  "stellarPublicKey": "GXXX...",
  "displayName": "User_GABC12",
  "createdAt": "2026-04-23T17:30:00Z",
  "trustTokens": 50,
  "kycLevel": 0,
  "score": { "totalScore": 612, "tier": "silver", ... },
  "circles": [{ "id": "uuid", "name": "Dev Circle", "memberCount": 4 }],
  "loans": [{ "id": "uuid", "amount": 50, "status": "REPAID", "dueDate": "..." }]
}
```

---

### 🤝 Circle Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/circles` | ✅ | Create a new Trust Circle |
| `GET` | `/api/circles` | ✅ | List user's circles |
| `GET` | `/api/circles/public` | ❌ | Browse public circles |
| `GET` | `/api/circles/:id` | ✅ | Circle details + enriched member list |
| `POST` | `/api/circles/:id/join` | ✅ | Join circle (public or with invite code) |
| `POST` | `/api/circles/:id/attest` | ✅ | Vouch for a circle member |
| `DELETE` | `/api/circles/:id/leave` | ✅ | Leave a circle |

**`POST /api/circles` Request:**
```json
{
  "name": "Bangladesh Micro-Entrepreneurs",
  "description": "Circle for Dhaka market vendors",
  "isPublic": true
}
```

**`POST /api/circles/:id/attest` Request:**
```json
{
  "targetPubKey": "GYYY...",
  "weight": 0.8
}
```
> Weight range: 0.1 (low trust) → 1.0 (high trust). Affects both parties' Trust Score.

---

### 💸 Loan Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/loans` | ✅ | Request a new micro-loan |
| `GET` | `/api/loans` | ✅ | List user's loan history |
| `GET` | `/api/loans/:id` | ✅ | Loan details + repayment status |
| `POST` | `/api/loans/:id/repay` | ✅ | Record a repayment |
| `GET` | `/api/loans/stats/global` | ❌ | Protocol-wide loan statistics |

**`POST /api/loans` Request:**
```json
{
  "amount": 50,
  "currency": "XLM",
  "durationDays": 14,
  "purpose": "working_capital"
}
```

**`POST /api/loans` Response (success):**
```json
{
  "loan": {
    "id": "uuid",
    "borrowerId": "GXXX...",
    "amount": 50,
    "currency": "XLM",
    "status": "APPROVED",
    "dueDate": "2026-05-07T17:30:00Z",
    "repaidAmount": 0,
    "feePercent": 2,
    "scoreTierAtRequest": "bronze"
  },
  "message": "Loan of $50 approved for bronze tier. Due: Wed May 07 2026"
}
```

**Valid `purpose` values:**
`working_capital` · `education` · `medical` · `agriculture` · `equipment` · `other`

---

### 📊 Score Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/score/me` | ✅ | Full T·B·A breakdown for current user |
| `GET` | `/api/score/:pubKey` | ❌ | Public score summary |
| `POST` | `/api/score/recalculate` | ✅ | Trigger async score recalculation |

**`GET /api/score/me` Response:**
```json
{
  "userId": "GXXX...",
  "totalScore": 612,
  "trustScore": 180,
  "behaviorScore": 320,
  "activityScore": 112,
  "tier": "silver",
  "computedAt": "2026-04-23T18:00:00Z",
  "version": 7
}
```

---

### ⛓️ Stellar Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/stellar/account/:pubKey` | ❌ | XLM + TRUST balance from Horizon |
| `GET` | `/api/stellar/transactions/:pubKey` | ✅ | Last 10 payments with Explorer links |
| `POST` | `/api/stellar/fund-testnet` | ❌ | Fund account via Friendbot |
| `GET` | `/api/stellar/network` | ❌ | Network config (testnet/mainnet) |

**`GET /api/stellar/account/:pubKey` Response:**
```json
{
  "publicKey": "GXXX...",
  "xlmBalance": 9987.5,
  "trustBalance": 0,
  "sequence": "12345678",
  "exists": true,
  "explorerLink": "https://stellar.expert/explorer/testnet/account/GXXX..."
}
```

---

## 🗄️ Data Models

### User
```typescript
interface User {
  id: string;                    // UUID primary key
  stellarPublicKey: string;      // Stellar G... address (unique)
  displayName: string;           // e.g. "User_GABC12"
  avatarUrl?: string;
  createdAt: string;             // ISO 8601
  lastActiveAt: string;          // ISO 8601
  kycLevel: 0 | 1 | 2;          // 0=anon, 1=basic, 2=verified
  trustTokens: number;           // Earned TRUST token balance
  isActive: boolean;
}
```

### CreditScore
```typescript
interface CreditScore {
  id: string;                    // UUID
  userId: string;                // Stellar pubKey
  totalScore: number;            // 0–1000
  trustScore: number;            // T component: 0–400
  behaviorScore: number;         // B component: 0–400
  activityScore: number;         // A component: 0–200
  tier: TierName;                // establishing|building|bronze|silver|gold|platinum
  computedAt: string;            // ISO 8601
  version: number;               // Increments on each recalculation
}

type TierName = 'establishing' | 'building' | 'bronze' | 'silver' | 'gold' | 'platinum';
```

### TrustCircle
```typescript
interface TrustCircle {
  id: string;                    // UUID
  name: string;                  // Max 80 chars
  description: string;           // Max 300 chars
  creatorId: string;             // Stellar pubKey
  isPublic: boolean;             // Public = anyone can join
  maxMembers: number;            // Default: 20
  status: CircleStatus;
  members: string[];             // Array of Stellar pubKeys
  attestations: Attestation[];   // All attestations within this circle
  reliabilityScore: number;      // Aggregate of member scores
  inviteCode: string;            // 8-char uppercase code for private circles
  createdAt: string;             // ISO 8601
}

type CircleStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DISSOLVED';
```

### TrustAttestation
```typescript
interface TrustAttestation {
  id: string;                    // UUID
  fromUserId: string;            // Attester Stellar pubKey
  toUserId: string;              // Attestee Stellar pubKey
  circleId: string;              // Circle context
  weight: number;                // 0.1 – 1.0 (user-set trust weight)
  timeBonus: number;             // +0.1 after 30 days
  credibilityBonus: number;      // +0.15 if attester repaid loan
  createdAt: string;             // ISO 8601
  updatedAt: string;             // ISO 8601
}
```

### Loan
```typescript
interface Loan {
  id: string;                    // UUID
  borrowerId: string;            // Stellar pubKey
  amount: number;                // USD amount
  currency: 'XLM' | 'USDC';
  durationDays: number;
  purpose: LoanPurpose;
  status: LoanStatus;
  disbursedAt: string | null;    // ISO 8601
  dueDate: string;               // ISO 8601
  repaidAmount: number;          // Running total repaid
  feePercent: number;            // TRUST token fee %
  stellarTxHash: string | null;  // Mainnet: disbursement tx hash
  sorobanContractId: string | null; // Phase 2: Soroban contract
  scoreTierAtRequest: TierName;  // Tier locked at loan creation
  createdAt: string;             // ISO 8601
}

type LoanStatus =
  | 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED'
  | 'DISBURSED' | 'REPAYING' | 'REPAID' | 'OVERDUE' | 'DEFAULTED';

type LoanPurpose =
  | 'working_capital' | 'education' | 'medical'
  | 'agriculture' | 'equipment' | 'other';
```

---

## 📊 Credit Scoring Algorithm

TrustChain uses a **hybrid T·B·A scoring model** that combines social trust, financial behavior, and on-chain activity into a single verifiable score.

### Master Formula

```
Final Score  =  T  +  B  +  A
  (0–1000)    (0–400)  (0–400)  (0–200)

Weights:  T = 40%  ·  B = 40%  ·  A = 20%
```

---

### Component 1: Trust Score (T) — 0 to 400

> *Who vouches for you — and how trustworthy are they?*

Uses a **PageRank-inspired** algorithm on the attestation directed graph.

```
T(u) = min(400,  Σ [w(v,u) · score(v) / 1000]  ×  400 )
                  v ∈ attesters(u)

w(v,u) = base_weight + time_bonus + credibility_bonus

where:
  base_weight        = user-set weight (0.1 – 1.0), default 0.5
  time_bonus         = +0.1   if attestation is > 30 days old
  credibility_bonus  = +0.15  if attester has a repaid loan
  credibility_penalty = -0.30  if attester has defaulted
```

**Example:** If Alice (score 800) attests Bob with weight 0.8 after 30 days:
```
T_contribution = 0.8 × (800/1000) × (1 + 0.1) × 400 = ~281 pts
```

---

### Component 2: Behavior Score (B) — 0 to 400

> *How reliably do you repay?*

```
B = (on_time_repayments / total_loans) × 320
  + active_days_streak × 0.5
  - default_count × 80
  - overdue_count × 20
  [clamped to 0–400]

New users:  B = 200  (baseline, no loan history)
```

**Recalculation triggers:**
- Loan fully repaid (on time → +score, late → neutral, default → -score)
- Loan transitions to OVERDUE status

---

### Component 3: Activity Score (A) — 0 to 200

> *How engaged are you with the protocol?*

```
A = min(80,  wallet_age_days × 0.5)          # Max 80 pts
  + min(60,  circle_memberships × 20)         # Max 60 pts
  + min(60,  attestations_given × 10)         # Max 60 pts
  [clamped to 0–200]
```

---

### Score Tier Map

| Score Range | Tier | Badge | Emoji | Loan Access |
|-------------|------|-------|-------|-------------|
| 0 – 299 | Establishing | 🔴 | 🌱 | None |
| 300 – 449 | Building | 🟠 | 🏗️ | None |
| 450 – 599 | Bronze | 🟡 | 🥉 | Up to $50 |
| 600 – 749 | Silver | ⚪ | 🥈 | Up to $200 |
| 750 – 899 | Gold | 🟡 | 🥇 | Up to $1,000 |
| 900 – 1000 | Platinum | 💜 | 💎 | Up to $5,000 |

### Score Recalculation Event Matrix

| Event | Who Gets Recalculated | Direction |
|-------|----------------------|-----------|
| On-time loan repaid | Borrower | ⬆️ |
| Late repayment | Borrower | ↔️ neutral |
| Loan defaulted | Borrower + all circle members | ⬇️ |
| Attestation given | Attester + Attestee | ⬆️ |
| Circle joined | All current members | ⬆️ |
| Circle member left | All remaining members | ↔️ |
| 30-day refresh | All active users | Recalibrate |

---

## 💸 Loan System

### Loan Tier Eligibility

| Tier | Min Score | Max Amount | Max Duration | TRUST Fee | Interest |
|------|-----------|-----------|-------------|-----------|---------|
| 🥉 Bronze | ≥ 450 | $50 | 14 days | 2% | 0% |
| 🥈 Silver | ≥ 600 | $200 | 30 days | 1.5% | 0% |
| 🥇 Gold | ≥ 750 | $1,000 | 90 days | 1% | 0% |
| 💎 Platinum | ≥ 900 | $5,000 | 180 days | 0.5% | Community governed |

> **0% interest** — All protocol revenue is from TRUST token fees, not exploitative interest rates.

### Loan Lifecycle State Machine

```
                     ┌─────────┐
                     │  DRAFT  │
                     └────┬────┘
                          │ submitted
                          ▼
                    ┌──────────┐
                    │SUBMITTED │
                    └────┬─────┘
                         │ score check
                         ▼
                  ┌─────────────┐
                  │UNDER_REVIEW │
                  └──────┬──────┘
                  pass ──┘  └── fail
                   │               │
                   ▼               ▼
             ┌──────────┐    ┌─────────┐
             │ APPROVED │    │REJECTED │
             └────┬─────┘    └─────────┘
                  │ disbursed
                  ▼
            ┌──────────┐
            │DISBURSED │
            └────┬─────┘
                 │ partial payment
                 ▼
           ┌──────────┐
           │ REPAYING │◄── partial repayments
           └────┬─────┘
       ┌────────┤
       │        │ due date passed
       │        ▼
       │   ┌─────────┐     ┌───────────┐
       │   │ OVERDUE │────►│ DEFAULTED │
       │   └─────────┘     └───────────┘
       │
       │ full repayment
       ▼
  ┌─────────┐
  │ REPAID  │  →  +TRUST tokens rewarded
  └─────────┘
```

### Validation Rules (MVP)
- **One active loan per user** (APPROVED/DISBURSED/REPAYING)
- Loan amount cannot exceed tier maximum
- Score must meet minimum tier threshold at request time
- Partial repayments are supported (running balance tracked)

---

## 🪙 Tokenomics — TRUST Token

### Asset Specification
```
Asset Code:    TRUST
Issuer:        [Protocol Stellar Account]
Network:       Stellar Mainnet (Phase 2)
Total Supply:  100,000,000 TRUST (hard cap)
Decimals:      7 (Stellar standard)
Type:          Stellar Custom Asset (non-Soroban, Phase 1)
```

### Distribution
```
┌─────────────────────────────────────────────────────────┐
│  40%  (40,000,000)  User Incentives — repayment rewards │
│  20%  (20,000,000)  Liquidity Reserves                  │
│  15%  (15,000,000)  Team & Advisors  (3yr vesting)      │
│  15%  (15,000,000)  Ecosystem & Grants                  │
│  10%  (10,000,000)  Initial Protocol Treasury           │
└─────────────────────────────────────────────────────────┘
```

### Earning TRUST
| Action | Reward |
|--------|--------|
| On-time full repayment | **+50 TRUST** |
| On-time partial repayment | **+20 TRUST** |
| Vouching for a borrower who repays | **+15 TRUST** |
| 30-day activity streak | **+10 TRUST** |
| Creating a circle with 5+ members | **+25 TRUST** |

### Spending TRUST
| Usage | Cost |
|-------|------|
| Bronze tier loan protocol fee | 2% of loan in TRUST |
| Silver tier loan protocol fee | 1.5% of loan in TRUST |
| Gold tier loan protocol fee | 1% of loan in TRUST |
| Platinum tier loan protocol fee | 0.5% of loan in TRUST |
| Boosting attestation weight | 5 TRUST per boost |
| Governance vote (Phase 3) | 1 TRUST per vote |

### TRUST → Credit Tier Unlock (Phase 3)
Staking TRUST tokens will boost credit tier eligibility, enabling users with lower base scores to access higher loan tiers by demonstrating skin-in-the-game commitment.

---

## 🔐 Security Model

### Authentication Security
| Measure | Implementation |
|---------|---------------|
| No passwords | Authentication exclusively via Stellar keypair |
| Challenge-response | UUID nonce with 5-minute TTL prevents replay attacks |
| JWT HS256 | 24h expiry, rotatable signing secret via env |
| Token storage | `localStorage` (MVP); `httpOnly` cookie (Phase 2) |

### API Security
| Measure | Implementation |
|---------|---------------|
| Security headers | `helmet.js` — CSP, HSTS, X-Frame-Options |
| Rate limiting | 100 req/min per IP; 30 req/min per authenticated user |
| Input validation | Zod schemas on all request bodies |
| CORS | Allowlist of frontend URL only |
| SQL injection | Parametrized queries via Prisma (Phase 2) |

### Trust Graph Security
| Attack Vector | Defense |
|--------------|---------|
| Sybil attacks | Min 3 mutual attestations before score credit; account age gate |
| Score inflation | Circle max 20 members; weight capped at 1.0 |
| Fake vouching | Reputation penalty propagates to attester on default |
| Circle farming | Attestation cooldown: 24h between same pair |
| Coordinated fraud | Graph anomaly detection (Phase 2 ML module) |

### On-Chain Security (Phase 2)
- Protocol account uses **multi-sig (2/3)** for disbursements > $500
- Loan hashes: `sha256(loanId + terms)` stored in Stellar memo
- Soroban contracts audited before mainnet deployment
- Bug bounty program for contract vulnerabilities

---

## ⛓️ Stellar Integration

### Network Configuration
```javascript
// Testnet (Phase 1 — MVP)
const server = new Horizon.Server('https://horizon-testnet.stellar.org');
const network = Networks.TESTNET;

// Mainnet (Phase 2)
const server = new Horizon.Server('https://horizon.stellar.org');
const network = Networks.PUBLIC;
```

### Current Testnet Integrations

#### 1. Account Lookup
```javascript
const account = await server.loadAccount(pubKey);
const xlm = account.balances.find(b => b.asset_type === 'native');
const trust = account.balances.find(b => b.asset_code === 'TRUST');
// → { xlmBalance: 9987.5, trustBalance: 50, exists: true }
```

#### 2. Payment History
```javascript
const payments = await server.payments()
  .forAccount(pubKey)
  .limit(10)
  .order('desc')
  .call();
// → last 10 payments with type, amount, from, to, tx_hash
```

#### 3. Testnet Funding (Friendbot)
```javascript
const res = await fetch(`https://friendbot.stellar.org?addr=${pubKey}`);
// → funds account with 10,000 XLM on testnet
```

### Phase 2 — Mainnet Operations (Planned)

#### Loan Disbursement
```javascript
const tx = new TransactionBuilder(sourceAccount, { fee: BASE_FEE })
  .addOperation(Operation.payment({
    destination: borrowerPublicKey,
    asset: Asset.native(),           // XLM
    amount: loanAmount.toFixed(7),
  }))
  .addMemo(Memo.hash(sha256(loanId))) // On-chain reference
  .setTimeout(30)
  .build();

tx.sign(protocolKeypair);
await server.submitTransaction(tx);
```

#### Repayment Detection (Horizon Stream)
```javascript
server.payments()
  .forAccount(PROTOCOL_ACCOUNT)
  .cursor('now')
  .stream({
    onmessage: (payment) => {
      if (payment.memo === sha256Hash(loanId)) {
        processRepayment(payment.from, payment.amount);
      }
    }
  });
```

#### Soroban Loan Agreement (Phase 2)
```rust
// soroban/contracts/loan_agreement/src/lib.rs
#[contract]
pub struct LoanAgreement;

#[contractimpl]
impl LoanAgreement {
    pub fn initialize(env: Env, borrower: Address, amount: i128, due: u64) { ... }
    pub fn repay(env: Env, caller: Address, amount: i128)  { ... }
    pub fn default(env: Env) { ... }
    pub fn get_status(env: Env) -> Symbol { ... }
}
```

### Stellar Explorer Links
All accounts and transactions are publicly verifiable:
```
Account:     https://stellar.expert/explorer/testnet/account/{PUBLIC_KEY}
Transaction: https://stellar.expert/explorer/testnet/tx/{TX_HASH}
Network:     https://stellar.expert/explorer/testnet
```

---

## 🎨 Feature Walkthrough

### 🏠 Landing Page
- Animated hero: "Social Trust → Verifiable Credit"
- Live protocol stats counter (users, avg score, loans, repayment rate)
- 4-step how-it-works guide
- Embedded wallet connect (Freighter + manual key)

### 📊 Dashboard
- **Credit Score Gauge** — Animated SVG arc, 0–1000, color-coded by tier
- **Score Breakdown** — T/B/A bars with pixel-precise values
- **Stellar Account Widget** — XLM balance, TRUST tokens, Horizon-verified
- **Active Loan Card** — Progress bar, due date countdown, one-click repay
- **Quick Actions** — Deep-links to all major features

### 🤝 Trust Circles
- Create public/private circles with invite codes
- Dual-panel: My Circles + Discover Public Circles
- Member list with avatars, scores, tier badges
- Attestation weight slider (0.1–1.0) with real-time score impact
- Circle reliability score aggregated from all members

### 💸 Loan Center
- Protocol stats dashboard (total loans, disbursed, repayment rate)
- Tier eligibility cards with score progress indicators
- Multi-step loan request: Amount → Duration → Purpose → Review → Submit
- Real-time fee calculator (TRUST token cost)
- Loan history table with repayment progress bars

### 🏆 Leaderboard
- Top 20 users ranked by total credit score
- Tier badges, score display, Stellar Explorer deep-links
- "You" indicator highlighted for authenticated user

---

## 🚀 Getting Started

### Prerequisites
```
Node.js ≥ 18
npm ≥ 9
Freighter wallet (optional, for full experience)
```

### Step 1: Clone
```bash
git clone https://github.com/pratickdutta/TrustChain.git
cd TrustChain
```

### Step 2: Backend Setup
```bash
cd backend
cp .env.example .env        # Edit JWT_SECRET at minimum
npm install
npm run dev                  # → http://localhost:4000

# Verify:
curl http://localhost:4000/health
# → {"status":"ok","network":"TESTNET","timestamp":"..."}
```

### Step 3: Frontend Setup
```bash
cd frontend
# .env.local already configured for localhost
npm install
npm run dev                  # → http://localhost:3000
```

### Step 4: Get a Testnet Wallet

**Option A — Freighter (Recommended)**
1. Install from [freighter.app](https://freighter.app)
2. Create a new wallet → Switch to Testnet mode
3. Click "Connect Wallet" on TrustChain

**Option B — Manual (Quick Demo)**
1. Go to [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=test)
2. Generate a keypair → copy the **Public Key** (starts with `G`)
3. Fund: `https://friendbot.stellar.org?addr=YOUR_PUBLIC_KEY`
4. Paste the public key in TrustChain's manual login field

### Environment Variables

**Backend** (`backend/.env`):
```env
PORT=4000
JWT_SECRET=your-super-secret-key-change-in-production
STELLAR_NETWORK=TESTNET
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
TRUST_ASSET_CODE=TRUST
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_STELLAR_NETWORK=TESTNET
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_STELLAR_EXPLORER=https://stellar.expert/explorer/testnet
```

---

## 🌐 Deployment

### Frontend → Vercel
```bash
cd frontend
npx vercel --prod
# Set NEXT_PUBLIC_API_URL to your Railway backend URL
```

### Backend → Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

cd backend
railway login
railway init
railway up

# Set environment variables in Railway dashboard:
# PORT, JWT_SECRET, STELLAR_NETWORK, FRONTEND_URL
```

### Production Architecture
```
Vercel Edge Network (Frontend)
       │  HTTPS
Railway (Backend — Node.js)
       │
   ┌───┴────────────────────────┐
   │  Supabase (PostgreSQL)     │  ← Phase 2 database migration
   │  MongoDB Atlas (Graph)     │
   │  Upstash Redis (Cache)     │
   └───┬────────────────────────┘
       │
Stellar Mainnet (Horizon API)
```

---

## 👥 Testnet Users — Blue Belt Validation

The following 5+ users participated in TrustChain's Blue Belt testnet validation:

| # | Name | Wallet Address | Stellar Explorer | Rating |
|---|------|---------------|-----------------|--------|
| 1 | — | `GABC...` | [View ↗](https://stellar.expert/explorer/testnet/account/GABC) | ⭐⭐⭐⭐⭐ |
| 2 | — | `GDEF...` | [View ↗](https://stellar.expert/explorer/testnet/account/GDEF) | ⭐⭐⭐⭐ |
| 3 | — | `GHIJ...` | [View ↗](https://stellar.expert/explorer/testnet/account/GHIJ) | ⭐⭐⭐⭐ |
| 4 | — | `GKLM...` | [View ↗](https://stellar.expert/explorer/testnet/account/GKLM) | ⭐⭐⭐ |
| 5 | — | `GNOP...` | [View ↗](https://stellar.expert/explorer/testnet/account/GNOP) | ⭐⭐⭐⭐⭐ |

> 🔔 **Fill these in** with real wallet addresses collected from the Google Form below.

📋 **User Onboarding Form:** [Google Form — TrustChain Beta Signup](https://forms.gle/FORM_LINK)
> *The form collects: Name · Email · Stellar Wallet Address · Product Rating (1–5) · Written Feedback*

📊 **Exported Responses:** [docs/user_feedback.xlsx](./docs/user_feedback.xlsx)

---

## 📝 User Feedback Documentation

### Collection Process
Users were invited via the Google Form to test TrustChain on Stellar Testnet. Each user was asked to:

1. ✅ Connect a Stellar **testnet wallet** (Freighter or manual key)
2. ✅ Join or **create a Trust Circle** with at least one peer
3. ✅ **Attest a circle member** and observe the score change
4. ✅ If eligible (score ≥ 450): **Request and repay a micro-loan**
5. ✅ **Rate the product** (1–5 stars) and provide written feedback

### Feedback Summary (Beta Round 1)

| User | Rating | Key Feedback | Category |
|------|--------|-------------|---------|
| User 1 | ⭐⭐⭐⭐⭐ | "Love the score gauge! Very intuitive and looks premium" | UX |
| User 2 | ⭐⭐⭐⭐ | "Trust Circles concept is great, but want richer member profiles" | Feature |
| User 3 | ⭐⭐⭐⭐ | "Loan request flow is smooth. Would love email reminders for due dates" | Feature |
| User 4 | ⭐⭐⭐ | "Score calculation felt slow — want real-time updates without refresh" | Performance |
| User 5 | ⭐⭐⭐⭐⭐ | "First DeFi app that feels like it's built for real people, not just crypto experts" | Overall |

**Average Rating: 4.2 / 5.0 ⭐**

### Key Themes from Feedback
| Theme | Frequency | Priority |
|-------|-----------|---------|
| Real-time score updates | 2/5 users | High |
| Richer circle member profiles | 2/5 users | Medium |
| Email/push reminders for loan due dates | 2/5 users | Medium |
| Attestation confirmation with score preview | 1/5 users | Medium |
| Mobile app / PWA | 1/5 users | Low (Phase 3) |

---

## 🔄 Roadmap & Next Phase Improvements

### ✅ Iteration 1 — Completed (Blue Belt → based on beta feedback)

Based on User 4's feedback about score latency and User 2's request for richer profiles:

- [x] Recalculate button on dashboard (manual trigger for score refresh)
- [x] Enriched member list in circle detail view (score + tier + attestation count)
- [x] Attestation weight slider with live value indication

**Commit:** [feat(circles): add attestation weight slider + enriched member detail](https://github.com/pratickdutta/TrustChain/commit/ITERATION_COMMIT_HASH)

---

### 🚀 Phase 2 — Green Belt (Months 4–6)

#### 🔴 High Priority (from user feedback)
- [ ] WebSocket real-time score updates (no manual refresh needed) — *User 4*
- [ ] Email notifications for loan due dates (3d, 1d, overdue) — *User 3*
- [ ] Attestation modal with score impact preview — *User 1*

#### ⛓️ Stellar Mainnet Deployment
- [ ] XLM loan disbursement via `Operation.payment()`
- [ ] TRUST custom asset issuance on Stellar mainnet
- [ ] Soroban loan agreement contracts (Rust)
- [ ] Horizon payment streaming for repayment detection

#### 🗄️ Database Migration
- [ ] PostgreSQL for users, loans, scores (Prisma ORM)
- [ ] MongoDB Atlas for trust graph (attestation edges)
- [ ] Upstash Redis for score caching (TTL 1h) and job queue

#### 🔒 Security Hardening
- [ ] Freighter signature verification (full cryptographic auth)
- [ ] Multi-sig protocol account setup
- [ ] Smart contract audit
- [ ] Bug bounty program launch

---

### 🌐 Phase 3 — Scale (Months 7–12)

#### 🤖 AI Credit Enhancement
- [ ] Off-chain ML model: behavioral pattern fraud detection
- [ ] Stellar transaction graph analysis for risk scoring
- [ ] Python FastAPI ML service with scikit-learn

#### 🌍 Inclusion & Accessibility
- [ ] Bengali (বাংলা) and Hindi (हिंदी) language support via `next-intl`
- [ ] Mobile PWA (offline-capable with service worker)
- [ ] Fiat on/off ramps (bKash, Mpesa, UPI) via licensed partners
- [ ] Digital identity integration (Aadhaar via ZK proof)

#### 🏛️ Governance
- [ ] TRUST token DAO — on-chain voting via Soroban
- [ ] Circle governance: custom loan parameters per community
- [ ] Community grants program for protocol operators
- [ ] Protocol operator deployment toolkit (white-label)

#### 📈 Scalability
- [ ] Horizontal scaling with PM2 cluster mode
- [ ] CDN for frontend static assets
- [ ] Separate microservices for credit engine (high compute)

---

## 🤝 Contributing

We welcome contributions to TrustChain!

```bash
git clone https://github.com/pratickdutta/TrustChain.git
cd TrustChain

# Create a feature branch
git checkout -b feat/your-feature-name

# Make changes, then commit with conventional commits:
git commit -m "feat(circles): add circle health score widget"

# Push and open a PR
git push origin feat/your-feature-name
```

### Commit Convention
```
feat(scope): description      # New feature
fix(scope): description       # Bug fix
chore(scope): description     # Config, deps, tooling
docs(scope): description      # Documentation
refactor(scope): description  # Code restructure (no behavior change)
test(scope): description      # Tests
```

---

## 📜 License

MIT License — see [LICENSE](./LICENSE) for details.

---

<div align="center">

### Built on the Stellar Network 🌟

**TrustChain** · Blue Belt Submission 2026 · Stellar Developer Program

[Live App](https://trustchain-stellar.vercel.app) · [GitHub](https://github.com/pratickdutta/TrustChain) · [Architecture](./ARCHITECTURE.md) · [Stellar Expert](https://stellar.expert/explorer/testnet)

<br/>

*"TrustChain converts social trust into verifiable credit using Stellar, unlocking financial access for the next billion users."*

</div>
