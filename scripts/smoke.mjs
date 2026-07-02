// Smoke-test a deployed CLAORegistry: perform a real write + read round-trip.
//   node --env-file=scripts/.env scripts/smoke.mjs
import { getClient } from "./lib.mjs";

const address = process.env.VITE_CLAO_ADDRESS || process.env.CLAO_ADDRESS;

async function main() {
  if (!address) throw new Error("Set VITE_CLAO_ADDRESS (or CLAO_ADDRESS) in scripts/.env to the deployed contract.");
  const { client } = getClient();
  const id = `PROP-SMOKE-${Date.now().toString().slice(-5)}`;

  console.log(`▶ Smoke test against ${address}`);
  console.log(`\n1. write submit_proposal(${id})`);
  const txId = await client.writeContract({
    address,
    functionName: "submit_proposal",
    args: [id, "Smoke-test proposal", "0xSmokeTester", 1000, 60],
    value: 0n,
  });
  console.log(`   tx ${txId} — waiting for finalization…`);

  const receipt = await client.waitForTransactionReceipt({
    hash: txId,
    status: "FINALIZED",
    interval: 5000,
    retries: 30,
  });
  console.log(`   status: ${receipt?.status || "finalized"}`);

  console.log("\n2. read get_proposal");
  const proposal = await client.readContract({
    address,
    functionName: "get_proposal",
    args: [id],
  });
  console.log("   ↳", JSON.stringify(proposal));

  console.log("\n3. read get_complete_storage");
  const storage = await client.readContract({
    address,
    functionName: "get_complete_storage",
    args: [],
  });
  console.log(`   ↳ proposals=${storage?.proposals?.length} memory=${storage?.memory?.length}`);

  if (!proposal || proposal.id !== id) {
    throw new Error("Round-trip mismatch — write not reflected in read.");
  }
  console.log("\n✅ On-chain write/read round-trip verified.");
}

main().catch((e) => {
  console.error("\n❌ Smoke test failed:", e.message || e);
  process.exit(1);
});
