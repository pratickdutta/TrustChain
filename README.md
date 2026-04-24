<div align="center">

<img src="./frontend/public/logo.png" alt="TrustChain Logo" width="140" style="border-radius: 50%;" />

# TrustChain
### Decentralized Social Credit Network on Stellar Blockchain

*"Trust today, empower tomorrow."*

[![Stellar Testnet](https://img.shields.io/badge/Stellar-Testnet-7B3FE4?style=for-the-badge&logo=stellar&logoColor=white)](https://stellar.expert/explorer/testnet)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Status: Beta](https://img.shields.io/badge/Status-Beta_Release-FFB347?style=for-the-badge)](#)

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

```
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

```
┌─────────────────────────────────────────────────────┐
│                   CLIENT LAYER                       │
│  Next.js 16 (App Router) · TypeScript · Zustand     │
│  Landing · Dashboard · Circles · Loans · Lender     │
└────────────────────────┬────────────────────────────┘
                         │ HTTPS / REST (Bearer JWT)
┌────────────────────────▼────────────────────────────┐
│                    API LAYER                         │
│            Node.js + Express · Helmet · CORS         │
│  /auth  /users  /circles  /loans  /score  /stellar  │
└────┬──────────────┬──────────────┬──────────────────┘
     │              │              │
┌────▼──────┐ ┌─────▼──────┐ ┌────▼──────────────────┐
│  Auth     │ │  Credit    │ │  Trust Graph Manager  │
│  Service  │ │  Engine    │ │  Attestation Graph    │
│  (JWT)    │ │  T·B·A     │ │  Sybil Resistance     │
└───────────┘ └────────────┘ └───────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│               STELLAR BLOCKCHAIN LAYER               │
│  Horizon API · Freighter Wallet · XLM · Soroban     │
└─────────────────────────────────────────────────────┘
```

### Authentication Flow

```
1. User clicks "Connect Wallet" → Freighter browser extension
2. POST /api/auth/challenge { pubKey } → Server issues UUID nonce
3. Freighter signs nonce cryptographically
4. POST /api/auth/verify { pubKey, nonce, signature } → JWT issued (24h)
5. JWT stored in localStorage → Bearer token on all API requests
```

---

## Features

### For Borrowers
- **Score Dashboard** — Animated SVG arc gauge showing live T·B·A breakdown
- **Trust Circles** — Create or join peer groups, vouch for members with a weighted attestation
- **Loan Centre** — Request micro-loans, view repayment history, track active drawdowns
- **Leaderboard** — Community-wide credit score ranking

### For Lenders
- **Lender Gateway** — Register as a lender, set exposure limits, minimum borrower score thresholds
- **Manual Review Mode** — Toggle between smart contract auto-approval and personal loan review
- **Portfolio View** — Track active loans you've approved and their repayment status

### Protocol
- **Hybrid Lending Model** — Pool-to-Peer architecture; lenders deposit into a shared pool and the smart contract auto-approves eligible borrowers
- **Social Slashing** — Defaults trigger cascading penalties across the defaulter's entire Trust Circle
- **TRUST Token Burning** — All of a defaulter's TRUST tokens are seized and burned on-chain
- **Cinematic Splash Screen** — Branded intro animation on first load with smooth transitions

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

```
Borrower Defaults
      │
      ├─► Borrower: trustTokens = 0, behaviorScore -= 150
      │
      └─► For each attester who vouched for them:
              attester.trustTokens -= 100
              attester.behaviorScore -= 40
```

---

## Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| Next.js 16 (App Router) | React framework, routing, SSR |
| TypeScript 5 | Type safety |
| Zustand | Global wallet & auth state |
| Vanilla CSS (Design System) | Custom dark-mode theme with CSS variables |
| `@stellar/freighter-api` | Freighter wallet browser integration |
| `lucide-react` | Professional icon library |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express | API server |
| JWT (`jsonwebtoken`) | Stateless session management |
| Helmet + express-rate-limit | Security hardening |
| `@stellar/stellar-sdk` | Horizon API queries |
| In-Memory Maps (`db.js`) | MVP data store (Phase 2: PostgreSQL) |

---

## Directory Structure

```
TrustChain/
├── frontend/
│   ├── public/
│   │   └── logo.png               # App logo (used in Navbar, Footer, favicon)
│   └── src/
│       ├── app/
│       │   ├── page.tsx            # Landing page with splash screen
│       │   ├── dashboard/          # Score gauge, stellar account, quick actions
│       │   ├── circles/            # Trust Circles: create, join, attest
│       │   ├── loans/              # Loan request, history, repayment
│       │   ├── lender/             # Lender gateway and portfolio
│       │   ├── leaderboard/        # Community rankings
│       │   └── about/              # About page: mission, founder, roadmap
│       ├── components/
│       │   ├── Navbar.tsx          # Sticky nav with Freighter wallet connect
│       │   ├── Footer.tsx          # Footer with About Us link
│       │   ├── ScoreGauge.tsx      # Animated SVG credit score arc
│       │   └── FloatingLogos.tsx   # Animated background blockchain icons
│       ├── lib/
│       │   └── api.ts              # Typed REST API client
│       └── store/
│           └── walletStore.ts      # Zustand global state
│
├── backend/
│   └── src/
│       ├── server.js               # Express app + middleware
│       ├── db.js                   # In-memory Map database
│       ├── routes/
│       │   ├── auth.js             # Challenge/verify JWT flow
│       │   ├── users.js            # User profile endpoints
│       │   ├── circles.js          # Circle CRUD + attestations
│       │   ├── loans.js            # Loan lifecycle + default penalties
│       │   ├── score.js            # TBA score computation
│       │   ├── lender.js           # Lender gateway + portfolio
│       │   └── stellar.js          # Horizon API + Friendbot
│       └── services/
│           ├── creditEngine.js     # T·B·A hybrid scoring algorithm
│           └── stellar.js          # Stellar SDK wrapper
│
├── ARCHITECTURE.md
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- [Freighter Wallet](https://freighter.app) browser extension
- A Stellar Testnet account (fund via [Friendbot](https://friendbot.stellar.org))

### Installation

```bash
# Clone the repository
git clone https://github.com/pratickdutta/TrustChain.git
cd TrustChain

# Install all dependencies (frontend + backend)
npm install --prefix frontend
npm install --prefix backend

# Start both servers concurrently
npm run dev
```

Frontend runs at `http://localhost:3000`  
Backend runs at `http://localhost:4000`

### Environment Variables

Create `backend/.env`:
```env
PORT=4000
JWT_SECRET=your_jwt_secret_here
STELLAR_NETWORK=testnet
```

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## Roadmap

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 — MVP | ✅ Complete | Core lending, scoring, circles, Freighter auth |
| Phase 2 — Persistence | 🔜 Planned | PostgreSQL + Redis replacing in-memory store |
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
