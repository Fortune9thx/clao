# CLAO

**Cognition Layer for Autonomous Organizations**

CLAO is an AI-native DAO governance application built on [GenLayer](https://genlayer.com) for the **Bradbury** milestone. It introduces the **Cognitive Branch** — an intelligent contract layer that observes, reasons, remembers, and adjudicates governance decisions on-chain using GenLayer's Equivalence Principle.

Every action in the UI is a real write into a contract that reasons with an LLM and reaches **subjective consensus on-chain**. There is no deterministic fallback and no off-chain oracle.

**Live demo:** [clao-red.vercel.app](https://clao-red.vercel.app)

---

## Contract surface

The `CLAORegistry` intelligent contract (`contracts/CLAORegistry.py`) exposes the full governance write surface. The UI exercises all of it:

| Action | Contract method | Kind | Capability |
|---|---|---|---|
| DAO registration (deploy script) | `register_dao` | write | structured state |
| Submit proposal (UI modal) | `submit_proposal` | write | structured state |
| Validate | `cast_cognitive_vote` | write + LLM | subjective consensus on-chain |
| Record ruling | `record_ruling` | write | institutional memory |
| Open challenge | `open_dispute` | write | dispute intake |
| Adjudicate | `resolve_dispute` | write + LLM | AI jury adjudication |
| Release funds | `finalize_execution` | write (payable) | treasury release |
| Attest | `update_reputation` | write | reputation ledger |
| Read all state | `get_complete_storage` | view | gas-free |

The LLM-backed methods (`cast_cognitive_vote`, `resolve_dispute`) go through GenLayer's Equivalence Principle: multiple validators reason independently and reach subjective consensus, producing a transparent, auditable on-chain decision.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Tailwind CSS v4, Vite |
| Animations | Framer Motion v12 |
| State | Zustand v5 |
| Wallet | RainbowKit + wagmi + viem |
| Chain | genlayer-js v1.1.8 |
| Contract | GenLayer intelligent contract (Python) |

---

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build
```

The app boots in **read-only live mode**: it hydrates real on-chain state from the deployed CLAORegistry with no wallet required. Connecting a wallet unlocks writes. There is no mock or simulation path; every proposal, memory entry, and treasury figure shown comes from the chain.

---

## Deploy to Studionet

Studionet (chain `61999`, RPC `https://studio.genlayer.com/api`) has a built-in faucet.

**1. Get a funded deployer key**

```bash
node -e "import('genlayer-js').then(m => console.log(m.generatePrivateKey()))"
cp scripts/.env.example scripts/.env   # paste key into CLAO_DEPLOYER_PRIVATE_KEY
```

Fund the address from the faucet at [studio.genlayer.com](https://studio.genlayer.com).

**2. Deploy and verify**

```bash
npm run deploy   # deploys CLAORegistry.py, seeds the DAO, writes VITE_CLAO_ADDRESS to .env.local
npm run smoke    # write + read round-trip against the live contract
```

**3. Run against the live contract**

```bash
npm run dev
```

Click **Connect Studionet** in the header. The app swaps the mock gateway for the live one, hydrates from `get_complete_storage`, and every action becomes a real `writeContract` transaction. Toasts flip from `SIM` to `STUDIONET`, and the Cognitive Branch chip shows the contract address and last sync.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run deploy` | Deploy `CLAORegistry.py`, seed DAO, write address to `.env.local` |
| `npm run smoke` | Real write + read round-trip against the deployed contract |
| `npm run gen:network` | GenLayer CLI: configure Studionet |
| `npm run gen:account` | GenLayer CLI: create an account |
| `npm run gen:deploy` | GenLayer CLI: deploy via CLI (alternative to `npm run deploy`) |

---

## Architecture

```
contracts/
  CLAORegistry.py       GenLayer intelligent contract (the Cognitive Branch)

src/
  types/                Domain types, GenLayer types, validation
  data/                 Mock DAO, memory, and reputation seeds
  lib/genlayer/         Gateway abstraction: live (genlayer-js) + mock + ClaoContract facade
  store/                Zustand slices and cross-cutting orchestration
  hooks/                useClaoState, useAnimatedNumber, useContractWrite
  animations/           Framer Motion variants and character state map
  components/ui/        GlassPanel, RadialMeter, MetricBar, StatusPill, GlowButton, TxToast
  modules/              header, governance, proposals, validation, reputation, memory, clao
  screens/              LandingPage, AppShell, and sub-pages
  shell/                TopBar and Sidebar
```

---

## Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `VITE_CLAO_ADDRESS` | `.env.local` | Deployed contract address |
| `VITE_GL_NETWORK` | `.env.local` | `studionet` or `testnetBradbury` |
| `CLAO_DEPLOYER_PRIVATE_KEY` | `scripts/.env` | Deployer key for `npm run deploy` |
| `CLAO_NETWORK` | `scripts/.env` | Network for deploy scripts |
| `CLAO_DAO_ID` | `scripts/.env` | DAO identifier for seeding |
| `CLAO_DAO_NAME` | `scripts/.env` | DAO display name for seeding |

Neither `.env.local` nor `scripts/.env` is committed to git.

---

## GenLayer docs

- [Intelligent Contracts](https://docs.genlayer.com/developers/intelligent-contracts/overview)
- [Equivalence Principle](https://docs.genlayer.com/concepts/equivalence-principle)
- [Writing Data](https://docs.genlayer.com/developers/decentralized-applications/writing-data)
- [genlayer-js](https://docs.genlayer.com/developers/genlayer-js/overview)
