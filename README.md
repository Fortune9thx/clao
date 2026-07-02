# CLAO — Cognition Layer for Autonomous Organizations

> The cognitive operating system for autonomous organizations, built on **GenLayer** for the **Bradbury** milestone.

CLAO introduces a new organizational branch — the **Cognitive Branch** — that observes, reasons,
remembers, and adjudicates governance decisions using GenLayer **intelligent contracts**. Unlike a
passive governance dashboard, every action in CLAO is a real on-chain write into a contract that
*reasons with an LLM* and reaches **subjective consensus** (the Equivalence Principle).

## Why the contract is the brain (not a data bag)

The `CLAORegistry` intelligent contract (`contracts/CLAORegistry.py`) exposes the **full write surface**,
and the UI exercises **all of it**:

| UI action | Contract method | Kind | GenLayer capability |
|---|---|---|---|
| Boot | `register_dao` | write | structured state |
| Boot | `submit_proposal` | write | structured state |
| Initiate Cognitive Validation | `cast_cognitive_vote` | write + LLM | **subjective consensus on-chain** |
| Intelligence Report | `record_ruling` | write | institutional memory |
| Challenge Verdict | `open_dispute` | write | dispute intake |
| Adjudicate | `resolve_dispute` | write + LLM | **AI jury adjudication** |
| Simulate Execution | `finalize_execution` | write.payable | treasury release |
| Attest reputation | `update_reputation` | write | reputation ledger |
| All panels | `get_dao` / `get_proposal` / `get_memory_timeline` / `get_reputation` / `get_complete_storage` | view | gas-free reads |

Reference: [Writing Data to GenLayer contracts](https://docs.genlayer.com/developers/decentralized-applications/writing-data).

## Stack

React 19 · TypeScript · Tailwind CSS v4 · Framer Motion · Zustand · Lucide · `genlayer-js`
(+ a Rive-ready `ClaoAssistant` for the computational-spirit character, wired but using an
animated placeholder until the `.riv` asset is added).

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build
```

The app runs fully against a **mock gateway** out of the box — no wallet required — so the entire
UX (signing → pending → finalized) is interactive immediately.

## Go live on Studionet

Studionet (chain id `61999`, RPC `https://studio.genlayer.com/api`) has a built-in faucet.

**1 — Get a funded deployer key**
```bash
node -e "import('genlayer-js').then(m=>console.log(m.generatePrivateKey()))"
cp scripts/.env.example scripts/.env      # paste the key into CLAO_DEPLOYER_PRIVATE_KEY
```
Fund that address from the faucet at [studio.genlayer.com](https://studio.genlayer.com).

**2 — Deploy + verify the contract**
```bash
npm run deploy   # deploys CLAORegistry.py, seeds the DAO via constructor args,
                 # confirms get_dao, and writes VITE_CLAO_ADDRESS to .env.local
npm run smoke    # real submit_proposal write → get_proposal read round-trip
```
> Alternative (GenLayer CLI): `npm run gen:network && npm run gen:account && npm run gen:deploy`.

**3 — Run live**
```bash
npm run dev
```
Click **Connect Studionet** in the header. The app swaps the mock gateway for the live one,
hydrates from `get_complete_storage`, and every action becomes a real `writeContract`
transaction — toasts flip from `SIM` → `STUDIONET`, and the **Cognitive Branch** chip shows the
contract address + last sync. The Sync button reconciles the UI with chain state on demand.

The frontend never imports `genlayer-js` until you connect (dynamic import), keeping the initial
bundle lean and the app usable offline.

## On-chain scripts

| Command | What it does |
|---|---|
| `npm run deploy` | Deploy `CLAORegistry.py` from source (`deployContract`), seed DAO, write address to `.env.local` |
| `npm run smoke` | Real write+read round-trip against the deployed contract |
| `npm run gen:*` | GenLayer CLI passthrough (`network` / `account` / `deploy`) |

## Architecture

```
contracts/CLAORegistry.py     GenLayer intelligent contract (the Cognitive Branch)
src/types         domain + GenLayer + character + validation types
src/data          mock DAO / memory / reputation seeds
src/lib/genlayer  gateway abstraction · live (genlayer-js) + mock impls · ClaoContract facade
src/store         Zustand slices + cross-cutting orchestration (the verbs the UI calls)
src/hooks         useClaoState · useAnimatedNumber · useContractWrite
src/animations    Rive state-map (claoStates) + Framer variants
src/components/ui  GlassPanel · RadialMeter · MetricBar · StatusPill · GlowButton · Sparkline · TxToast
src/modules        header · governance · proposals · validation · reputation · memory · clao
```

Adding the Rive character later touches exactly one file — `src/modules/clao/ClaoAssistant.tsx` —
because the mood → Rive input mapping already lives in `src/animations/claoStates.ts`.
