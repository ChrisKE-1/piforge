# PiForge – Verified Human + AI Work Operating System for Pi Network

**Tagline:** Verified humans. Real work. Pi that moves.

PiForge is a flagship infrastructure dApp for the Pi Network ecosystem. It turns the largest KYC-verified human network into a productive economic layer: micro-tasks, AI data labeling, human feedback, local services, and micro-freelance — all paid in Pi with on-chain escrow and portable reputation.

## Why this exists

Pi has Open Mainnet, smart contracts (Soroban), millions of KYC-verified Pioneers, and growing developer tooling. What has been missing is a high-velocity, identity-native horizontal layer that creates daily earning opportunities and real Pi sinks. PiForge is that layer.

## Features (MVP)

- Pi Wallet authentication via official SDK
- KYC-gated claiming and posting of paid work
- Task marketplace (AI data, local services, micro-freelance, surveys, content)
- Escrow-style Pi payments (`Pi.createPayment`)
- Worker & poster dashboards
- Portable reputation foundation
- Mobile-first UI optimized for Pi Browser
- Soroban escrow contract skeleton ready for Testnet

## Tech Stack

- Next.js 14 (App Router) + TypeScript + Tailwind
- Official Pi SDK (`sdk.minepi.com/pi-sdk.js`)
- Client store for MVP demo (swap to Supabase in production)
- Soroban Rust contract for escrow

## Quick Start (local)

```bash
cd piforge
npm install
npm run dev
```

Open http://localhost:3000. For full auth & payments, open the deployed URL inside **Pi Browser**.

## Deploy for Pi Browser

1. Register the app at `develop.pinet.com` (Pi Developer Portal).
2. Set your app’s production URL.
3. Deploy to Vercel / any static-friendly host (or Pi-compatible hosting).
4. Add environment variables:
   - `PI_API_KEY` – for server-side payment approval
   - `NEXT_PUBLIC_SANDBOX=true` while testing
5. Point your `.pi` domain (if claimed) or use the `pinet.com` gateway.

## Pi SDK Integration Points

| Action              | Code location                          |
|---------------------|----------------------------------------|
| Init                | `lib/pi-sdk.ts` → `initPiSDK()`        |
| Authenticate        | `Header.tsx` → `authenticatePioneer()` |
| Create payment      | `createPiPayment()` used in post & task detail |
| Server approve      | `app/api/payments/approve/route.ts`    |
| Server complete     | `app/api/payments/complete/route.ts`   |

## Smart Contract

See `contracts/task_escrow.rs` for the Soroban implementation skeleton.  
Logical specification is also provided in `contracts/TaskEscrow.sol` (readable, not for deployment).

Deploy to Pi Testnet first, then Mainnet after audit.

## Monetization & Pi Ad Network

1. **Platform fee**: 5–8% of completed task volume (taken at release).
2. **Pi Ad Network**: Show sponsored high-paying tasks and merchant offers on the free marketplace feed (privacy-first, native to Pi Browser).
3. **Premium posters**: Subscription in Pi for bulk posting, priority ranking, and advanced quality filters.
4. **Node contribution**: Optional extra earnings for SoloHost/node operators who run verification or light AI assist tasks.

## Go-to-Market for Pi Hackathon

1. **Week 1**: Deploy MVP, seed 50 high-quality AI & local tasks in target countries (Nigeria, Kenya, India, Indonesia, Philippines, Vietnam).
2. **Week 2**: Partner with 3–5 existing Pi merchants and 2 AI startups needing labeled data.
3. **Week 3**: Launch “Pioneer Earn Challenge” – first 1,000 completed tasks get bonus reputation + small Pi grant from platform.
4. **Week 4**: Submit to Pi Hackathon with live metrics (tasks completed, Pi volume, unique earners) and open-source the escrow contract.
5. **Messaging**: “Your KYC is not just a gate – it is your economic identity. Start earning.”

## Production Roadmap (post-MVP)

- Supabase / Postgres + Realtime
- Full Soroban escrow + reputation anchoring
- Dispute resolution with staked arbiters
- AI task matching & quality scoring
- SoloHost node contribution marketplace
- OUSD / stable-value payout option for cross-border work
- Mobile push via Pi Browser capabilities

## License

MIT – built for the Pi ecosystem. Fork it, improve it, ship it.

---

**PiForge is not another marketplace. It is infrastructure.**  
It makes every future commerce, AI, and social app on Pi more valuable by giving verified humans a way to earn and spend with trust.
