# TrustChain — System Architecture Document

> **Version:** 1.1.0 | **Network:** Stellar Testnet → Mainnet | **Status:** Blue Belt MVP
> **Last Updated:** April 2026

---

## Table of Contents

1. [High-Level Architecture](#1-high-level-architecture)
2. [Component Architecture](#2-component-architecture)
3. [Frontend Architecture](#3-frontend-architecture)
4. [Backend Architecture](#4-backend-architecture)
5. [Database Design](#5-database-design)
6. [Credit Scoring Engine](#6-credit-scoring-engine)
7. [Authentication & Security](#7-authentication--security)
8. [Loan Lifecycle State Machine](#8-loan-lifecycle-state-machine)
9. [Stellar Blockchain Integration](#9-stellar-blockchain-integration)
10. [Trust Graph Algorithm](#10-trust-graph-algorithm)
11. [API Layer Design](#11-api-layer-design)
12. [Data Flow Diagrams](#12-data-flow-diagrams)
13. [Deployment Architecture](#13-deployment-architecture)
14. [Non-Functional Requirements](#14-non-functional-requirements)
15. [Security Architecture](#15-security-architecture)
16. [Future Architecture Roadmap](#16-future-architecture-roadmap)

---

## 1. High-Level Architecture

TrustChain follows a **layered, service-oriented architecture** separating concerns cleanly across Client, API, Application Logic, Data, and Blockchain layers.

```
╔══════════════════════════════════════════════════════════════════════════╗
║                           CLIENT LAYER                                   ║
║  Next.js 14 (App Router) · TypeScript · Zustand · CSS Design System    ║
║                                                                          ║
║  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌─────────┐  ┌──────────┐ ║
║  │ Landing  │  │ Dashboard │  │ Circles  │  │  Loans  │  │Leaderbd. │ ║
║  └──────────┘  └───────────┘  └──────────┘  └─────────┘  └──────────┘ ║
╚══════════════════════════════╦═══════════════════════════════════════════╝
                               ║  HTTPS REST (Bearer JWT)
╔══════════════════════════════╩═══════════════════════════════════════════╗
║                             API LAYER                                    ║
║  Next.js 16 API Routes (Serverless) · Mongoose ORM · Zod Validation      ║
║                                                                          ║
║  /api/auth   /api/users   /api/circles   /api/loans   /api/score         ║
╚════╦══════════════╦═══════════════╦══════════════╦════════════════════════╝
     ║              ║               ║              ║
╔════╩═════╗ ╔══════╩═══════╗ ╔════╩════╗ ╔═══════╩══════════════╗
║   Auth   ║ ║Credit Engine ║ ║  Loan   ║ ║  Trust Graph Manager ║
║ Service  ║ ║ T·B·A Model  ║ ║ Engine  ║ ║  (Attestation Graph) ║
╚════╦═════╝ ╚══════╦═══════╝ ╚════╦════╝ ╚═══════╦══════════════╝
     ║              ║               ║              ║
╔════╩══════════════╩═══════════════╩══════════════╩════════════════════════╗
║                           DATA LAYER                                     ║
║  Phase 1 (MVP): MongoDB Database via Mongoose ORM                        ║
║  Phase 2 (Prod): PostgreSQL + Upstash Redis                              ║
╚══════════════════════════════╦════════════════════════════════════════════╝
                               ║
╔══════════════════════════════╩════════════════════════════════════════════╗
║                    STELLAR BLOCKCHAIN LAYER                               ║
║                                                                           ║
║  Horizon API ──── Account queries, payment streaming, tx submission     ║
║  Friendbot   ──── Testnet account funding (10,000 XLM)                  ║
║  XLM Asset   ──── Native token for loan disbursement                    ║
║  TRUST Asset ──── Custom Stellar asset (incentive token, Phase 2)       ║
║  Soroban     ──── Smart contracts for loan agreements (Phase 2)         ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## 2. Component Architecture

### Component Dependency Graph

```
                    ┌─────────────────────────────────────┐
                    │           walletStore (Zustand)      │
                    │  { pubKey, token, user, score }      │
                    └──────────────┬──────────────────────┘
                                   │ read/write
         ┌─────────────────────────┼───────────────────────────┐
         │                         │                           │
    ┌────▼────┐              ┌─────▼──────┐             ┌──────▼──────┐
    │ Navbar  │              │ ScoreGauge │             │WalletConnect│
    │(connect)│              │  (SVG arc) │             │(Freighter + │
    └────┬────┘              └─────┬──────┘             │ manual key) │
         │                         │                    └─────────────┘
         └──────────┬──────────────┘
                    │ via lib/api.ts
    ┌───────────────▼─────────────────────────────────────────────┐
    │                     API Client (lib/api.ts)                  │
    │  authAPI · usersAPI · circlesAPI · loansAPI · scoreAPI      │
    │  stellarAPI                                                  │
    └───────────────────────────────┬─────────────────────────────┘
                                    │ fetch() with Bearer JWT
                    ┌───────────────▼───────────────┐
                    │      Next.js API Routes       │
                    │      localhost:3000/api       │
                    └───────────────────────────────┘
```

### Page → Component → API Mapping

| Page | Components Used | API Calls |
|------|----------------|-----------|
| `/` (Landing) | Navbar, WalletConnect | `POST /auth/challenge`, `POST /auth/verify` |
| `/dashboard` | Navbar, ScoreGauge | `GET /users/me`, `GET /score/me`, `GET /stellar/account/:key`, `GET /loans` |
| `/circles` | Navbar | `GET /circles`, `GET /circles/public`, `POST /circles`, `POST /circles/:id/attest` |
| `/loans` | Navbar | `GET /loans`, `POST /loans`, `POST /loans/:id/repay`, `GET /loans/stats/global` |
| `/leaderboard` | Navbar | `GET /users` |

---

## 3. Frontend Architecture

### Next.js App Router Structure

```
frontend/src/app/
├── layout.tsx              Root layout (no "use client" — SSR for SEO)
│   └── Wraps all pages with HTML, head, font preloads
├── globals.css             Single CSS file — design system + all utility classes
│   ├── :root { CSS variables }   Primary design tokens
│   ├── .glass-card               Reusable card component
│   ├── .btn, .btn-primary        Button system
│   ├── .input                    Form input styles
│   ├── .progress-bar             Loan repayment bars
│   ├── .tier-* badges            Tier-specific color classes
│   └── @keyframes                Animations (fadeIn, pulse, shimmer)
├── page.tsx                Landing — "use client" for wallet interaction
├── dashboard/
│   └── page.tsx            "use client" — loads all data on mount
├── circles/
│   └── page.tsx            "use client" — real-time circle updates
├── loans/
│   └── page.tsx            "use client" — form state management
└── leaderboard/
    └── page.tsx            "use client" — public route, no auth required
```

### State Management (Zustand)

```typescript
// walletStore.ts — single source of truth for auth state
interface WalletState {
  pubKey: string | null;       // Stellar G... address
  token: string | null;        // JWT (also in localStorage)
  user: User | null;           // User profile from backend
  score: CreditScore | null;   // T·B·A credit score
  isConnecting: boolean;       // Loading state for connect button
  isConnected: boolean;        // Auth status

  setWallet(pubKey, token, user): void   // Called after auth/verify
  setScore(score): void                   // Called after score fetch
  disconnect(): void                     // Clears state + localStorage
}
```

### Design System Tokens

```css
/* Core palette */
--color-primary:      #6C63FF   /* Indigo violet — primary actions */
--color-secondary:    #00D9A6   /* Emerald teal — success/Stellar */
--color-accent:       #FFB347   /* Warm amber — TRUST token gold */
--color-surface:      #0A0B0F   /* Deep dark background */
--color-card:         #13151F   /* Card background */

/* Typography */
Font family: Space Grotesk (headings) + Inter (body)
Source: Google Fonts

/* Score tier colors */
--tier-establishing:  #EF4444   /* Red    — 0–299   */
--tier-building:      #F97316   /* Orange — 300–449 */
--tier-bronze:        #D97706   /* Amber  — 450–599 */
--tier-silver:        #94A3B8   /* Slate  — 600–749 */
--tier-gold:          #F59E0B   /* Gold   — 750–899 */
--tier-platinum:      #818CF8   /* Violet — 900–1000*/
```

---

## 4. Backend Architecture

### Next.js API Middleware Stack

```text
Request
  │
  ├── Next.js Middleware    # Edge execution, headers, redirects
  ├── requireAuth()         # JWT verification for protected routes
  │     └── verifies Bearer token → extracts pubKey
  │
  ├── /api/auth/*          # No auth — challenge/verify
  ├── /api/users           # No auth — public leaderboard
  ├── /api/circles/public  # No auth — browse circles
  │
  ├── /api/users/me        # Auth required
  ├── /api/circles/*       # Auth required (except /public)
  ├── /api/loans/*         # Auth required
  └── /api/score/*         # Auth required
```

### Service Layer

```
services/
├── creditEngine.js
│   ├── computeScore(pubKey)         → T + B + A, writes to db.scores
│   ├── computeTrustScore(pubKey)    → PageRank-inspired graph traversal
│   ├── computeBehaviorScore(pubKey) → Loan history analysis
│   ├── computeActivityScore(pubKey) → Wallet age + circles + attestations
│   ├── getTier(score)               → Tier name lookup
│   └── recalculateCircleMemberScores(circleId) → Batch recalculation
│
└── stellar.js
    ├── getAccountInfo(pubKey)        → { xlmBalance, trustBalance, exists }
    ├── getRecentTransactions(pubKey) → Last 10 payments (Horizon)
    ├── fundTestnetAccount(pubKey)    → Friendbot POST
    ├── getExplorerLink(txHash)       → Stellar Expert URL
    └── getAccountExplorerLink(pubKey) → Stellar Expert account URL
```

---

## 5. Database Design

### Phase 1: MongoDB Database (Current)

We use MongoDB Atlas with Mongoose ORM for persistent data storage, replacing the initial in-memory maps.

```typescript
// lib/models.ts — Mongoose schemas
export const User = models.User || model('User', UserSchema);
export const Circle = models.Circle || model('Circle', CircleSchema);
export const Loan = models.Loan || model('Loan', LoanSchema);
export const Attestation = models.Attestation || model('Attestation', AttestationSchema);
export const Score = models.Score || model('Score', ScoreSchema);
```

**Trade-offs:**
- ✅ High flexibility for rapid schema iteration
- ✅ Perfect for document-based attestation graphs
- ✅ Standardized integration via `connectDB()`
- ❌ No native relational integrity constraints

### Phase 2: PostgreSQL Schema (Planned)

```sql
-- Core tables for Phase 2 migration

CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stellar_pub_key VARCHAR(56) UNIQUE NOT NULL,
  display_name    VARCHAR(50),
  avatar_url      TEXT,
  kyc_level       SMALLINT DEFAULT 0,
  trust_tokens    DECIMAL(20,7) DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  last_active_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE credit_scores (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         VARCHAR(56) REFERENCES users(stellar_pub_key),
  total_score     SMALLINT NOT NULL,
  trust_score     SMALLINT NOT NULL,
  behavior_score  SMALLINT NOT NULL,
  activity_score  SMALLINT NOT NULL,
  tier            VARCHAR(20) NOT NULL,
  computed_at     TIMESTAMPTZ DEFAULT now(),
  version         INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE trust_circles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(80) NOT NULL,
  description     TEXT,
  creator_id      VARCHAR(56) REFERENCES users(stellar_pub_key),
  is_public       BOOLEAN DEFAULT true,
  max_members     SMALLINT DEFAULT 20,
  status          VARCHAR(20) DEFAULT 'ACTIVE',
  invite_code     VARCHAR(8) UNIQUE,
  reliability_score DECIMAL(10,4) DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE circle_memberships (
  circle_id       UUID REFERENCES trust_circles(id),
  user_id         VARCHAR(56) REFERENCES users(stellar_pub_key),
  role            VARCHAR(10) DEFAULT 'member',
  joined_at       TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (circle_id, user_id)
);

CREATE TABLE loans (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id           VARCHAR(56) REFERENCES users(stellar_pub_key),
  amount                DECIMAL(12,2) NOT NULL,
  currency              VARCHAR(10) DEFAULT 'XLM',
  duration_days         SMALLINT NOT NULL,
  purpose               VARCHAR(30) NOT NULL,
  status                VARCHAR(20) DEFAULT 'SUBMITTED',
  disbursed_at          TIMESTAMPTZ,
  due_date              TIMESTAMPTZ NOT NULL,
  repaid_amount         DECIMAL(12,2) DEFAULT 0,
  fee_percent           DECIMAL(5,2),
  stellar_tx_hash       VARCHAR(64),
  soroban_contract_id  VARCHAR(128),
  score_tier_at_request VARCHAR(20),
  created_at            TIMESTAMPTZ DEFAULT now()
);

-- Trust attestations stored in MongoDB for graph queries
-- (see MongoDB schema below)
```

### Phase 2: MongoDB Collection (Trust Graph)

```javascript
// attestations collection
{
  _id: ObjectId,
  fromUserId: "GXXX...",        // Attester Stellar pubKey
  toUserId: "GYYY...",          // Attestee Stellar pubKey
  circleId: "uuid",
  weight: 0.8,                  // 0.1 – 1.0
  bonusFactors: {
    timeBonus: 0.1,             // +0.1 after 30 days
    credibilityBonus: 0.15,     // +0.15 if attester repaid
  },
  createdAt: ISODate("..."),
  updatedAt: ISODate("..."),
}

// Indexes:
// { toUserId: 1 }          — fast lookup of incoming attestations
// { fromUserId: 1 }        — attestations given by user
// { circleId: 1 }          — attestations within a circle
// { fromUserId: 1, toUserId: 1 } — unique pair lookup
```

---

## 6. Credit Scoring Engine

### Full Algorithm Implementation

```javascript
// services/creditEngine.js

function computeTrustScore(pubKey) {
  const attestations = db.attestations.all().filter(a => a.toUserId === pubKey);

  let score = 0;
  for (const att of attestations) {
    const attesterScore = db.scores.get(att.fromUserId)?.totalScore || 300;
    const normalizedAttesterScore = attesterScore / 1000;
    const bonus = 1 + (att.timeBonus || 0) + (att.credibilityBonus || 0);
    score += att.weight * normalizedAttesterScore * bonus;
  }

  return Math.min(400, Math.round(score * 400));
}

function computeBehaviorScore(pubKey) {
  const loans = db.loans.all().filter(l => l.borrowerId === pubKey);
  if (loans.length === 0) return 200;  // Baseline for new users

  const repaid = loans.filter(l => l.status === 'REPAID').length;
  const defaults = loans.filter(l => l.status === 'DEFAULTED').length;
  const overdue = loans.filter(l => l.status === 'OVERDUE').length;

  let score = (repaid / loans.length) * 320;
  score -= defaults * 80;
  score -= overdue * 20;

  return Math.max(0, Math.min(400, Math.round(score)));
}

function computeActivityScore(pubKey) {
  const user = db.users.get(pubKey);
  const ageInDays = (Date.now() - new Date(user.createdAt)) / 86400000;
  const circles = db.circles.all().filter(c => c.members.includes(pubKey));
  const given = db.attestations.all().filter(a => a.fromUserId === pubKey);

  let score = 0;
  score += Math.min(80, ageInDays * 0.5);
  score += Math.min(60, circles.length * 20);
  score += Math.min(60, given.length * 10);

  return Math.round(Math.min(200, score));
}

function computeScore(pubKey) {
  const T = computeTrustScore(pubKey);      // 0 – 400
  const B = computeBehaviorScore(pubKey);   // 0 – 400
  const A = computeActivityScore(pubKey);   // 0 – 200
  const total = Math.min(1000, T + B + A);  // 0 – 1000

  return { totalScore: total, trustScore: T, behaviorScore: B, activityScore: A,
           tier: getTier(total), computedAt: new Date().toISOString() };
}
```

### Recalculation Trigger Map

| Event | Triggered In | Affected Users |
|-------|-------------|----------------|
| `POST /auth/verify` (new user) | `auth.js` | Self |
| `POST /circles/:id/join` | `circles.js` | All circle members |
| `POST /circles/:id/attest` | `circles.js` | Attester + Attestee |
| `DELETE /circles/:id/leave` | `circles.js` | All remaining members |
| `POST /loans/:id/repay` (full) | `loans.js` | Borrower (async, 100ms delay) |
| `POST /score/recalculate` | `score.js` | Self (manual trigger) |

---

## 7. Authentication & Security

### JWT Structure

```
Header: { alg: "HS256", typ: "JWT" }
Payload: {
  pubKey: "GXXX...",
  userId: "uuid",
  iat: 1714000000,
  exp: 1714086400    // 24 hours
}
Signature: HMAC-SHA256(base64(header) + "." + base64(payload), JWT_SECRET)
```

### Nonce Challenge Protocol

```
                Client                          Server
                  │                               │
                  │── POST /auth/challenge ──────►│
                  │   { pubKey: "GXXX..." }        │
                  │                               │ Generate: nonce = "TrustChain-UUID-ts"
                  │                               │ Store: db.nonces.set(pubKey, {nonce, TTL:5min})
                  │◄─ { nonce, message } ─────────│
                  │                               │
                  │ [Optional: freighter.signMessage(nonce)]
                  │                               │
                  │── POST /auth/verify ─────────►│
                  │   { pubKey, nonce, signature } │
                  │                               │ Validate: nonce match + TTL check
                  │                               │ Delete: db.nonces.delete(pubKey)
                  │                               │ Create/fetch user
                  │                               │ Sign JWT (24h)
                  │◄─ { token, user } ────────────│
                  │                               │
                  │ [Store token in localStorage]  │
                  │                               │
                  │── GET /api/users/me ──────────►│
                  │   Authorization: Bearer <JWT>  │
                  │                               │ authMiddleware: jwt.verify(token)
                  │◄─ { user profile }  ──────────│
```

---

## 8. Loan Lifecycle State Machine

```
┌──────────────────────────────────────────────────────────────┐
│                        LOAN STATES                            │
│                                                              │
│  DRAFT ──► SUBMITTED ──► UNDER_REVIEW ──► APPROVED          │
│                                    │                          │
│                                    └──► REJECTED (score low) │
│                                                              │
│  APPROVED ──► DISBURSED ──► REPAYING ──► REPAID ✅           │
│                    │             │                            │
│                    └──────────── └──► OVERDUE ──► DEFAULTED ❌│
└──────────────────────────────────────────────────────────────┘

State Transitions & Effects:
  APPROVED → score snapshot taken (tier locked)
  DISBURSED → Stellar payment tx hash recorded (Phase 2)
  REPAID → +TRUST tokens rewarded (50 on-time, 20 late)
  DEFAULTED → borrower score -heavy · all circle member scores -minor
```

### Business Rules

```
Rule 1: One active loan per user
  → APPROVED / DISBURSED / REPAYING blocks new requests

Rule 2: Tier eligibility check at request time
  → Score must be ≥ tier minimum at moment of POST /api/loans

Rule 3: Amount ceiling per tier
  → Bronze: $50 · Silver: $200 · Gold: $1,000 · Platinum: $5,000

Rule 4: Partial repayments allowed
  → loan.repaidAmount tracks running total
  → status moves DISBURSED → REPAYING on first partial
  → status moves REPAYING → REPAID when repaidAmount >= amount

Rule 5: TRUST fee is informational in MVP
  → Phase 2: actual TRUST token transfer required before disbursement
```

---

## 9. Stellar Blockchain Integration

### SDK Configuration

```javascript
const { Horizon, Networks, Asset, TransactionBuilder,
        Operation, Memo, BASE_FEE, Keypair } = require('@stellar/stellar-sdk');

const server = new Horizon.Server(
  process.env.STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org'
);
const NETWORK = process.env.STELLAR_NETWORK === 'MAINNET'
  ? Networks.PUBLIC
  : Networks.TESTNET;

const TRUST_ASSET = new Asset(
  process.env.TRUST_ASSET_CODE || 'TRUST',
  process.env.PROTOCOL_PUBLIC_KEY
);
```

### Horizon API Usage

| Operation | SDK Call | Use Case |
|-----------|----------|---------|
| Account info | `server.loadAccount(pubKey)` | Balance check on dashboard |
| Payment list | `server.payments().forAccount()` | Transaction history |
| Fund testnet | `fetch(friendbot?addr=...)` | New user onboarding |
| Submit tx | `server.submitTransaction(tx)` | Phase 2 disbursement |
| Stream | `server.payments().stream()` | Phase 2 repayment detection |

### Phase 2: Loan Disbursement Sequence

```
1. Backend validates loan approval
2. Load protocol account: server.loadAccount(PROTOCOL_KEY)
3. Build transaction:
   TransactionBuilder(account)
     .addOperation(Operation.payment({
       destination: borrowerPubKey,
       asset: Asset.native(),
       amount: loanAmount.toFixed(7)
     }))
     .addMemo(Memo.hash(sha256(loanId)))
     .setTimeout(30)
     .build()
4. Sign: tx.sign(Keypair.fromSecret(PROTOCOL_SECRET))
5. Submit: server.submitTransaction(tx)
6. Store: loan.stellarTxHash = result.hash
7. Stream listener: server.payments()
     .forAccount(PROTOCOL_ACCOUNT)
     .stream({ onmessage: detectRepayment })
```

### Soroban Contract Interface (Phase 2)

```rust
// soroban/contracts/loan_agreement/src/lib.rs

#[contract]
pub struct LoanAgreement;

#[contractimpl]
impl LoanAgreement {
    /// Initialize a new loan agreement
    pub fn initialize(
        env: Env,
        borrower: Address,
        amount: i128,      // in stroops (1 XLM = 10^7 stroops)
        due_date: u64,     // Unix timestamp
    ) -> Result<(), Error> { ... }

    /// Record a repayment
    pub fn repay(env: Env, caller: Address, amount: i128) -> Result<(), Error> { ... }

    /// Mark loan as defaulted (callable by protocol after due_date)
    pub fn default(env: Env) -> Result<(), Error> { ... }

    /// Read loan status
    pub fn get_status(env: Env) -> Symbol { ... }

    /// Read remaining balance
    pub fn get_remaining(env: Env) -> i128 { ... }
}
```

---

## 10. Trust Graph Algorithm

### Graph Model

```
G = (V, E)
  V = { all users as Stellar public key nodes }
  E = { directed weighted attestation edges }

Edge properties:
  from:   attester pubKey
  to:     attestee pubKey
  weight: 0.1 – 1.0 (user-set)
  bonus:  time + credibility factors

Trust propagation:
  T(u) = Σ [w(v, u) × credibility(v) × normalized_score(v)] × 400
         v ∈ in-neighbors(u)

  where credibility(v) = 1 + time_bonus(v,u) + credibility_bonus(v)
                           - credibility_penalty(v)
```

### Sybil Resistance Properties

| Defense | Implementation |
|---------|---------------|
| Minimum attestation requirement | Score only credited after 1+ mutual attestation |
| Bidirectional validation | Circle members must be in same circle |
| Attestation pair cooldown | 24h between re-attesting same user |
| Circle size cap | Max 20 members prevents mega-circles |
| Propagated penalty | Attester's score penalized if attestee defaults |
| Circle size constraint | Reputation penalty scales with weight given |

### Phase 2: Full PageRank Implementation

```python
# Planned Python ML service for Phase 2
import networkx as nx

def compute_trust_pagerank(attestation_edges: list[dict]) -> dict[str, float]:
    G = nx.DiGraph()
    for edge in attestation_edges:
        G.add_edge(
            edge['from'],
            edge['to'],
            weight=edge['weight'] * edge.get('credibility', 1.0)
        )
    pagerank = nx.pagerank(G, weight='weight', alpha=0.85)
    # Scale to 0–400
    max_pr = max(pagerank.values()) if pagerank else 1
    return {k: round((v / max_pr) * 400) for k, v in pagerank.items()}
```

---

## 11. API Layer Design

### Route Organization

```
backend/src/routes/
├── auth.js      POST /challenge   POST /verify
├── users.js     GET /me           PUT /me         GET /:pubKey    GET /
├── circles.js   POST /            GET /           GET /public
│                GET /:id          POST /:id/join  POST /:id/attest
│                DELETE /:id/leave
├── loans.js     POST /            GET /           GET /:id
│                POST /:id/repay   GET /stats/global
├── score.js     GET /me           GET /:pubKey    POST /recalculate
└── stellar.js   GET /account/:key GET /transactions/:key
                 POST /fund-testnet GET /network
```

### Error Response Format

```json
{
  "error": "Human-readable error message",
  "code": "OPTIONAL_ERROR_CODE",
  "details": {}
}
```

### Standard HTTP Status Usage

| Code | When Used |
|------|----------|
| `200` | Successful GET/PUT/DELETE |
| `201` | Successful POST (resource created) |
| `400` | Validation error, business rule violation |
| `401` | Missing or invalid JWT |
| `403` | Authenticated but not authorized (e.g., not circle member) |
| `404` | Resource not found |
| `429` | Rate limit exceeded |
| `500` | Unexpected server error |

---

## 12. Data Flow Diagrams

### User Onboarding Flow

```
New User Opens App
       │
       ▼
1. Landing page loads
2. User clicks "Connect Wallet"
       │
       ├── Freighter path:
       │     freighter.requestAccess() → address
       │
       └── Manual path:
             User pastes G... pubKey
       │
       ▼
3. POST /api/auth/challenge { pubKey }
   → Server: { nonce }
       │
       ▼
4. POST /api/auth/verify { pubKey, nonce }
   → Server creates user record
   → Server computes initial score
   → Server returns { token, user }
       │
       ▼
5. Zustand: setWallet(pubKey, token, user)
   localStorage: tc_token, tc_pubkey
       │
       ▼
6. Router.push('/dashboard')
       │
       ▼
7. Dashboard loads:
   Promise.all([
     GET /users/me,
     GET /score/me,
     GET /stellar/account/:key,
     GET /loans
   ])
       │
       ▼
8. ScoreGauge renders with T·B·A breakdown
```

### Credit Score Recalculation Flow

```
Credit Event (attestation / repayment / circle join)
       │
       ▼
Route handler updates db (circles / loans / attestations)
       │
       ▼
creditEngine.computeScore(affectedPubKey) called
       │
       ├── computeTrustScore()   → traverse db.attestations
       ├── computeBehaviorScore() → traverse db.loans
       └── computeActivityScore() → check circles + age
       │
       ▼
db.scores.set(pubKey, newScoreEntry)
       │
       ▼
Response returned to client with updated data
       │
       ▼
Client calls GET /score/me (or uses returned data)
ScoreGauge re-renders with animation
```

---

## 13. Deployment Architecture

### MVP (Phase 1) — Local Development

```
Developer Machine
├── localhost:3000  ← Next.js dev server (npm run dev)
├── localhost:4000  ← Express API server (node src/server.js)
└── Stellar Testnet ← External (horizon-testnet.stellar.org)

Data: In-memory (lost on restart)
Auth: JWT with dev secret
Network: TESTNET
```

### Production (Phase 2) — Cloud Deployment

```
┌─────────────────────┐     ┌────────────────────────────────────┐
│   Vercel            │────►│  Railway (or Render)               │
│   (Frontend)        │     │  (Backend — Node.js)               │
│   Next.js 14        │     │                                    │
│   Edge Network      │     │  Environment variables:            │
│   Auto SSL          │     │  · JWT_SECRET                      │
│   Preview URLs      │     │  · DATABASE_URL (Supabase)         │
└─────────────────────┘     │  · MONGO_URI (Atlas)               │
                            │  · REDIS_URL (Upstash)             │
                            │  · STELLAR_NETWORK=MAINNET         │
                            │  · PROTOCOL_SECRET_KEY             │
                            └──────────────┬─────────────────────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                      │
             ┌──────▼──────┐    ┌──────────▼──────┐    ┌────────▼────────┐
             │  Supabase   │    │  MongoDB Atlas  │    │  Upstash Redis  │
             │ (PostgreSQL)│    │  (Trust Graph)  │    │  (Cache+Queue)  │
             └─────────────┘    └─────────────────┘    └─────────────────┘
                                                 │
                                    ┌────────────▼────────────┐
                                    │   Stellar Mainnet       │
                                    │   horizon.stellar.org   │
                                    └─────────────────────────┘
```

### CI/CD Pipeline (Phase 2)

```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: cd backend && npm test
      - run: cd frontend && npm run build
  deploy:
    needs: test
    steps:
      - name: Deploy Frontend
        run: vercel --prod --token $VERCEL_TOKEN
      - name: Deploy Backend
        run: railway up --service backend
```

---

## 14. Non-Functional Requirements

| Category | Requirement | Target (Phase 1 MVP) | Target (Phase 2 Prod) |
|----------|-------------|---------------------|----------------------|
| **Performance** | API response time (p95) | < 500ms | < 200ms |
| **Performance** | Score recalculation | < 1s (in-memory) | < 30s (async queue) |
| **Performance** | Loan disbursement | N/A (mock) | < 60s (Stellar) |
| **Performance** | Page load (3G) | < 3s | < 2s |
| **Availability** | API uptime | Best-effort (local) | 99.5% monthly |
| **Scalability** | Concurrent users | 100 (single process) | 10,000 (clustered) |
| **Scalability** | Transactions/day | 1,000 | 100,000 |
| **Security** | Critical CVE response | Not tracked | < 24h |
| **Compliance** | Data privacy | Local dev only | GDPR compliant |
| **Accessibility** | WCAG | Manual review | 2.1 AA automated |

---

## 15. Security Architecture

### Defense in Depth

```
Layer 1: Network
  ├── HTTPS enforcement (Vercel/Railway auto-SSL)
  ├── CORS allowlist (FRONTEND_URL only)
  └── Rate limiting (100 req/min/IP)

Layer 2: Application
  ├── Helmet.js (14 security headers)
  ├── Input validation (Zod schemas on all bodies)
  ├── JWT HS256 with rotating secrets
  └── Nonce TTL for replay attack prevention

Layer 3: Business Logic
  ├── Tier-gated loan access (score enforcement)
  ├── One active loan per user rule
  ├── Circle membership validation before attestation
  └── Creator-cannot-leave rule (prevents orphaned circles)

Layer 4: Blockchain (Phase 2)
  ├── Multi-sig protocol account (2/3 threshold)
  ├── Loan hash in Stellar memo (tamper-evident)
  ├── Soroban contract audit (pre-mainnet)
  └── Bug bounty program

Layer 5: Data (Phase 2)
  ├── AES-256 encryption at rest (social graph)
  ├── Prisma ORM (parameterized queries, no SQL injection)
  ├── PII minimization (pubKey = primary identity)
  └── GDPR-compliant deletion (off-chain only; on-chain immutable)
```

---

## 16. Future Architecture Roadmap

### Phase 2 (Months 4–6): Hardening
| Feature | Technology | Effort |
|---------|-----------|--------|
| PostgreSQL migration | Prisma ORM + Supabase | High |
| MongoDB trust graph | Mongoose + Atlas | Medium |
| Redis score cache | Upstash + Bull queue | Medium |
| WebSocket real-time | `ws` library (scaffolded) | Medium |
| Stellar mainnet | Existing SDK (config change) | Low |
| Soroban contracts | Rust + soroban-sdk | Very High |
| Freighter sig verify | `stellar-sdk` verify | Low |
| Email notifications | Resend API | Low |

### Phase 3 (Months 7–12): Scale
| Feature | Technology | Effort |
|---------|-----------|--------|
| AI fraud detection | Python FastAPI + scikit-learn | High |
| PageRank trust graph | NetworkX (Python) | Medium |
| DAO governance | Soroban + custom voting | Very High |
| Multi-language | next-intl (Bengali, Hindi) | Medium |
| Mobile PWA | Next.js PWA config + service worker | Low |
| ZK identity | Polygon ID / zkPass | Very High |
| Fiat on-ramps | bKash/Mpesa partnership API | Very High |
| Protocol deploy kit | Docker + documentation | Medium |

---

*This architecture document is versioned alongside the codebase. Updates are committed with the corresponding feature commit.*
