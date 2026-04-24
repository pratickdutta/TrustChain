#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, token, Address, Env, Symbol,
};

// ── Storage Key Types ──────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum DataKey {
    Admin,
    PlatformFeeBps, // basis points: 20 = 0.20%
    PlatformRevenue,
    Loan(u64), // loan_id → LoanData
    LoanCount,
}

// ── Data Structures ────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum LoanStatus {
    Active,
    Repaying,
    Repaid,
    Defaulted,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct LoanData {
    pub id: u64,
    pub borrower: Address,
    pub lender: Address,
    pub amount_xlm: i128,      // principal in stroops
    pub fee_bps: u32,          // lender fee basis points
    pub total_owed: i128,      // principal + fee, in stroops
    pub repaid_amount: i128,   // how much has been repaid
    pub platform_fee_bps: u32, // protocol take rate in bps (e.g. 20 = 0.20%)
    pub platform_fee_collected: i128,
    pub due_ledger: u32, // ledger number after which loan is overdue
    pub status: LoanStatus,
}

// ── Events ─────────────────────────────────────────────────────────────────────

const TOPIC_LOAN_CREATED: Symbol = symbol_short!("CREATED");
const TOPIC_REPAYMENT: Symbol = symbol_short!("REPAID");
const TOPIC_DEFAULTED: Symbol = symbol_short!("DEFAULTED");
const TOPIC_REV_WITHDRAW: Symbol = symbol_short!("WITHDRAW");

// ── Contract ───────────────────────────────────────────────────────────────────

#[contract]
pub struct TrustChainLoan;

#[contractimpl]
impl TrustChainLoan {
    // ── Initialization (called once on deploy) ─────────────────────────────────

    /// Deploy and configure the contract.
    /// `platform_fee_bps`: 20 = 0.20%
    pub fn initialize(env: Env, admin: Address, platform_fee_bps: u32) {
        // Guard: can only be called once
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::PlatformFeeBps, &platform_fee_bps);
        env.storage()
            .instance()
            .set(&DataKey::PlatformRevenue, &0_i128);
        env.storage().instance().set(&DataKey::LoanCount, &0_u64);
        env.storage().instance().extend_ttl(100_000, 100_000);
    }

    // ── Loan Creation ──────────────────────────────────────────────────────────

    /// Called by the TrustChain backend after a loan is approved.
    /// The lender must have pre-authorized a token transfer.
    /// `amount_xlm`: amount in stroops (1 XLM = 10_000_000 stroops)
    /// `fee_bps`: lender's interest in basis points (e.g. 200 = 2%)
    /// `duration_ledgers`: ~5 seconds per ledger; 30 days ≈ 518_400 ledgers
    pub fn create_loan(
        env: Env,
        borrower: Address,
        lender: Address,
        amount_xlm: i128,
        fee_bps: u32,
        duration_ledgers: u32,
        xlm_token: Address,
    ) -> u64 {
        // Only admin (backend wallet) may create loans
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        lender.require_auth();
        borrower.require_auth();

        if amount_xlm <= 0 {
            panic!("amount must be > 0");
        }

        let platform_fee_bps: u32 = env
            .storage()
            .instance()
            .get(&DataKey::PlatformFeeBps)
            .unwrap_or(20);

        // Calculate total owed: principal + lender fee
        let fee_amount = (amount_xlm * fee_bps as i128) / 10_000;
        let total_owed = amount_xlm + fee_amount;

        // Disburse XLM: lender → borrower
        let token_client = token::Client::new(&env, &xlm_token);
        token_client.transfer(&lender, &borrower, &amount_xlm);

        // Assign sequential ID
        let loan_id: u64 = env
            .storage()
            .instance()
            .get(&DataKey::LoanCount)
            .unwrap_or(0)
            + 1;
        env.storage().instance().set(&DataKey::LoanCount, &loan_id);

        let due_ledger = env.ledger().sequence() + duration_ledgers;

        let loan = LoanData {
            id: loan_id,
            borrower: borrower.clone(),
            lender: lender.clone(),
            amount_xlm,
            fee_bps,
            total_owed,
            repaid_amount: 0,
            platform_fee_bps,
            platform_fee_collected: 0,
            due_ledger,
            status: LoanStatus::Active,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Loan(loan_id), &loan);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Loan(loan_id), 200_000, 200_000);

        // Emit event
        env.events().publish(
            (TOPIC_LOAN_CREATED, symbol_short!("loan")),
            (loan_id, borrower, amount_xlm),
        );

        loan_id
    }

    // ── Repayment ──────────────────────────────────────────────────────────────

    /// Borrower calls this to make a repayment.
    /// `amount`: repayment amount in stroops.
    /// Transfers XLM from borrower: (repayment - platform_fee) → lender, platform_fee → admin.
    pub fn repay(
        env: Env,
        loan_id: u64,
        caller: Address,
        amount: i128,
        xlm_token: Address,
    ) -> LoanStatus {
        caller.require_auth();

        let mut loan: LoanData = env
            .storage()
            .persistent()
            .get(&DataKey::Loan(loan_id))
            .expect("loan not found");

        if loan.borrower != caller {
            panic!("caller is not the borrower");
        }
        if matches!(loan.status, LoanStatus::Repaid | LoanStatus::Defaulted) {
            panic!("loan is already closed");
        }
        if amount <= 0 {
            panic!("repayment amount must be > 0");
        }

        // Calculate platform fee on this repayment slice
        let platform_fee = (amount * loan.platform_fee_bps as i128) / 10_000;
        let lender_amount = amount - platform_fee;

        // Move funds on-chain: borrower → lender (net), borrower → admin (fee)
        let token = token::Client::new(&env, &xlm_token);
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        token.transfer(&caller, &loan.lender, &lender_amount);
        if platform_fee > 0 {
            token.transfer(&caller, &admin, &platform_fee);
        }

        // Update state
        loan.repaid_amount += amount;
        loan.platform_fee_collected += platform_fee;

        // Accumulate global platform revenue
        let mut total_rev: i128 = env
            .storage()
            .instance()
            .get(&DataKey::PlatformRevenue)
            .unwrap_or(0);
        total_rev += platform_fee;
        env.storage()
            .instance()
            .set(&DataKey::PlatformRevenue, &total_rev);

        // Cap repaid at total_owed
        if loan.repaid_amount >= loan.total_owed {
            loan.repaid_amount = loan.total_owed;
            loan.status = LoanStatus::Repaid;
        } else {
            loan.status = LoanStatus::Repaying;
        }

        env.storage()
            .persistent()
            .set(&DataKey::Loan(loan_id), &loan);

        // Emit event
        env.events().publish(
            (TOPIC_REPAYMENT, symbol_short!("loan")),
            (
                loan_id,
                caller,
                amount,
                loan.total_owed - loan.repaid_amount,
            ),
        );

        loan.status
    }

    // ── Default ────────────────────────────────────────────────────────────────

    /// Lender or admin marks a loan as defaulted after due_ledger has passed.
    pub fn mark_defaulted(env: Env, loan_id: u64, caller: Address) {
        caller.require_auth();

        let mut loan: LoanData = env
            .storage()
            .persistent()
            .get(&DataKey::Loan(loan_id))
            .expect("loan not found");

        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        if caller != loan.lender && caller != admin {
            panic!("only lender or admin can mark default");
        }
        if matches!(loan.status, LoanStatus::Repaid | LoanStatus::Defaulted) {
            panic!("loan is already closed");
        }
        if env.ledger().sequence() <= loan.due_ledger {
            panic!("loan is not yet overdue");
        }

        loan.status = LoanStatus::Defaulted;
        env.storage()
            .persistent()
            .set(&DataKey::Loan(loan_id), &loan);

        env.events().publish(
            (TOPIC_DEFAULTED, symbol_short!("loan")),
            (loan_id, loan.borrower),
        );
    }

    // ── Revenue Withdrawal ─────────────────────────────────────────────────────

    /// Admin withdraws all accumulated platform fees.
    pub fn withdraw_revenue(env: Env, _xlm_token: Address) -> i128 {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        let revenue: i128 = env
            .storage()
            .instance()
            .get(&DataKey::PlatformRevenue)
            .unwrap_or(0);

        if revenue <= 0 {
            panic!("no revenue to withdraw");
        }

        // Note: fees were already transferred to admin wallet during repay(),
        // so this just resets the counter and emits an event.
        env.storage()
            .instance()
            .set(&DataKey::PlatformRevenue, &0_i128);

        env.events().publish(
            (TOPIC_REV_WITHDRAW, symbol_short!("admin")),
            (admin, revenue),
        );

        revenue
    }

    // ── Read-only Queries ──────────────────────────────────────────────────────

    pub fn get_loan(env: Env, loan_id: u64) -> LoanData {
        env.storage()
            .persistent()
            .get(&DataKey::Loan(loan_id))
            .expect("loan not found")
    }

    pub fn get_platform_revenue(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::PlatformRevenue)
            .unwrap_or(0)
    }

    pub fn get_loan_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::LoanCount)
            .unwrap_or(0)
    }

    pub fn get_admin(env: Env) -> Address {
        env.storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("not initialized")
    }
}

// ── Tests ──────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{
        testutils::{Address as _, Ledger},
        token::{Client as TokenClient, StellarAssetClient},
        Env,
    };

    fn setup() -> (
        Env,
        TrustChainLoanClient<'static>,
        Address,
        Address,
        Address,
        Address,
    ) {
        let env = Env::default();
        env.mock_all_auths();

        let admin = Address::generate(&env);
        let lender = Address::generate(&env);
        let borrower = Address::generate(&env);

        // Deploy the XLM mock token
        let token_id = env.register_stellar_asset_contract_v2(admin.clone());
        let xlm = token_id.address();
        let xlm_admin = StellarAssetClient::new(&env, &xlm);

        // Mint XLM to lender
        xlm_admin.mint(&lender, &1_000_000_000); // 100 XLM

        // Deploy and initialize our contract
        let contract_id = env.register(TrustChainLoan, ());
        let client = TrustChainLoanClient::new(&env, &contract_id);
        client.initialize(&admin, &20); // 0.20% platform fee

        (env, client, admin, lender, borrower, xlm)
    }

    #[test]
    fn test_full_loan_lifecycle() {
        let (env, client, _admin, lender, borrower, xlm) = setup();
        let token = TokenClient::new(&env, &xlm);

        // Create a 10 XLM loan, 2% lender fee, 30-day duration
        let loan_id = client.create_loan(
            &borrower,
            &lender,
            &100_000_000, // 10 XLM in stroops
            &200,         // 2% fee_bps
            &518_400,     // ~30 days
            &xlm,
        );
        assert_eq!(loan_id, 1);

        // Borrower should have received 10 XLM
        let borrower_balance = token.balance(&borrower);
        assert_eq!(borrower_balance, 100_000_000);

        // Borrower repays full amount (10 XLM + 2% = 10.2 XLM)
        let total_owed = 102_000_000_i128; // 10.2 XLM in stroops

        // Mint repayment funds to borrower (for interest)
        use soroban_sdk::token::StellarAssetClient;
        let xlm_admin = StellarAssetClient::new(&env, &xlm);
        xlm_admin.mint(&borrower, &5_000_000);

        let loan = client.get_loan(&loan_id);
        assert_eq!(loan.total_owed, total_owed);
        assert!(matches!(loan.status, LoanStatus::Active));

        // Repay full amount
        let status = client.repay(&loan_id, &borrower, &total_owed, &xlm);
        assert!(matches!(status, LoanStatus::Repaid));

        // Platform revenue should be 0.2% of 10.2 XLM ≈ 204_000 stroops
        let revenue = client.get_platform_revenue();
        assert!(revenue > 0);
    }

    #[test]
    fn test_partial_repayment() {
        let (env, client, _admin, lender, borrower, xlm) = setup();
        let _ = env;

        let loan_id = client.create_loan(&borrower, &lender, &100_000_000, &200, &518_400, &xlm);

        // Repay half
        let status = client.repay(&loan_id, &borrower, &51_000_000, &xlm);
        assert!(matches!(status, LoanStatus::Repaying));
    }

    #[test]
    fn test_mark_defaulted() {
        let (env, client, _admin, lender, borrower, xlm) = setup();

        let loan_id = client.create_loan(
            &borrower,
            &lender,
            &100_000_000,
            &200,
            &10, // 10 ledger duration (very short)
            &xlm,
        );

        // Advance ledger past due date
        env.ledger().with_mut(|l| {
            l.sequence_number += 20;
        });

        client.mark_defaulted(&loan_id, &lender);
        let loan = client.get_loan(&loan_id);
        assert!(matches!(loan.status, LoanStatus::Defaulted));
    }
}
