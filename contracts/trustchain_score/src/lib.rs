#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, String, Symbol,
};

// ── Storage Keys ───────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Updater, // authorized backend wallet that can push scores
    Score(Address),
}

// ── Data Structures ────────────────────────────────────────────────────────────

/// Tier codes: 0=establishing, 1=building, 2=bronze, 3=silver, 4=gold, 5=platinum
#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct ScoreData {
    pub total: u32,
    pub trust: u32,
    pub behavior: u32,
    pub activity: u32,
    pub tier: u32,          // 0–5 matching our tier ladder
    pub tier_label: String, // human-readable e.g. "platinum"
    pub updated_ledger: u32,
}

// ── Events ─────────────────────────────────────────────────────────────────────

const TOPIC_SCORE_UPDATED: Symbol = symbol_short!("SCORE_UPD");

// ── Contract ───────────────────────────────────────────────────────────────────

#[contract]
pub struct TrustChainScore;

#[contractimpl]
impl TrustChainScore {
    // ── Initialization ─────────────────────────────────────────────────────────

    /// Deploy once. `updater` is the backend service wallet.
    pub fn initialize(env: Env, admin: Address, updater: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Updater, &updater);
        env.storage().instance().extend_ttl(100_000, 100_000);
    }

    // ── Score Management ───────────────────────────────────────────────────────

    /// Push an updated score for a user.
    /// Only the authorized `updater` wallet (backend) may call this.
    pub fn update_score(
        env: Env,
        caller: Address,
        user: Address,
        total: u32,
        trust: u32,
        behavior: u32,
        activity: u32,
        tier: u32,
        tier_label: String,
    ) {
        caller.require_auth();
        let updater: Address = env.storage().instance().get(&DataKey::Updater).unwrap();
        if caller != updater {
            panic!("only authorized updater can push scores");
        }
        if total > 1000 || trust > 400 || behavior > 400 || activity > 200 {
            panic!("score values out of range");
        }
        if tier > 5 {
            panic!("tier code must be 0-5");
        }

        let score = ScoreData {
            total,
            trust,
            behavior,
            activity,
            tier,
            tier_label: tier_label.clone(),
            updated_ledger: env.ledger().sequence(),
        };

        env.storage()
            .persistent()
            .set(&DataKey::Score(user.clone()), &score);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Score(user.clone()), 200_000, 200_000);

        env.events().publish(
            (TOPIC_SCORE_UPDATED, symbol_short!("score")),
            (user, total, tier),
        );
    }

    /// Rotate the authorized updater wallet (admin only).
    pub fn set_updater(env: Env, caller: Address, new_updater: Address) {
        caller.require_auth();
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        if caller != admin {
            panic!("only admin can rotate updater");
        }
        env.storage()
            .instance()
            .set(&DataKey::Updater, &new_updater);
    }

    // ── Read-only Queries ──────────────────────────────────────────────────────

    /// Get the full score record for a user.
    /// Returns None if no score has been published yet.
    pub fn get_score(env: Env, user: Address) -> Option<ScoreData> {
        env.storage().persistent().get(&DataKey::Score(user))
    }

    /// Get only the tier code (0–5) for a user. Efficient for dApp integrations.
    pub fn get_tier(env: Env, user: Address) -> u32 {
        env.storage()
            .persistent()
            .get::<DataKey, ScoreData>(&DataKey::Score(user))
            .map(|s| s.tier)
            .unwrap_or(0) // default: establishing
    }

    /// Get total score only.
    pub fn get_total(env: Env, user: Address) -> u32 {
        env.storage()
            .persistent()
            .get::<DataKey, ScoreData>(&DataKey::Score(user))
            .map(|s| s.total)
            .unwrap_or(0)
    }

    pub fn get_updater(env: Env) -> Address {
        env.storage()
            .instance()
            .get(&DataKey::Updater)
            .expect("not initialized")
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
    use soroban_sdk::{testutils::Address as _, Env, String};

    fn setup() -> (
        Env,
        TrustChainScoreClient<'static>,
        Address,
        Address,
        Address,
    ) {
        let env = Env::default();
        env.mock_all_auths();

        let admin = Address::generate(&env);
        let updater = Address::generate(&env);
        let user = Address::generate(&env);

        let contract_id = env.register(TrustChainScore, ());
        let client = TrustChainScoreClient::new(&env, &contract_id);
        client.initialize(&admin, &updater);

        (env, client, admin, updater, user)
    }

    #[test]
    fn test_update_and_get_score() {
        let (env, client, _admin, updater, user) = setup();

        client.update_score(
            &updater,
            &user,
            &1000,
            &400,
            &400,
            &200,
            &5,
            &String::from_str(&env, "platinum"),
        );

        let score = client.get_score(&user).unwrap();
        assert_eq!(score.total, 1000);
        assert_eq!(score.tier, 5);

        let tier = client.get_tier(&user);
        assert_eq!(tier, 5);
    }

    #[test]
    fn test_unknown_user_returns_zero() {
        let (_env, client, _admin, _updater, user) = setup();
        assert_eq!(client.get_tier(&user), 0);
        assert_eq!(client.get_total(&user), 0);
        assert!(client.get_score(&user).is_none());
    }

    #[test]
    #[should_panic(expected = "only authorized updater")]
    fn test_unauthorized_update_panics() {
        let (env, client, _admin, _updater, user) = setup();
        let rando = Address::generate(&env);
        client.update_score(
            &rando,
            &user,
            &100,
            &50,
            &30,
            &20,
            &1,
            &String::from_str(&env, "building"),
        );
    }
}
