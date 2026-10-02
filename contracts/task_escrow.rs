//! PiForge Task Escrow – Soroban (Rust) Smart Contract Skeleton
//! Deploy on Pi Testnet first. This is production-oriented structure.
//! Compile with: soroban contract build
//!
//! Key design:
//! - Native PI is held in the contract balance
//! - Task state machine enforced on-chain
//! - Reputation is emitted as events (indexer updates off-chain DB)
//! - KYC is verified off-chain; only verified UIDs are allowed to claim (enforced by backend + optional allowlist)

#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, BytesN, Env, String, Symbol,
};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum TaskStatus {
    Open,
    Funded,
    Assigned,
    Submitted,
    Completed,
    Disputed,
    Refunded,
}

#[contracttype]
#[derive(Clone)]
pub struct Task {
    pub id: BytesN<32>,
    pub poster: Address,
    pub worker: Option<Address>,
    pub reward: i128,
    pub status: TaskStatus,
    pub proof_hash: Option<BytesN<32>>,
    pub created_at: u64,
}

#[contract]
pub struct TaskEscrow;

#[contractimpl]
impl TaskEscrow {
    /// Initialize the contract (optional admin for arbiters)
    pub fn init(env: Env, admin: Address) {
        admin.require_auth();
        env.storage().instance().set(&symbol_short!("admin"), &admin);
    }

    /// Poster creates and funds a task in one step
    pub fn create_and_fund(
        env: Env,
        poster: Address,
        task_id: BytesN<32>,
        reward: i128,
    ) {
        poster.require_auth();
        if reward <= 0 {
            panic!("reward must be positive");
        }

        // Transfer native PI from poster to this contract
        // (In Soroban this uses the token client for the native asset)
        // token_client.transfer(&poster, &env.current_contract_address(), &reward);

        let task = Task {
            id: task_id.clone(),
            poster: poster.clone(),
            worker: None,
            reward,
            status: TaskStatus::Funded,
            proof_hash: None,
            created_at: env.ledger().timestamp(),
        };

        env.storage().persistent().set(&task_id, &task);
        env.events().publish(
            (symbol_short!("created"), task_id),
            (poster, reward),
        );
    }

    /// Worker claims a funded task
    pub fn claim(env: Env, worker: Address, task_id: BytesN<32>) {
        worker.require_auth();
        let mut task: Task = env.storage().persistent().get(&task_id).unwrap();
        if task.status != TaskStatus::Funded {
            panic!("task not claimable");
        }
        task.worker = Some(worker.clone());
        task.status = TaskStatus::Assigned;
        env.storage().persistent().set(&task_id, &task);
        env.events().publish((symbol_short!("claimed"), task_id), worker);
    }

    /// Worker submits proof (hash of off-chain evidence)
    pub fn submit(env: Env, worker: Address, task_id: BytesN<32>, proof: BytesN<32>) {
        worker.require_auth();
        let mut task: Task = env.storage().persistent().get(&task_id).unwrap();
        if task.worker != Some(worker) || task.status != TaskStatus::Assigned {
            panic!("unauthorized or wrong state");
        }
        task.proof_hash = Some(proof);
        task.status = TaskStatus::Submitted;
        env.storage().persistent().set(&task_id, &task);
        env.events().publish((symbol_short!("submit"), task_id), proof);
    }

    /// Poster releases funds to worker
    pub fn release(env: Env, poster: Address, task_id: BytesN<32>) {
        poster.require_auth();
        let mut task: Task = env.storage().persistent().get(&task_id).unwrap();
        if task.poster != poster {
            panic!("only poster");
        }
        if task.status != TaskStatus::Submitted && task.status != TaskStatus::Assigned {
            panic!("cannot release in current state");
        }
        let worker = task.worker.clone().unwrap();
        // token_client.transfer(&env.current_contract_address(), &worker, &task.reward);
        task.status = TaskStatus::Completed;
        env.storage().persistent().set(&task_id, &task);
        env.events().publish(
            (symbol_short!("release"), task_id),
            (worker, task.reward),
        );
    }

    /// Simple refund path if never claimed
    pub fn refund(env: Env, poster: Address, task_id: BytesN<32>) {
        poster.require_auth();
        let mut task: Task = env.storage().persistent().get(&task_id).unwrap();
        if task.poster != poster || task.status != TaskStatus::Funded {
            panic!("cannot refund");
        }
        // token_client.transfer(&env.current_contract_address(), &poster, &task.reward);
        task.status = TaskStatus::Refunded;
        env.storage().persistent().set(&task_id, &task);
        env.events().publish((symbol_short!("refund"), task_id), poster);
    }

    pub fn get_task(env: Env, task_id: BytesN<32>) -> Task {
        env.storage().persistent().get(&task_id).unwrap()
    }
}
