// Shared helpers for the deploy + smoke scripts.
// Run with Node's native env loader, e.g.:
//   node --env-file=scripts/.env scripts/deploy.mjs
import { createClient, createAccount, generatePrivateKey } from "genlayer-js";
import { studionet, localnet, testnetBradbury, testnetAsimov } from "genlayer-js/chains";

const CHAINS = { studionet, localnet, testnetBradbury, "testnet-bradbury": testnetBradbury, testnetAsimov };

export function getChain() {
  const name = (process.env.CLAO_NETWORK || "studionet").trim();
  const chain = CHAINS[name];
  if (!chain) throw new Error(`Unknown CLAO_NETWORK "${name}". Use studionet | localnet | testnetBradbury.`);
  return chain;
}

/** Build an authenticated client from CLAO_DEPLOYER_PRIVATE_KEY. */
export function getClient() {
  let pk = process.env.CLAO_DEPLOYER_PRIVATE_KEY;
  if (!pk) {
    throw new Error(
      "CLAO_DEPLOYER_PRIVATE_KEY is not set.\n" +
        `Generate one with:  node -e "import('genlayer-js').then(m=>console.log(m.generatePrivateKey()))"\n` +
        "then fund it from the Studionet faucet (studio.genlayer.com) and put it in scripts/.env",
    );
  }
  if (!pk.startsWith("0x")) pk = `0x${pk}`;
  const account = createAccount(pk);
  const chain = getChain();
  const client = createClient({ chain, account });
  return { client, account, chain };
}

export const DAO_ARGS = [
  process.env.CLAO_DAO_ID || "dao-01",
  process.env.CLAO_DAO_NAME || "Bradbury Alpha DAO",
  process.env.CLAO_DAO_TREASURY || "2,450,000 USD",
];

export { generatePrivateKey };
