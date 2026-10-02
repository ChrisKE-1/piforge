// SPDX-License-Identifier: MIT
// NOTE: Pi Network uses Soroban (Rust/Wasm), not Solidity.
// This file is a readable specification of the escrow logic.
// The real implementation lives in contracts/task_escrow.rs

/*
PiForge Task Escrow – Logical Specification

States: Open → Funded → Assigned → Submitted → Completed | Disputed | Refunded

Functions:
1. create_task(task_id, reward_amount, poster) 
   - Poster deposits `reward_amount` of native PI into the contract
   - Emits TaskCreated

2. claim_task(task_id, worker)
   - Only if status == Funded and worker is KYC-verified (off-chain check + on-chain flag)
   - Sets assignee, status = Assigned

3. submit_work(task_id, proof_hash)
   - Only assignee
   - status = Submitted
   - Starts challenge window (e.g. 48h)

4. release(task_id)
   - Only poster (or after challenge window expires)
   - Transfers reward to worker
   - status = Completed
   - Emits ReputationHint for indexer

5. dispute(task_id, reason_hash)
   - Poster or worker
   - status = Disputed
   - Funds held until arbiter decision

6. resolve_dispute(task_id, winner, arbiter)
   - Only authorized arbiter
   - Pays winner, optionally splits

7. refund(task_id)
   - Only if never claimed or after timeout with no submission
   - Returns funds to poster

Access control:
- Poster, Worker, Arbiter roles
- Optional: require a minimum reputation score stored in a linked Reputation contract

Events are indexed by the PiForge backend to update the UI and reputation scores.
*/
