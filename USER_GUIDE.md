# 📖 TrustChain User Guide

> **Live Demo**: [https://trustchain-official.vercel.app](https://trustchain-official.vercel.app)  
> **Network**: Stellar Testnet  
> **Wallet Required**: [Freighter](https://freighter.app) (free browser extension)

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Freighter Wallet
1. Go to [freighter.app](https://freighter.app) and install the browser extension.
2. Create a new wallet and **save your secret phrase** in a safe place.
3. Open Freighter, click the network dropdown, and switch to **Testnet**.

### Step 2: Fund Your Testnet Account
Your testnet account needs a small amount of XLM to activate. Get free XLM from the Stellar Friendbot:
1. Open Freighter and copy your **Public Key** (starts with `G...`).
2. Visit [friendbot.stellar.org](https://friendbot.stellar.org) and paste your public key.
3. Click "Get testnet lumens" — you'll receive 10,000 free testnet XLM instantly.

### Step 3: Connect to TrustChain
1. Visit [trustchain-official.vercel.app](https://trustchain-official.vercel.app).
2. Click **"Connect Wallet"** in the top navigation bar.
3. Select **Freighter** from the wallet modal.
4. Approve the connection in the Freighter popup.

✅ You're in! Your TrustChain account is automatically created.

---

## 📊 Understanding Your Credit Score

Your **TBA Score** ranges from 0 to 1000 and is built from three components:

| Component | Max Points | How to Earn |
|-----------|-----------|-------------|
| **T** — Trust Score | 400 | Get vouched for by members in your Trust Circles |
| **B** — Behavior Score | 400 | Repay loans on time (starts at 200 as a neutral baseline) |
| **A** — Activity Score | 200 | Account age, circle memberships, attestations given |

### Credit Tiers

| Tier | Score Required | Max Loan | Duration |
|------|---------------|----------|----------|
| 🥉 Bronze | 450+ | $50 | 14 days |
| 🥈 Silver | 600+ | $200 | 30 days |
| 🥇 Gold | 750+ | $1,000 | 90 days |
| 💎 Platinum | 900+ | $5,000 | 180 days |

> **Tip**: New users start at ~200 points. The fastest way to reach Bronze is to join a Trust Circle and get 2-3 attestations from existing members.

---

## 🤝 Trust Circles

Trust Circles are peer groups that form the foundation of TrustChain's credit system.

### Creating a Circle
1. Go to the **Circles** page.
2. Click **"Create Circle"**.
3. Choose a name, description, and visibility (Public or Private).
4. (Optional) Add Circle Rules and a social link.
5. Your circle receives a unique **UCI** (Unique Circle Identification) code.

### Joining a Circle
**Public Circles:**
1. Go to **Circles → Explore**.
2. Search by circle name or UCI code.
3. Click **"Join"** — the owner will approve your request.

**Private Circles:**
1. Get the **Invite Code** from an existing member.
2. Go to **Circles → Join with Code** and paste the code.

### Giving Attestations (Vouching)
1. Inside your circle, find a member you want to vouch for.
2. Click **"Attest"** next to their name.
3. Set the **weight** (0.1 = light endorsement, 1.0 = strong endorsement).
4. Confirm — their Trust Score and your Activity Score will both update!

> ⚠️ **Warning**: If someone you vouched for defaults on a loan, you will lose **100 TRUST tokens** and **-40 Behavior Score** points. Only vouch for people you genuinely trust.

---

## 💰 Borrowing (Liquidity Gateway)

### How to Request a Loan

1. Go to the **Loans** page.
2. Follow the **"How to Borrow"** 3-step guide shown at the top.
3. **Select a Funding Source**:
   - **DeFi Protocol** — Auto-approved by smart contract if your score qualifies.
   - **Individual Lender** — Choose a specific lender from the list.
   - **Trust Pool** — Borrow from a community-funded pool.
4. (Optional) Toggle **"Gasless Transaction"** to have TrustChain pay your Stellar network fee.
5. Enter the **amount** and **purpose**.
6. Set the **maturity term** using the slider.
7. Review the **Rate of Interest** shown in the summary box.
8. Click **"Initialize Drawdown"** and watch the real-time transaction status indicator.

### Repaying a Loan
1. Go to **Loans → Protocol History**.
2. Find your active loan.
3. Click **"Submit Payment"**.
4. Enter the repayment amount (partial payments are allowed).
5. Click **"Execute"**.

> Your **Behavior Score** increases with every successful repayment!

---

## 🏦 Lending (Lender Gateway)

### Becoming a Lender
1. Go to the **Lend** page.
2. Click **"Register as Lender"**.
3. Set your:
   - **Maximum Exposure** (total XLM you're willing to lend)
   - **Minimum Borrower Score** (filter out low-score borrowers)
   - **Review Mode** (Auto-approve or Manual review)
4. Save settings.

### Reviewing Loan Requests
1. If you have **Manual Review** enabled, check your **Inbox** tab.
2. View the borrower's details and score.
3. Click **Approve** or **Reject** with an optional note.

---

## 🌊 MoneyPools (Trust Circle Lending Pools)

MoneyPools turn any Trust Circle into a decentralized lending pool.

> **Requirement**: Only Platinum-tier circle owners can enable a MoneyPool.

### Depositing to a Pool
1. Go to **Circles** and open a circle that has a MoneyPool enabled.
2. Click **"Deposit to Pool"** and enter an XLM amount.
3. Your deposit earns a pro-rata share of all interest collected.

### Withdrawing / Dissolving
The circle owner can dissolve the pool, distributing all principal + interest back to depositors automatically.

---

## 🏆 Leaderboard
View the **Leaderboard** to see the top-scoring TrustChain users. Compete to reach the Platinum tier and unlock the maximum lending limits!

---

## 📊 Metrics Dashboard
Visit **/metrics** to see live protocol statistics:
- Daily/Weekly/Monthly Active Users
- Loan repayment rates and TVL
- Credit tier distribution
- System health monitoring (MongoDB + Stellar Horizon)

---

## ❓ FAQ

**Q: Is this real money?**  
A: No. TrustChain is deployed on the **Stellar Testnet**. All XLM used is test currency with no real-world value.

**Q: Why does my score start at 200?**  
A: Your Behavior Score starts at 200/400 as a neutral baseline — it rises if you repay loans and falls if you default.

**Q: What is a Gasless Transaction?**  
A: When enabled, the TrustChain protocol treasury pays the tiny Stellar network fee (usually 0.00001 XLM) on your behalf, so you don't need any XLM in your account to transact.

**Q: I connected my wallet but my score is 0. Why?**  
A: Your score is calculated when you first connect. If it shows 0, try clicking "Recalculate Score" on your Dashboard.

---

## 📞 Support

- **Email**: [pratickdutta006@gmail.com](mailto:pratickdutta006@gmail.com)
- **GitHub Issues**: [github.com/pratickdutta/TrustChain/issues](https://github.com/pratickdutta/TrustChain/issues)
- **GitHub**: [@pratickdutta](https://github.com/pratickdutta)
