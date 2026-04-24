# TrustChain Smart Contracts

Soroban (Stellar) smart contracts for TrustChain — the Decentralized Social Credit Network.

## Contracts

| Contract | Description | WASM Size | Testnet ID |
|---|---|---|---|
| `trustchain_loan` | Core loan lifecycle: disburse, repay, default, platform revenue | ~22 KB | `CCGAK2YJ2WPGE74QTYPXHX5NONQWZMTF6NY2JWHLGDZZC3MYPDBUVWMV` |
| `trustchain_score` | On-chain credit score registry (B2B API anchor) | ~11 KB | `CB6P6UZEYJ77DGSLRIGJY4YK4HFMYGQNZAIJQWXYTVZ2A4STSXMIJP2W` |
| `trustchain_circle` | On-chain social circle & membership graph | ~15 KB | `CB4ED6IJTJSSG7WJVL7ZK43EU4NVYL5WT2COT2METRE4FZODSCRM7HE7` |

## Architecture

```
contracts/
├── Cargo.toml                  (workspace)
├── trustchain_loan/src/lib.rs
├── trustchain_score/src/lib.rs
└── trustchain_circle/src/lib.rs
```

## Build

Requires Rust + wasm32 target:

```bash
rustup target add wasm32-unknown-unknown
cargo build --target wasm32-unknown-unknown --release
```

WASM output: `target/wasm32-unknown-unknown/release/*.wasm`

## Test

```bash
cargo test
```

## Deploy (Testnet)

```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/trustchain_loan.wasm \
  --network testnet \
  --source <YOUR_SECRET_KEY>
```

## Contract Functions

### trustchain_loan
- `initialize(admin, platform_fee_bps)` — deploy once, set 20 bps (0.20%) fee
- `create_loan(borrower, lender, amount, fee_bps, duration_ledgers, xlm_token)` — disburse XLM on-chain
- `repay(loan_id, caller, amount, xlm_token)` — split payment to lender + protocol fee
- `mark_defaulted(loan_id, caller)` — close overdue loan
- `withdraw_revenue(_xlm_token)` — admin claims accumulated fees
- `get_loan(id)`, `get_platform_revenue()`, `get_loan_count()`

### trustchain_score
- `initialize(admin, updater)` — set authorized backend wallet
- `update_score(caller, user, total, trust, behavior, activity, tier, tier_label)` — push score on-chain
- `get_score(user)`, `get_tier(user)`, `get_total(user)` — read by any dApp

### trustchain_circle
- `initialize(admin)` — deploy once
- `create_circle(owner, name, uci, is_private)` — mint new circle
- `add_member(caller, circle_id, new_member)` — owner adds member
- `remove_member(caller, circle_id, member)` — owner removes or member leaves
- `get_circle(id)`, `get_members(id)`, `is_member(circle_id, user)`
