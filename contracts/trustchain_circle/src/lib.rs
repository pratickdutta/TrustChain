#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, String, Symbol, Vec,
};

// ── Storage Keys ───────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    CircleCount,
    Circle(u64),               // circle_id → CircleData
    Members(u64),              // circle_id → Vec<Address>
    MemberIndex(u64, Address), // (circle_id, user) → bool
}

// ── Data Structures ────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone, Debug)]
pub struct CircleData {
    pub id: u64,
    pub owner: Address,
    pub name: String,
    pub uci: String, // Unique Circle Identifier (6-char alphanumeric)
    pub is_private: bool,
    pub member_count: u32,
    pub created_ledger: u32,
}

// ── Events ─────────────────────────────────────────────────────────────────────

const TOPIC_CIRCLE_CREATED: Symbol = symbol_short!("C_CREATE");
const TOPIC_MEMBER_ADDED: Symbol = symbol_short!("C_JOIN");
const TOPIC_MEMBER_REMOVED: Symbol = symbol_short!("C_LEAVE");

// ── Contract ───────────────────────────────────────────────────────────────────

#[contract]
pub struct TrustChainCircle;

#[contractimpl]
impl TrustChainCircle {
    // ── Initialization ─────────────────────────────────────────────────────────

    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::CircleCount, &0_u64);
        env.storage().instance().extend_ttl(100_000, 100_000);
    }

    // ── Circle Lifecycle ───────────────────────────────────────────────────────

    /// Create a new circle. Creator becomes the owner and first member.
    pub fn create_circle(
        env: Env,
        owner: Address,
        name: String,
        uci: String,
        is_private: bool,
    ) -> u64 {
        owner.require_auth();

        let circle_id: u64 = env
            .storage()
            .instance()
            .get(&DataKey::CircleCount)
            .unwrap_or(0)
            + 1;
        env.storage()
            .instance()
            .set(&DataKey::CircleCount, &circle_id);

        let circle = CircleData {
            id: circle_id,
            owner: owner.clone(),
            name: name.clone(),
            uci: uci.clone(),
            is_private,
            member_count: 1, // owner is first member
            created_ledger: env.ledger().sequence(),
        };

        // Store circle metadata
        env.storage()
            .persistent()
            .set(&DataKey::Circle(circle_id), &circle);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Circle(circle_id), 200_000, 200_000);

        // Initialize members list with owner
        let mut members: Vec<Address> = Vec::new(&env);
        members.push_back(owner.clone());
        env.storage()
            .persistent()
            .set(&DataKey::Members(circle_id), &members);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Members(circle_id), 200_000, 200_000);

        // Set membership index
        env.storage()
            .persistent()
            .set(&DataKey::MemberIndex(circle_id, owner.clone()), &true);
        env.storage().persistent().extend_ttl(
            &DataKey::MemberIndex(circle_id, owner.clone()),
            200_000,
            200_000,
        );

        env.events().publish(
            (TOPIC_CIRCLE_CREATED, symbol_short!("circle")),
            (circle_id, owner, name, uci, is_private),
        );

        circle_id
    }

    // ── Membership ─────────────────────────────────────────────────────────────

    /// Add a member to a circle. Only the circle owner may call this.
    pub fn add_member(env: Env, caller: Address, circle_id: u64, new_member: Address) {
        caller.require_auth();

        let mut circle: CircleData = env
            .storage()
            .persistent()
            .get(&DataKey::Circle(circle_id))
            .expect("circle not found");

        if caller != circle.owner {
            panic!("only the circle owner can add members");
        }

        // Check not already a member
        let already: bool = env
            .storage()
            .persistent()
            .get(&DataKey::MemberIndex(circle_id, new_member.clone()))
            .unwrap_or(false);
        if already {
            panic!("already a member");
        }

        // Update members list
        let mut members: Vec<Address> = env
            .storage()
            .persistent()
            .get(&DataKey::Members(circle_id))
            .unwrap_or(Vec::new(&env));
        members.push_back(new_member.clone());
        env.storage()
            .persistent()
            .set(&DataKey::Members(circle_id), &members);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Members(circle_id), 200_000, 200_000);

        // Update index
        env.storage()
            .persistent()
            .set(&DataKey::MemberIndex(circle_id, new_member.clone()), &true);
        env.storage().persistent().extend_ttl(
            &DataKey::MemberIndex(circle_id, new_member.clone()),
            200_000,
            200_000,
        );

        circle.member_count += 1;
        env.storage()
            .persistent()
            .set(&DataKey::Circle(circle_id), &circle);

        env.events().publish(
            (TOPIC_MEMBER_ADDED, symbol_short!("circle")),
            (circle_id, new_member),
        );
    }

    /// Remove a member. Called by the owner or by the member themselves (leave).
    pub fn remove_member(env: Env, caller: Address, circle_id: u64, member: Address) {
        caller.require_auth();

        let mut circle: CircleData = env
            .storage()
            .persistent()
            .get(&DataKey::Circle(circle_id))
            .expect("circle not found");

        // Caller must be owner OR the member themselves
        if caller != circle.owner && caller != member {
            panic!("not authorized to remove this member");
        }
        // Owner cannot be removed
        if member == circle.owner {
            panic!("cannot remove the circle owner");
        }

        let is_member: bool = env
            .storage()
            .persistent()
            .get(&DataKey::MemberIndex(circle_id, member.clone()))
            .unwrap_or(false);
        if !is_member {
            panic!("not a member");
        }

        // Rebuild members list without the removed member
        let members: Vec<Address> = env
            .storage()
            .persistent()
            .get(&DataKey::Members(circle_id))
            .unwrap_or(Vec::new(&env));
        let mut new_members: Vec<Address> = Vec::new(&env);
        for m in members.iter() {
            if m != member {
                new_members.push_back(m);
            }
        }
        env.storage()
            .persistent()
            .set(&DataKey::Members(circle_id), &new_members);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Members(circle_id), 200_000, 200_000);

        // Clear index
        env.storage()
            .persistent()
            .remove(&DataKey::MemberIndex(circle_id, member.clone()));

        circle.member_count = circle.member_count.saturating_sub(1);
        env.storage()
            .persistent()
            .set(&DataKey::Circle(circle_id), &circle);

        env.events().publish(
            (TOPIC_MEMBER_REMOVED, symbol_short!("circle")),
            (circle_id, member),
        );
    }

    // ── Read-only Queries ──────────────────────────────────────────────────────

    pub fn get_circle(env: Env, circle_id: u64) -> CircleData {
        env.storage()
            .persistent()
            .get(&DataKey::Circle(circle_id))
            .expect("circle not found")
    }

    pub fn get_members(env: Env, circle_id: u64) -> Vec<Address> {
        env.storage()
            .persistent()
            .get(&DataKey::Members(circle_id))
            .unwrap_or(Vec::new(&env))
    }

    pub fn is_member(env: Env, circle_id: u64, user: Address) -> bool {
        env.storage()
            .persistent()
            .get(&DataKey::MemberIndex(circle_id, user))
            .unwrap_or(false)
    }

    pub fn get_circle_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::CircleCount)
            .unwrap_or(0)
    }
}

// ── Tests ──────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env, String};

    fn setup() -> (Env, TrustChainCircleClient<'static>, Address) {
        let env = Env::default();
        env.mock_all_auths();
        let admin = Address::generate(&env);
        let contract_id = env.register(TrustChainCircle, ());
        let client = TrustChainCircleClient::new(&env, &contract_id);
        client.initialize(&admin);
        (env, client, admin)
    }

    #[test]
    fn test_create_circle_and_owner_is_member() {
        let (env, client, owner) = setup();

        let id = client.create_circle(
            &owner,
            &String::from_str(&env, "Alpha Circle"),
            &String::from_str(&env, "UCI001"),
            &false,
        );
        assert_eq!(id, 1);

        let circle = client.get_circle(&id);
        assert_eq!(circle.member_count, 1);
        assert!(client.is_member(&id, &owner));
    }

    #[test]
    fn test_add_and_remove_member() {
        let (env, client, owner) = setup();
        let member = Address::generate(&env);

        let id = client.create_circle(
            &owner,
            &String::from_str(&env, "Beta Circle"),
            &String::from_str(&env, "UCI002"),
            &true,
        );

        client.add_member(&owner, &id, &member);
        assert!(client.is_member(&id, &member));
        assert_eq!(client.get_circle(&id).member_count, 2);

        client.remove_member(&member, &id, &member); // member leaves
        assert!(!client.is_member(&id, &member));
        assert_eq!(client.get_circle(&id).member_count, 1);
    }

    #[test]
    #[should_panic(expected = "only the circle owner")]
    fn test_non_owner_cannot_add_member() {
        let (env, client, owner) = setup();
        let rando = Address::generate(&env);
        let member = Address::generate(&env);

        let id = client.create_circle(
            &owner,
            &String::from_str(&env, "Gamma Circle"),
            &String::from_str(&env, "UCI003"),
            &false,
        );
        client.add_member(&rando, &id, &member);
    }
}
