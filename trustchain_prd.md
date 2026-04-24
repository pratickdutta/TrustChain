# TrustChain — Product Requirements Document (PRD)

> **Version:** 1.0.0  
> **Status:** Draft  
> **Last Updated:** April 23, 2026  
> **Author:** TrustChain Core Team  
> **Pitch:** *"TrustChain converts social trust into verifiable credit using Stellar, unlocking financial access for the next billion users."*

---

## Table of Contents

1. [Product Vision & Goals](#1-product-vision--goals)
2. [Problem Statement](#2-problem-statement)
3. [Target Users & Personas](#3-target-users--personas)
4. [Solution Overview](#4-solution-overview)
5. [System Architecture](#5-system-architecture)
6. [Feature Specifications](#6-feature-specifications)
7. [Credit Scoring Model](#7-credit-scoring-model)
8. [Tokenomics — TRUST Token](#8-tokenomics--trust-token)
9. [API Contract](#9-api-contract)
10. [Data Models](#10-data-models)
11. [UI/UX Requirements](#11-uiux-requirements)
12. [Security Model](#12-security-model)
13. [Blockchain Integration (Stellar)](#13-blockchain-integration-stellar)
14. [Non-Functional Requirements](#14-non-functional-requirements)
15. [Phased Roadmap](#15-phased-roadmap)
16. [Success Metrics (KPIs)](#16-success-metrics-kpis)
17. [Risks & Mitigations](#17-risks--mitigations)
18. [Open Questions](#18-open-questions)

---

## 1. Product Vision & Goals

### Vision
Empower the financially excluded by transforming community trust into cryptographically verifiable credit — removing institutional gatekeepers and enabling self-sovereign financial identity at global scale.

### Strategic Goals
| # | Goal | Metric |
|---|------|--------|
| G1 | Achieve financial inclusion for underserved populations | 100k users onboarded in Year 1 |
| G2 | Provide a transparent, bias-resistant alternative to FICO-style scoring | 0 opaque model decisions |
| G3 | Enable instant micro-lending at negligible cost | < $0.01 transaction fee per loan event |
| G4 | Build a self-sustaining, trust-incentivized credit economy | TRUST token circulation > $1M by Year 2 |

---

## 2. Problem Statement

### Current Landscape
- **1 billion+** individuals globally lack a verifiable credit history (World Bank, 2023)
- Traditional credit bureaus require formal banking relationships and employment records
- Digital lending platforms impose **predatory interest rates (200–600% APR)** with opaque scoring
- Existing DeFi lending requires over-collateralization — inaccessible to those without assets

### Core Pain Points
```
┌────────────────────────────────────────────────────────┐
│  No credit history → No loans → No credit history      │
│  (The Catch-22 of financial exclusion)                 │
└────────────────────────────────────────────────────────┘
```

| Pain Point | Impact |
|---|---|
| No verifiable identity or history | Rejected by all formal lenders |
| Informal moneylender dependency | 30–100% weekly interest cycles |
| No savings or collateral | Cannot access DeFi protocols |
| Distrust in centralized platforms | Privacy & data exploitation risk |

---

## 3. Target Users & Personas

### Persona 1 — Rina, the Micro-Entrepreneur
> **Age:** 28 | **Location:** Dhaka, Bangladesh | **Income:** ~$150/month (informal)
- Runs a street food stall, needs $50–$200 working capital loans
- Has a smartphone but no bank account
- Trusted by her local community; part of an informal savings group (samity)
- **Goal:** Access a $100 loan to buy bulk ingredients before Eid season

### Persona 2 — Kabir, the Trust Anchor
> **Age:** 42 | **Location:** Lagos, Nigeria | **Income:** $800/month (stable)
- Small business owner; has a Stellar wallet and understands DeFi basics
- Wants to use his established on-chain reputation to vouch for community members
- **Goal:** Earn TRUST token rewards by participating in circle verification

### Persona 3 — Meera, the Diaspora Supporter
> **Age:** 35 | **Location:** London, UK
- Sends remittances to family in India; wants to contribute to community credit pools
- **Goal:** Fund a micro-lending pool in her home village and track impact on-chain

### Persona 4 — Protocol Operator
- Developer or NGO running a TrustChain node/instance
- **Goal:** Deploy TrustChain for a specific community with custom parameters

---

## 4. Solution Overview

### Core Innovation
TrustChain introduces **Trust Circles** — peer-verified groups that act as social collateral, replacing traditional financial collateral.

```
Individual → Trust Circle → On-Chain Credit Score → Micro-Loan Access
```

### Three Pillars

| Pillar | Description |
|---|---|
| 🤝 **Social Trust Graph** | Peer attestations form a weighted directed graph of verified trust relationships |
| 📊 **Hybrid Credit Score** | Combines trust graph signals, behavioral history, and repayment consistency |
| ⛓️ **Stellar-Native Assets** | TRUST token and loan assets issued on Stellar for instant, low-cost settlement |

---

## 5. System Architecture

### High-Level Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│          Next.js 14 (App Router) + Freighter Wallet             │
│          Mobile-first | Multilingual | Low-bandwidth UX         │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTPS / WebSocket
┌──────────────────────────────▼──────────────────────────────────┐
│                         API LAYER                                │
│              Node.js / Express (REST + WebSocket)               │
│              Auth Middleware | Rate Limiter | Helmet             │
└──┬───────────────┬───────────────────┬───────────────┬──────────┘
   │               │                   │               │
┌──▼──────┐ ┌──────▼───────┐  ┌────────▼──────┐ ┌────▼──────────┐
│  Auth   │ │ Credit Score  │  │  Loan Engine  │ │  Trust Graph  │
│ Service │ │    Engine     │  │  (Risk Eval)  │ │   Manager     │
└──┬──────┘ └──────┬───────┘  └────────┬──────┘ └────┬──────────┘
   │               │                   │              │
┌──▼───────────────▼───────────────────▼──────────────▼──────────┐
│                      DATA LAYER                                  │
│    Next.js Serverless API + MongoDB Atlas (Persistence)          │
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                    STELLAR BLOCKCHAIN LAYER                       │
│  Horizon API | Soroban Smart Contracts | TRUST Asset | Accounts │
└─────────────────────────────────────────────────────────────────┘
```

### Component Breakdown

#### Client Layer (Next.js 14)
- **Framework:** Next.js 14 with App Router and Server Components
- **Wallet:** `@stellar/freighter-api` for authentication and signing
- **State:** Zustand for global wallet/user state
- **Styling:** Tailwind CSS + shadcn/ui
- **i18n:** next-intl (English, Bengali, Hindi — v1 roadmap)

#### API Layer (Node.js / Express)
- RESTful endpoints with OpenAPI 3.0 spec
- WebSocket for real-time loan status updates
- JWT sessions derived from Stellar keypair signatures
- Bull + Redis queue for async credit score recalculation

#### Application Logic

| Service | Responsibility |
|---|---|
| AuthService | Wallet signature verification, session management |
| CreditEngine | Score computation, weight management, recalculation triggers |
| TrustGraphManager | Node/edge CRUD, Dijkstra-based trust propagation |
| LoanEngine | Risk threshold evaluation, loan lifecycle management |
| RepaymentTracker | Horizon event listener, score delta computation |

#### Blockchain Layer (Stellar)
- **Network:** Stellar Testnet (Phase 1) → Mainnet (Phase 2)
- **Accounts:** Each user maps to a Stellar public key
- **Assets:** Custom `TRUST` asset issued by protocol account
- **Smart Contracts:** Soroban contracts for loan agreements and conditional repayment
- **Horizon:** Used for account info, transaction submission, event streaming

#### Data Layer
```
PostgreSQL:   users, loans, repayments, credit_scores
MongoDB:      trust_graph edges/nodes, social attestations
Redis:        session cache, score cache (TTL 1h), job queue
```

---

## 6. Feature Specifications

### F-01: User Onboarding

**Priority:** P0 (Must Have)

#### User Stories
- As a new user, I want to connect my Freighter wallet so that I can authenticate without a password
- As a new user, I want my Stellar account to be initialized automatically so I can start using TrustChain
- As a new user, I want to complete a guided onboarding flow so I understand how trust scores work

#### Acceptance Criteria
- [ ] User can connect Freighter wallet on testnet and mainnet
- [ ] On first connect, a user profile is created linked to the public key
- [ ] If the account has < 1 XLM, show a "fund your account" prompt with a QR code
- [ ] User completes a trust score explainer tutorial (skippable after first time)
- [ ] JWT session issued; expires in 24 hours; refreshable via re-sign

#### Tech Notes
- Use `freighter-api.isConnected()` and `freighter-api.getPublicKey()`
- Session: Sign a nonce with Freighter → verify with `stellar-sdk` on backend

---

### F-02: Trust Circle Management

**Priority:** P0 (Must Have)

#### User Stories
- As a user, I want to create a Trust Circle with a name and description
- As a user, I want to invite others to my circle via a shareable link
- As a user, I want to mutually verify other members so they can build credit
- As a member, I want to see the trust weight each member holds within the circle

#### Circle States
```
PENDING → ACTIVE → SUSPENDED → DISSOLVED
```

#### Acceptance Criteria
- [ ] Circle creation requires a minimum of 3 members
- [ ] All members must mutually attest each other (bidirectional graph edge)
- [ ] Maximum 20 members per circle (v1); configurable per operator
- [ ] **Privacy:** Circles can be public (joinable) or private (stealth, hidden from global directory)
- [ ] **UCI:** Every circle receives a Unique Circle Identifier (UCI) for precise searching and routing
- [ ] **Invite Signatures:** Private circle owners can distribute bypass keys for instant join approvals
- [ ] Leaving a circle triggers a score recalculation for all remaining members

#### Data Contract
```json
{
  "circleId": "uuid",
  "name": "string",
  "description": "string",
  "creatorId": "Stellar public key",
  "isPublic": true,
  "uci": "string",
  "socialLink": "string (optional)",
  "members": ["pubKey1", "pubKey2"],
  "attestations": [{ "from": "pubKey1", "to": "pubKey2", "weight": 0.8 }],
  "status": "ACTIVE",
  "createdAt": "ISO8601"
}
```

---

### F-03: Credit Score Computation

**Priority:** P0 (Must Have)

> Detailed scoring model in [Section 7](#7-credit-scoring-model)

#### Acceptance Criteria
- [ ] Score computed on: wallet creation, trust attestation, loan repayment, circle join/leave
- [ ] Score range: 0–1000 (displayed as a visual meter)
- [ ] Score history is immutably logged; user can view full history
- [ ] Score is recalculated asynchronously (max 30s delay)
- [ ] Users can see a breakdown: Trust Score, Behavior Score, Activity Score

---

### F-04: Loan Request & Disbursement

**Priority:** P0 (Must Have)

#### User Stories
- As a user with a score ≥ 450, I want to request a micro-loan
- As a user, I want the loan to be disbursed in XLM or stablecoin to my Stellar account
- As a lender/pool, I want to fund requests from qualified borrowers automatically

#### Loan Tiers
| Tier | Min Score | Max Amount | Max Duration | Interest Rate |
|---|---|---|---|---|
| Bronze | 450 | $50 (XLM) | 14 days | 0% + 2% TRUST fee |
| Silver | 600 | $200 (XLM) | 30 days | 0% + 1.5% TRUST fee |
| Gold | 750 | $1,000 (XLM) | 90 days | 0% + 1% TRUST fee |
| Platinum | 900 | $5,000 (XLM) | 180 days | Community governed |

#### Acceptance Criteria
- [ ] Loan request form: amount, purpose (dropdown), duration
- [ ] Backend evaluates: credit score ≥ threshold, circle reliability, outstanding loans
- [ ] Circle members notified of borrower's loan request (transparency)
- [ ] Loan disbursed via Stellar payment operation within 60 seconds of approval
- [ ] Loan agreement stored as Soroban contract or Stellar memo hash
- [ ] One active loan per user maximum (v1)

#### Loan Lifecycle
```
DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED → DISBURSED
      → REPAYING → REPAID / OVERDUE / DEFAULTED
```

---

### F-05: Repayment Tracking

**Priority:** P0 (Must Have)

#### Acceptance Criteria
- [ ] User repays by sending XLM to the protocol account with loan ID in memo
- [ ] Horizon event listener detects repayment within 2 minutes
- [ ] Partial repayments supported; remaining balance updated in real-time
- [ ] On-time repayment: +score delta; late repayment: -score delta; default: -heavy penalty
- [ ] Repayment history displayed on user dashboard with on-chain proof link

---

### F-06: Dashboard & Analytics

**Priority:** P1 (Should Have)

#### Acceptance Criteria
- [ ] User dashboard: credit score gauge, active loans, repayment schedule, trust circle overview
- [ ] Transaction timeline with Stellar Explorer deep-links
- [ ] Community leaderboard (opt-in) showing top contributors
- [ ] Circle health score visible to all circle members
- [ ] Protocol-level stats: total users, total loans disbursed, total TRUST tokens in circulation

---

### F-07: TRUST Token Management

**Priority:** P1 (Should Have)

#### Acceptance Criteria
- [ ] Users earn TRUST tokens on: on-time repayment, vouching a borrower who repays, circle milestones
- [ ] TRUST token displayed in user wallet and dashboard
- [ ] TRUST tokens can be staked to increase credit tier (governance v2)
- [ ] Stellar trustline must be established before receiving TRUST tokens

---

### F-08: Notifications

**Priority:** P2 (Nice to Have)

- Email + in-app: loan approved, repayment due (3 days, 1 day, overdue), circle invitation, score change
- Push notifications via PWA for mobile users

---

## 7. Credit Scoring Model

### Formula

```
Final Score (0–1000) = w₁·T + w₂·B + w₃·A
```

| Component | Symbol | Weight (v1) | Description |
|---|---|---|---|
| Trust Score | T | 0.40 | Graph-based peer attestation score |
| Behavior Score | B | 0.40 | Repayment history, default flag, on-time rate |
| Activity Score | A | 0.20 | Transaction volume, wallet age, circle participation |

### Trust Score (T) — Graph Algorithm

```
Graph: G = (V, E) where V = users, E = weighted attestations

T(u) = Σ [w(v,u) · PageRank(v)] for all v ∈ neighbors(u)

Attest weight w(v,u):
  - New attestation:   0.5 (base)
  - After 30 days:    +0.1 (time bonus)
  - If v repaid loan: +0.15 (credibility bonus)
  - If v defaulted:   -0.3 (credibility penalty)
```

### Behavior Score (B)

```
B = (on_time_repayments / total_loans) × 800
  + active_days_streak × 0.5
  - default_count × 200
  - overdue_days × 2
```

### Activity Score (A)

```
A = min(200, wallet_age_days × 0.3)
  + min(300, transaction_count × 2)
  + circle_count × 50
  + attestations_given × 10
```

### Score Recalculation Triggers

```
Event                       → Recalculate For
───────────────────────────────────────────────
Loan repaid (on time)       → Borrower (+)
Loan defaulted              → Borrower (-), all circle members (-)
New attestation given       → Attester, Attestee
Circle member joined/left   → All circle members
30-day periodic refresh     → All active users
```

### Score Tier Labels

| Score | Label | Color |
|---|---|---|
| 0–299 | Establishing | 🔴 Red |
| 300–449 | Building | 🟠 Orange |
| 450–599 | Bronze | 🟡 Yellow |
| 600–749 | Silver | ⚪ Silver |
| 750–899 | Gold | 🟡 Gold |
| 900–1000 | Platinum | 💎 Platinum |

---

## 8. Tokenomics — TRUST Token

### Asset Spec
```
Asset Code:   TRUST
Issuer:       [Protocol Stellar Account]
Network:      Stellar Mainnet
Total Supply: 100,000,000 TRUST (hard cap)
Decimals:     7 (Stellar default)
```

### Distribution
```
┌─────────────────────────────────────────────┐
│  40% — User Incentives (repayment rewards)  │
│  20% — Liquidity Reserves                  │
│  15% — Team & Advisors (3yr vesting)        │
│  15% — Ecosystem & Grants                   │
│  10% — Initial Protocol Treasury            │
└─────────────────────────────────────────────┘
```

### Earning TRUST
| Action | Reward |
|---|---|
| On-time full repayment | 50 TRUST per loan |
| On-time partial repayment | 20 TRUST |
| Vouch for borrower who repays | 15 TRUST |
| 30-day activity streak | 10 TRUST |
| Circle creation (5+ members) | 25 TRUST |

### Spending TRUST
| Usage | Cost |
|---|---|
| Bronze tier loan fee | 2% of loan in TRUST |
| Silver tier loan fee | 1.5% of loan in TRUST |
| Gold tier loan fee | 1% of loan in TRUST |
| Boost attestation weight | 5 TRUST per boost |
| Governance vote (v2) | 1 TRUST per vote |

---

## 9. API Contract

### Base URL
```
Production:  https://api.trustchain.finance/v1
Testnet:     https://testnet-api.trustchain.finance/v1
```

### Authentication
All protected routes require:
```
Authorization: Bearer <JWT>
```
JWT is issued by `POST /auth/verify` after wallet signature challenge.

### Endpoints

#### Auth
```
POST /auth/challenge        → { nonce: string }
POST /auth/verify           → { token: JWT, user: UserProfile }
```

#### Users
```
GET  /users/me              → UserProfile
PUT  /users/me              → Update profile metadata
GET  /users/:pubKey         → Public profile (score, circles)
```

#### Credit Score
```
GET  /score/me              → { total, trust, behavior, activity, history[] }
GET  /score/:pubKey         → Public score (read-only)
POST /score/recalculate     → Trigger async recalculation
```

#### Trust Circles
```
POST /circles               → Create circle
GET  /circles               → List user's circles
GET  /circles/:id           → Circle details
POST /circles/:id/join      → Join circle (with invite token)
POST /circles/:id/attest    → Attest a member { targetPubKey, weight }
DELETE /circles/:id/leave   → Leave circle
```

#### Loans
```
POST /loans                 → Request loan { amount, currency, durationDays, purpose }
GET  /loans                 → List user's loans
GET  /loans/:id             → Loan details + repayment schedule
POST /loans/:id/repay       → Submit repayment record
```

#### Tokens
```
GET  /tokens/balance        → TRUST balance for authenticated user
GET  /tokens/history        → TRUST earn/spend history
```

---

## 10. Data Models

### User
```typescript
interface User {
  id: string;                  // UUID
  stellarPublicKey: string;    // Stellar public key (PK)
  displayName?: string;
  avatarUrl?: string;
  createdAt: Date;
  lastActiveAt: Date;
  kycLevel: 0 | 1 | 2;        // 0=anon, 1=basic, 2=verified
  isActive: boolean;
}
```

### CreditScore
```typescript
interface CreditScore {
  userId: string;
  totalScore: number;          // 0–1000
  trustScore: number;          // T component
  behaviorScore: number;       // B component
  activityScore: number;       // A component
  tier: 'establishing' | 'building' | 'bronze' | 'silver' | 'gold' | 'platinum';
  computedAt: Date;
  version: number;             // Increments on each recalculation
}
```

### TrustCircle
```typescript
interface TrustCircle {
  id: string;
  name: string;
  description?: string;
  creatorId: string;
  isPublic: boolean;
  maxMembers: number;          // Default: 20
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DISSOLVED';
  members: CircleMember[];
  reliabilityScore: number;
  createdAt: Date;
}

interface CircleMember {
  userId: string;
  role: 'creator' | 'member';
  attestationWeight: number;
  joinedAt: Date;
}
```

### Loan
```typescript
interface Loan {
  id: string;
  borrowerId: string;
  amount: number;              // In XLM
  currency: 'XLM' | 'USDC';
  durationDays: number;
  purpose: LoanPurpose;
  status: LoanStatus;
  disbursedAt?: Date;
  dueDate?: Date;
  repaidAmount: number;
  stellarTxHash?: string;      // Disbursement tx
  sorobanContractId?: string;  // Loan agreement contract
  createdAt: Date;
}

type LoanStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED'
                | 'DISBURSED' | 'REPAYING' | 'REPAID' | 'OVERDUE' | 'DEFAULTED';

type LoanPurpose = 'working_capital' | 'education' | 'medical' |
                   'agriculture' | 'equipment' | 'other';
```

### TrustAttestation (MongoDB)
```typescript
interface TrustAttestation {
  fromUserId: string;
  toUserId: string;
  circleId: string;
  weight: number;              // 0.0–1.0
  bonusFactors: {
    timeBonus: number;
    credibilityBonus: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 11. UI/UX Requirements

### Design Principles
1. **Accessibility First** — WCAG 2.1 AA compliance; minimum 4.5:1 contrast ratio
2. **Low-Literacy Friendly** — Visual iconography alongside text; progress bars over percentages
3. **Offline Aware** — Service worker caches key screens; graceful degradation on poor connectivity
4. **Mobile First** — Design breakpoints: 320px → 768px → 1024px+

### Key Screens

#### Screen 1: Landing / Connect Wallet
- Hero with trust score animation (animated ring meter)
- "Connect Freighter" CTA — primary action, prominent
- How It Works: 3-step illustration (Connect → Join Circle → Get Credit)
- Testimonials / community stats counter

#### Screen 2: Dashboard (Authenticated)
- **Credit Score Gauge** — animated arc meter, 0–1000, color-coded by tier
- **Score Breakdown** — T / B / A bars with tooltips
- **Active Loan Card** — amount, due date, % repaid progress bar
- **Trust Circle Widget** — member avatars, circle reliability score
- **Quick Actions** — Request Loan | Invite to Circle | Send TRUST

#### Screen 3: Trust Circle
- Member list with individual trust scores and attestation status
- Attestation flow: select member → set weight slider (0.1–1.0) → confirm
- Circle invite link / QR code generator
- Circle health score + history chart

#### Screen 4: Loan Request
- Step form: Amount → Duration → Purpose → Review → Submit
- Real-time eligibility indicator (score vs. required threshold)
- Estimated TRUST fee calculator
- Clear T&C linking to Soroban contract on Stellar Explorer

#### Screen 5: Repayment
- Loan repayment schedule (table + timeline view)
- "Pay Now" button → opens Freighter with pre-filled transaction
- On-chain payment verification status (Pending → Confirmed)
- Score impact preview: "Repaying on time will add +35 points"

### Color Palette
```css
--color-primary:     #6C63FF;  /* Indigo violet */
--color-secondary:   #00D9A6;  /* Emerald teal */
--color-accent:      #FFB347;  /* Warm amber (TRUST gold) */
--color-surface:     #0F1117;  /* Deep dark */
--color-card:        #1A1D27;  /* Card background */
--color-text:        #EAEAEA;  /* Primary text */
--color-muted:       #6B7280;  /* Muted text */

/* Score Tier Colors */
--tier-establishing: #EF4444;
--tier-building:     #F97316;
--tier-bronze:       #EAB308;
--tier-silver:       #94A3B8;
--tier-gold:         #F59E0B;
--tier-platinum:     #818CF8;
```

---

## 12. Security Model

### Authentication
- **No passwords** — authentication is exclusively via Stellar keypair signatures
- Challenge-response: server issues a random nonce → client signs with Freighter → server verifies with `stellar-sdk`
- JWT HS256, 24h expiry, rotatable signing secret

### On-Chain Security
- All loan agreements reference a `sha256(loanId + terms)` stored in Stellar memo or Soroban contract storage
- Protocol account uses **multi-sig** requiring 2/3 signers for large disbursements (> $500)
- Soroban contracts are audited before mainnet deployment

### API Security
- Helmet.js headers on all API responses
- Rate limiting: 100 req/min per IP; 30 req/min per authenticated user
- Input validation: Zod schema on all request bodies
- SQL injection prevention: Prisma ORM with parameterized queries
- CORS: allowlist of production domain only

### Trust Graph Security
- Sybil resistance: minimum 3 mutual attestations before score is credited
- Attestation cool-down: 24 hours between attesting the same user
- Circle size limits prevent artificial score inflation
- Reputation penalties propagate to vouchers on borrower default

### Data Privacy
- Off-chain social graph is encrypted at rest (AES-256)
- User display names and metadata are optional; public key is the primary identity
- GDPR-compliant data deletion (removes off-chain data; on-chain records are immutable)

---

## 13. Blockchain Integration (Stellar)

### Network Config
```javascript
// Testnet (Phase 1)
const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
const network = StellarSdk.Networks.TESTNET;

// Mainnet (Phase 2)
const server = new StellarSdk.Horizon.Server('https://horizon.stellar.org');
const network = StellarSdk.Networks.PUBLIC;
```

### Key Operations

#### 1. Account Creation & Trustline Setup
```javascript
// Establish TRUST token trustline
const trustOp = StellarSdk.Operation.changeTrust({
  asset: new StellarSdk.Asset('TRUST', PROTOCOL_ISSUER),
  limit: '1000000'
});
```

#### 2. Loan Disbursement
```javascript
const loanOp = StellarSdk.Operation.payment({
  destination: borrowerPublicKey,
  asset: StellarSdk.Asset.native(), // XLM
  amount: loanAmount.toString(),
});
// Memo: sha256(loanId) for on-chain reference
const memo = StellarSdk.Memo.hash(sha256(loanId));
```

#### 3. Event Listening (Repayment Detection)
```javascript
server.payments()
  .forAccount(PROTOCOL_ACCOUNT)
  .cursor('now')
  .stream({
    onmessage: (payment) => {
      if (payment.memo === expectedLoanHash) {
        triggerRepaymentProcessing(payment);
      }
    }
  });
```

#### 4. Soroban Contract (Loan Agreement)
```rust
// soroban/contracts/loan_agreement/src/lib.rs
#[contract]
pub struct LoanAgreement;

#[contractimpl]
impl LoanAgreement {
    pub fn initialize(env: Env, borrower: Address, amount: i128, due_date: u64) { ... }
    pub fn repay(env: Env, borrower: Address, amount: i128) { ... }
    pub fn check_status(env: Env) -> LoanStatus { ... }
}
```

### Stellar-Specific Constraints
- Minimum account balance: 1 XLM (base reserve)
- Trustline reserve: 0.5 XLM per asset
- Transaction fee: ~0.00001 XLM (negligible)
- Soroban contract storage fees: account for in loan fee model

---

## 14. Non-Functional Requirements

| Category | Requirement | Target |
|---|---|---|
| **Performance** | API response time (p95) | < 300ms |
| **Performance** | Credit score recalculation | < 30 seconds async |
| **Performance** | Loan disbursement (post-approval) | < 60 seconds |
| **Availability** | API uptime | 99.5% monthly |
| **Scalability** | Concurrent users | 10,000 (Phase 1) |
| **Scalability** | Transactions per day | 100,000 |
| **Security** | Vulnerability response | < 24h critical, < 7d high |
| **Compliance** | Data privacy | GDPR + applicable local law |
| **Accessibility** | WCAG compliance | 2.1 AA |
| **Mobile** | Page load on 3G | < 3 seconds |

---

## 15. Phased Roadmap

### Phase 1 — Foundation (Months 1–3)
**Goal: Working testnet prototype with core trust circle and scoring**

- [ ] Project architecture and repo setup
- [ ] Freighter wallet authentication (testnet)
- [ ] User profile management
- [ ] Trust Circle creation and attestation
- [ ] Credit score v1 computation (simplified)
- [ ] Basic dashboard UI
- [ ] Loan request and manual approval (admin-backed liquidity)
- [ ] XLM loan disbursement on testnet
- [ ] Repayment detection via Horizon listener

**Deliverable:** Functional testnet demo, pitch-ready

---

### Phase 2 — Hardening (Months 4–6)
**Goal: Production-ready system with TRUST token and Soroban contracts**

- [ ] Soroban loan agreement contracts
- [ ] TRUST token issuance and distribution engine
- [ ] Credit score v2 (graph propagation via PageRank)
- [ ] Automated loan approval engine
- [ ] Mainnet deployment with real liquidity pool
- [ ] Security audit (Soroban contracts + API)
- [ ] Performance optimization and load testing
- [ ] Mobile-optimized PWA

**Deliverable:** Mainnet launch with controlled user cohort

---

### Phase 3 — Scale (Months 7–12)
**Goal: Community growth, governance, and multilingual expansion**

- [ ] **Automated Wallet Garnishing (Soroban)**: Programmable debt agreements granting TrustChain "Allowance" rights. On default, smart contract enters "Overdue Intercept" mode, instantly routing future XLM/USDC deposits to the lender until debt is paid.
- [ ] TRUST token DAO governance module
- [ ] AI-assisted credit risk modeling (off-chain ML inference)
- [ ] Fiat on/off ramps (via local payment partners)
- [ ] Bengali and Hindi language support
- [ ] Digital identity integration (Aadhaar, NID via ZK proof)
- [ ] Protocol operator deployment toolkit
- [ ] Community grants program
- [ ] Public analytics dashboard

**Deliverable:** 100k users, self-sustaining credit economy, automated garnishing system active

---

### Phase 4 — Identity & Exile (Year 2+)
**Goal: Advanced Web3 identity locking and inescapable reputational permanence**

- [ ] **Identity Blacklisting via Oracles**: Prevent users from simply abandoning a defaulted wallet. Link wallet to a real-world identifier (e.g., phone number via SMS OTP, Gitcoin Passport) via decentralized oracles.
- [ ] **Permanent Exile**: A default permanently blacklists the associated human identity from TrustChain and any connected Web3 credit architectures until the debt + massive late fee is repaid.
- [ ] Zero-Knowledge Proofs for identity preservation without KYC data leakage
- [ ] Decentralized Debt Collection Bounties (on-chain debt purchasing)

**Deliverable:** Sybil-proof identity layer with permanent default penalties

---

## 16. Success Metrics (KPIs)

### User Acquisition
| Metric | Target (6 months) | Target (12 months) |
|---|---|---|
| Registered Users | 10,000 | 100,000 |
| Active Trust Circles | 500 | 5,000 |
| Monthly Active Users | 3,000 | 40,000 |

### Credit & Loan Performance
| Metric | Target |
|---|---|
| Loans Disbursed | 1,000/month by Month 6 |
| On-Time Repayment Rate | ≥ 80% |
| Average Loan Size | $75–$150 (v1) |
| Default Rate | < 8% |
| Average Credit Score (active users) | ≥ 550 |

### Blockchain & Protocol
| Metric | Target |
|---|---|
| TRUST Token Circulation | 5M TRUST by Month 12 |
| Total XLM Disbursed | $500K equivalent |
| Average Loan Disbursement Time | < 60 seconds |
| Stellar Transaction Fees | < $0.01/transaction |

### User Trust & Retention
| Metric | Target |
|---|---|
| Day 30 Retention | ≥ 40% |
| NPS Score | ≥ 50 |
| Circle Participation Rate | ≥ 60% of users in a circle |

---

## 17. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Sybil attacks on trust graph | High | High | Minimum mutual attestation threshold, account age gate, circle size limits |
| Soroban smart contract bugs | Medium | Critical | Independent audit before mainnet; bug bounty program |
| XLM price volatility affects loan value | High | Medium | Denominate loans in USDC equivalent; display fiat value |
| Low initial liquidity for loans | Medium | High | Bootstrap with partner NGO/grant funding; admin-backed pool in Phase 1 |
| Stellar network downtime | Low | High | Retry mechanisms; graceful UI degradation; Horizon fallback nodes |
| Regulatory compliance (lending laws) | Medium | High | Legal review per jurisdiction; pilot with NGO partner in permissive regimes |
| Freighter wallet UX barrier for new crypto users | High | Medium | In-app wallet creation guide; consider embedded wallet alternative |
| Score manipulation via coordinated attestation | Medium | High | Graph anomaly detection; attestation cool-downs; circle reliability penalties |

---

## 18. Open Questions

| # | Question | Owner | Due |
|---|---|---|---|
| Q1 | Which jurisdictions to target first for legal compliance? | Legal | Month 1 |
| Q2 | What is the initial liquidity pool size and source (grants, investors)? | Business | Month 1 |
| Q3 | Should v1 support USDC in addition to XLM? | Product | Month 2 |
| Q4 | AI credit model: build in-house or use third-party ML API? | Engineering | Month 4 |
| Q5 | KYC requirement: mandatory above what loan threshold? | Legal/Product | Month 2 |
| Q6 | Soroban vs. Stellar Classic for loan escrow — finalize approach? | Engineering | Month 1 |
| Q7 | Embedded wallet (e.g., Albedo) as Freighter fallback for non-crypto users? | Engineering | Month 2 |
| Q8 | DAO governance timeline and initial governance token distribution? | Product | Month 6 |

---

*This PRD is a living document. Updates will be versioned and communicated to all stakeholders.*

---

**END OF DOCUMENT**
