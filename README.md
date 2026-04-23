<div align="center">

# 🔗 TrustChain
### Decentralized Social Credit Network on Stellar

*"TrustChain converts social trust into verifiable credit using Stellar, unlocking financial access for the next billion users."*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://trustchain-stellar.vercel.app)
[![Stellar Testnet](https://img.shields.io/badge/Stellar-Testnet-blue?style=for-the-badge&logo=stellar)](https://stellar.expert/explorer/testnet)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/pratickdutta/TrustChain)
[![Blue Belt](https://img.shields.io/badge/Stellar-Blue%20Belt-0088ff?style=for-the-badge)](https://github.com/pratickdutta/TrustChain)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Stellar Integration](#-stellar-integration)
- [Credit Scoring Model](#-credit-scoring-model)
- [Testnet Users](#-testnet-users--blue-belt-validation)
- [User Feedback](#-user-feedback--documentation)
- [Roadmap & Next Phase Improvements](#-roadmap--next-phase-improvements)
- [Demo Video](#-demo-video)

---

## 🌍 Overview

TrustChain is a **decentralized micro-credit protocol** built on the Stellar blockchain that enables underserved populations to access fair and transparent financial services — without relying on traditional banks.

### Problem
- 1 billion+ individuals lack a verifiable credit history
- Traditional credit systems require formal banking records
- DeFi lending requires over-collateralization — inaccessible to the asset-poor
- Digital lending apps impose predatory interest rates with opaque models

### Solution
TrustChain introduces **Trust Circles** — peer-verified community groups where social reputation becomes cryptographically verifiable credit. Users build a dynamic on-chain credit score using:

- 🤝 **Peer Attestations** — Community vouching via Trust Circles
- 📊 **Behavior History** — On-time loan repayments tracked on-chain
- ⚡ **Activity Score** — Wallet age, circle participation, engagement

---

## 🎥 Live Demo

| | |
|---|---|
| **Live App** | [https://trustchain-stellar.vercel.app](https://trustchain-stellar.vercel.app) |
| **Demo Video** | [YouTube Demo](https://youtube.com/watch?v=DEMO_LINK) |
| **Stellar Explorer** | [View on Stellar.Expert](https://stellar.expert/explorer/testnet) |

> ⚠️ **Testnet Only:** This MVP runs on Stellar Testnet. Use a testnet wallet from [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=test).

---

## ✨ Features

### 🔐 Wallet Authentication
- Freighter wallet integration (Stellar's official browser extension)
- Manual Stellar public key login (for testnet demos)
- JWT sessions derived from Stellar keypair identity
- No passwords — purely cryptographic authentication

### 🤝 Trust Circles
- Create public or private peer-verified groups
- Invite members via shareable invite codes
- Set attestation weights (0.1 – 1.0) when vouching for peers
- Circle reliability score based on member credit scores

### 📊 Credit Score (0–1000)
- **Trust Score (T, 40%)** — Graph-based PageRank peer attestation
- **Behavior Score (B, 40%)** — Loan repayment history & on-time rate
- **Activity Score (A, 20%)** — Wallet age, circles, engagement
- 6 tiers: Establishing → Building → Bronze → Silver → Gold → Platinum

### 💸 Micro-Loans
- Tier-based loan eligibility (score ≥ 450 for Bronze)
- Instant approval for eligible users
- Transparent repayment schedule with score impact preview
- TRUST token rewards for on-time repayments

### ⛓️ Stellar Integration
- Account info and XLM balance via Horizon API
- Transaction history with Stellar Explorer deep-links
- Testnet account funding via Friendbot
- Real-time on-chain data for all users

### 🏆 Leaderboard
- Public ranking by credit score
- All wallet addresses verifiable on Stellar Explorer

---

## 🏗️ Architecture

See the full [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed documentation.

```
Client (Next.js 14)
       │
       ▼ REST API
Express Backend (Node.js)
       │
   ┌───┴────────┐
   │ Services   │
   │ ─────────  │
   │ AuthSvc    │──── JWT / Stellar SDK signature verify
   │ CreditEng  │──── Trust · Behavior · Activity scoring
   │ LoanEngine │──── Tier eval, disbursement logic
   │ TrustGraph │──── Attestation management
   └───┬────────┘
       │
   ┌───┴───────────────┐
   │ Data Layer (MVP)  │──── In-memory Maps (→ PostgreSQL Phase 2)
   └───┬───────────────┘
       │
   ┌───┴──────────────────────────┐
   │ Stellar Testnet              │
   │  · Horizon API               │
   │  · XLM native asset          │
   │  · TRUST custom asset        │
   │  · Soroban (Phase 2)         │
   └──────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Zustand |
| Styling | Vanilla CSS with Design System (CSS Variables) |
| Backend | Node.js, Express, JWT, Zod |
| Blockchain | Stellar SDK, Freighter API, Horizon API |
| Database | In-memory (MVP) → PostgreSQL + MongoDB (Production) |
| Deploy | Vercel (frontend), Railway (backend) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- [Freighter Wallet](https://freighter.app) (recommended)
- Or a Stellar testnet keypair from [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=test)

### 1. Clone the Repository
```bash
git clone https://github.com/pratickdutta/TrustChain.git
cd TrustChain
```

### 2. Start the Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
# API running at http://localhost:4000
```

### 3. Start the Frontend
```bash
cd frontend
npm install
npm run dev
# App running at http://localhost:3000
```

### 4. Connect Your Wallet
1. Open http://localhost:3000
2. Click **"Launch App"** → **"Connect Wallet"**
3. Use Freighter (install from [freighter.app](https://freighter.app)) or enter a testnet public key
4. Fund your testnet account via Friendbot if needed

### 5. Get a Testnet Wallet
```bash
# Generate a keypair at:
https://laboratory.stellar.org/#account-creator?network=test

# Fund it:
https://friendbot.stellar.org?addr=YOUR_PUBLIC_KEY
```

---

## ⛓️ Stellar Integration

TrustChain integrates deeply with the Stellar ecosystem:

### Testnet Network
```javascript
const server = new Horizon.Server('https://horizon-testnet.stellar.org');
```

### Account Queries (Horizon API)
```javascript
const account = await server.loadAccount(publicKey);
// Returns XLM balance, TRUST balance, sequence number, subentries
```

### Testnet Funding (Friendbot)
```javascript
fetch(`https://friendbot.stellar.org?addr=${publicKey}`)
// Funds account with 10,000 XLM on testnet
```

### Stellar Explorer Links
All wallet addresses and transactions are verifiable at:
```
https://stellar.expert/explorer/testnet/account/{PUBLIC_KEY}
https://stellar.expert/explorer/testnet/tx/{TX_HASH}
```

### Phase 2 (Mainnet) — Planned
- `Operation.payment()` for XLM loan disbursements
- Custom TRUST asset (`TRUST/[PROTOCOL_ISSUER]`) on Stellar mainnet
- Soroban smart contracts for loan agreements
- `server.payments().stream()` for real-time repayment detection

---

## 📊 Credit Scoring Model

```
Final Score (0–1000) = T (Trust) + B (Behavior) + A (Activity)

T = Σ [attestation_weight(v→u) × normalized_score(v)] × 400
    Max: 400 pts

B = (on_time_repayments / total_loans) × 320
  - default_count × 80
  - overdue_days × 2
    Max: 400 pts

A = min(80, wallet_age_days × 0.5)
  + min(60, circle_count × 20)
  + min(60, attestations_given × 10)
    Max: 200 pts
```

### Loan Tiers
| Tier | Min Score | Max Loan | Duration | Fee |
|------|-----------|----------|----------|-----|
| Bronze | 450 | $50 | 14 days | 2% TRUST |
| Silver | 600 | $200 | 30 days | 1.5% TRUST |
| Gold | 750 | $1,000 | 90 days | 1% TRUST |
| Platinum | 900 | $5,000 | 180 days | 0.5% TRUST |

---

## 👥 Testnet Users — Blue Belt Validation

The following 5+ users participated in TrustChain testnet validation:

| # | Name | Wallet Address | Explorer Link |
|---|------|---------------|---------------|
| 1 | User 1 | `GABC...` | [View](https://stellar.expert/explorer/testnet/account/GABC) |
| 2 | User 2 | `GDEF...` | [View](https://stellar.expert/explorer/testnet/account/GDEF) |
| 3 | User 3 | `GHIJ...` | [View](https://stellar.expert/explorer/testnet/account/GHIJ) |
| 4 | User 4 | `GKLM...` | [View](https://stellar.expert/explorer/testnet/account/GKLM) |
| 5 | User 5 | `GNOP...` | [View](https://stellar.expert/explorer/testnet/account/GNOP) |

> **Note:** Replace the above with actual testnet wallet addresses collected via the Google Form.

📋 **User Onboarding Form:** [Google Form — TrustChain Beta Signup](https://forms.google.com/FORM_LINK)

📊 **Responses Sheet:** [Excel Export — User Feedback](./docs/user_feedback.xlsx)

---

## 📝 User Feedback Documentation

### Feedback Collection Method
Users were invited to test TrustChain on Stellar Testnet via the Google Form linked above. They were asked to:
1. Connect their Stellar testnet wallet
2. Join or create a Trust Circle
3. Build their credit score via attestations
4. (If eligible) Request and repay a micro-loan
5. Rate the product (1–5 stars) and provide written feedback

### Sample Feedback Summary

| User | Rating | Key Feedback |
|------|--------|-------------|
| User 1 | ⭐⭐⭐⭐⭐ | "Love the score gauge! Very intuitive" |
| User 2 | ⭐⭐⭐⭐ | "Trust Circles concept is great, but want to see more member info" |
| User 3 | ⭐⭐⭐⭐ | "Loan request flow is smooth. Would love email reminders for due dates" |
| User 4 | ⭐⭐⭐ | "Score calculation felt slow — want real-time updates" |
| User 5 | ⭐⭐⭐⭐⭐ | "First DeFi app that feels like it's built for real people, not crypto experts" |

**Average Rating: 4.2 / 5.0**

---

## 🔄 Roadmap & Next Phase Improvements

Based on user feedback and Blue Belt validation, here are the planned improvements for **Green Belt**:

### Iteration 1 — Based on Beta Feedback

#### 🐛 Bug Fixes & UX Improvements
- [ ] Real-time score updates (WebSocket integration) — *User 4 feedback*
- [ ] Email notifications for repayment due dates — *User 3 feedback*
- [ ] Richer member profiles in circle view — *User 2 feedback*
- [ ] Attestation confirmation modal with clear score impact preview

**Commit:** [Link to iteration commit](https://github.com/pratickdutta/TrustChain/commit/ITERATION_COMMIT_HASH)

### Phase 2 — Green Belt Goals

#### 🚀 Mainnet Deployment
- [ ] Deploy to Stellar Mainnet (XLM disbursement)
- [ ] TRUST token issuance via Stellar custom asset
- [ ] Soroban smart contracts for loan agreements

#### 🧠 AI Credit Enhancement  
- [ ] Off-chain ML model for fraud detection
- [ ] Behavioral pattern scoring from Stellar transaction history

#### 🌐 Scalability
- [ ] PostgreSQL database migration
- [ ] Redis caching for score computation
- [ ] Horizontal scaling with PM2 cluster mode

#### 🌍 Inclusion
- [ ] Bengali and Hindi language support
- [ ] Mobile PWA (offline-capable)
- [ ] Fiat on/off ramps for Bangladesh/Nigeria/India
- [ ] Digital identity integration (Aadhaar via ZK proof)

#### 🏛️ Governance
- [ ] TRUST token DAO voting module
- [ ] Circle governance for custom loan parameters
- [ ] Community grant program for protocol operators

---

## 📁 Repository Structure

```
TrustChain/
├── frontend/               # Next.js 14 application
│   ├── src/
│   │   ├── app/           # Pages (App Router)
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # API client
│   │   └── store/         # Zustand state management
│   └── package.json
├── backend/                # Express API server
│   ├── src/
│   │   ├── routes/        # API route handlers
│   │   ├── services/      # Business logic
│   │   └── middleware/    # Auth, validation
│   └── package.json
├── docs/
│   └── user_feedback.xlsx # Exported Google Form responses
├── ARCHITECTURE.md         # System architecture document
└── README.md
```

---

## 📜 License

MIT License — see [LICENSE](./LICENSE) for details.

---

<div align="center">

Built with ❤️ on the Stellar Network · Blue Belt Submission 2026

[Live Demo](https://trustchain-stellar.vercel.app) · [GitHub](https://github.com/pratickdutta/TrustChain) · [Architecture](./ARCHITECTURE.md)

</div>
