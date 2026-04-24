<div align="center">

<img src="./frontend/public/logo.png" alt="TrustChain Logo" width="140" style="border-radius: 50%;" />

# TrustChain
### Decentralized Social Credit Network on Stellar Blockchain

*"Trust today, empower tomorrow."*

[![Stellar Testnet](https://img.shields.io/badge/Stellar-Testnet-7B3FE4?style=for-the-badge&logo=stellar&logoColor=white)](https://stellar.expert/explorer/testnet)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Status: Beta](https://img.shields.io/badge/Status-Beta_Release-FFB347?style=for-the-badge)](#)

<br/>
<h3>🚀 Live Demo: <a href="https://trustchain-official.vercel.app">trustchain-official.vercel.app</a></h3>

</div>

---

## Abstract

TrustChain is a decentralized micro-lending protocol built on the Stellar blockchain. It converts social trust and community reputation into a verifiable on-chain credit score, enabling individuals without formal financial history to access liquidity pools.

Rather than requiring collateral, TrustChain uses a Trust Circle attestation graph, where peers vouch for one another to generate a quantifiable TBA (Trust + Behavior + Activity) credit score between 0 and 1000. This score is then used to automatically gate access to micro-loan tiers through smart contract logic.

---

## The Problem

Over 1.4 billion adults globally are unbanked, not because they are untrustworthy, but because they have no paper trail that a traditional institution can verify. They have real-world community reputation, but no mechanism to present it to a lender.

TrustChain solves this by making community reputation cryptographically verifiable and economically actionable.

---

## How It Works

```text
User connects wallet
       │
       ▼
Forms / joins Trust Circles → peers vouch for each other
       │
       ▼
On-chain TBA Credit Score computed (0–1000)
       │
       ▼
Score gates access to Loan Tiers (Bronze → Platinum)
       │
       ▼
Loan requested → Smart Contract auto-approves eligible borrowers
       │
       ▼
Repayment history feeds back into Behavior Score
```

### The TBA Scoring Model

| Component | Weight | Measures |
|-----------|--------|----------|
| **T** — Trust Score | 40% | Peer attestation graph (PageRank-inspired) |
| **B** — Behavior Score | 40% | Loan repayment history |
| **A** — Activity Score | 20% | Wallet age, circle memberships, attestations given |

### Loan Tiers

| Tier | Min Score | Max Amount | Duration |
|------|-----------|------------|----------|
| Bronze | 450 | $50 | 14 days |
| Silver | 600 | $200 | 30 days |
| Gold | 750 | $1,000 | 90 days |
| Platinum | 900 | $5,000 | 180 days |

---

## Architecture

### System Overview

We utilize a modern, decoupled architecture powered natively by Next.js 16 App Router for both client rendering and serverless backend routes, with MongoDB for persistence.

```text
┌─────────────────────────────────────────────────────┐
│                   CLIENT LAYER                       │
│  Next.js 16 (App Router) · TypeScript · Zustand     │
│  Landing · Dashboard · Circles · Loans · Lender     │
└────────────────────────┬────────────────────────────┘
                         │ HTTPS / REST (Bearer JWT)
┌────────────────────────▼────────────────────────────┐
│                    API LAYER                         │
│   Next.js API Routes (Serverless) · Mongoose ORM     │
│  /api/auth  /api/circles  /api/loans  /api/score     │
└────┬──────────────┬──────────────┬──────────────────┘
     │              │              │
┌────▼──────┐ ┌─────▼──────┐ ┌────▼──────────────────┐
│  Auth     │ │  Credit    │ │  Trust Graph Manager  │
│  Service  │ │  Engine    │ │  MongoDB Database     │
│  (JWT)    │ │  T·B·A     │ │  Schema Validation    │
└───────────┘ └────────────┘ └───────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│               STELLAR BLOCKCHAIN LAYER               │
│  Horizon API · Freighter Wallet · XLM · Soroban     │
└─────────────────────────────────────────────────────┘
```

### Authentication Flow

```text
1. User clicks "Connect Wallet" → Freighter browser extension
2. POST /api/auth/challenge { pubKey } → Server issues UUID nonce
3. Freighter signs nonce cryptographically
4. POST /api/auth/verify { pubKey, nonce, signature } → JWT issued (24h)
5. JWT stored in localStorage → Bearer token on all API requests
```

---

## Features

### Trust Circles & Architecture
- **UCI (Unique Circle Identification)** — Cryptographically unique identifiers ensuring privacy routing.
- **Invite Signatures** — Bypass codes enabling instant private circle joining.
- **Public & Private Visibility** — Stealth controls for communities.
- **Platinum Approvals** — Strict permission gating for high-level operations.
- **MoneyPools** — Convert any Trust Circle into a decentralized lending pool.

### For Borrowers
- **Score Dashboard** — Animated SVG arc gauge showing live T·B·A breakdown.
- **Trust Circles** — Create or join peer groups, vouch for members with a weighted attestation.
- **Liquidity Gateway** — Request micro-loans, view repayment history (including Principal + Interest), track active drawdowns.
- **Leaderboard** — Community-wide credit score ranking.

### For Lenders
- **Lender Gateway** — Register as a lender, set exposure limits, minimum borrower score thresholds.
- **Manual Review Mode** — Toggle between smart contract auto-approval and personal loan review.
- **Portfolio View** — Track active loans you've approved and their repayment status.

### Protocol
- **Hybrid Lending Model** — Pool-to-Peer architecture; lenders deposit into a shared pool and the smart contract auto-approves eligible borrowers.
- **Social Slashing** — Defaults trigger cascading penalties across the defaulter's entire Trust Circle.
- **TRUST Token Burning** — All of a defaulter's TRUST tokens are seized and burned on-chain.
- **Cinematic UI** — Branded intro animations, glassmorphism, and responsive interactions.

---

## Default Penalty System

TrustChain enforces accountability without traditional collateral through a **three-layer penalty cascade** that fires automatically on loan default:

| Layer | Who Is Penalized | Penalty |
|-------|-----------------|---------|
| 🔥 **TRUST Token Seizure** | Borrower | Entire TRUST token balance burned to zero |
| 📉 **Score Collapse** | Borrower | BehaviorScore drops **–150 points** (often a full tier downgrade) |
| ⚡ **Social Slashing** | Every attester who vouched for the borrower | –100 TRUST tokens + **–40 BehaviorScore** each |

### Why This Works
Because borrowers' peers are penalized for a default, the **community itself becomes the enforcement mechanism**. Friends, circle members, and vouchers apply real social pressure for repayment — making defaults socially costly, not just financially costly.

---

## Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| Next.js 16 (App Router) | React framework, routing, SSR |
| TypeScript 5 | Type safety |
| Zustand | Global wallet & auth state |
| Vanilla CSS | Custom dark-mode theme with CSS variables |
| `@stellar/freighter-api` | Freighter wallet browser integration |
| `lucide-react` | Professional icon library |

### Backend
| Technology | Purpose |
|-----------|---------|
| Next.js API Routes | Serverless backend execution |
| MongoDB + Mongoose | Persistent data storage |
| JWT (`jsonwebtoken`) | Stateless session management |
| `@stellar/stellar-sdk` | Horizon API queries |

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB instance (local or Atlas)
- [Freighter Wallet](https://freighter.app) browser extension
- A Stellar Testnet account (fund via [Friendbot](https://friendbot.stellar.org))

### Installation

```bash
# Clone the repository
git clone https://github.com/pratickdutta/TrustChain.git
cd TrustChain

# Install all dependencies (frontend)
cd frontend
npm install

# Start the application
npm run dev
```

Frontend & Next.js API run concurrently at `http://localhost:3000`.

### Environment Variables

Create `frontend/.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017/trustchain
JWT_SECRET=your_jwt_secret_here
STELLAR_NETWORK=testnet
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_ADMIN_PUBKEY=your_stellar_public_key_here
```

---

## Roadmap

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 — MVP | ✅ Complete | Core lending, scoring, circles, Freighter auth |
| Phase 2 — Persistence | ✅ Complete | MongoDB + Mongoose integration, Next.js API transition |
| Phase 3 — Soroban | 🔜 Planned | Full smart contract loan agreements on Stellar |
| Phase 4 — Oracles | 🔜 Planned | Off-chain identity verification layer |
| Phase 5 — B2B API | 🔜 Planned | License TrustChain scoring engine to other dApps |

---

## About

Built by **Pratick Dutta** — a student developer passionate about decentralized solutions that bridge the gap between human sociology and Web3 architecture.

- 📧 [pratickdutta006@gmail.com](mailto:pratickdutta006@gmail.com)
- 💻 [github.com/pratickdutta](https://github.com/pratickdutta)

> *"I built TrustChain to explore how systemic financial exclusion can be solved through cryptographic networks — proving that strong community bonds can serve as the ultimate financial collateral."*

---

<div align="center">

© 2026 TrustChain Protocol. Built on Stellar.

</div>
