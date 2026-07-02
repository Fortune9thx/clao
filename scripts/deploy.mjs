// Deploy CLAORegistry.py to a GenLayer network straight from source.
//   node --env-file=scripts/.env scripts/deploy.mjs
//
// Flow:
//   1. deployContract() → txId (GenLayer transaction hash)
//   2. waitForTransactionReceipt(FINALIZED) → receipt.contractAddress
//   3. Verify with get_dao view call
//   4. Write VITE_CLAO_ADDRESS to .env.local
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { getClient, DAO_ARGS } from "./lib.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const contractPath = resolve(root, "contracts/CLAORegistry.py");

async function main() {
  const code = readFileSync(contractPath, "utf8");
  const { client, account, chain } = getClient();

  console.log(`▶ Deploying CLAORegistry to ${chain.name} (id ${chain.id})`);
  console.log(`  deployer: ${account.address}`);
  console.log(`  args:     ${JSON.stringify(DAO_ARGS)}`);

  // deployContract returns a GenLayer txId, not the contract address directly.
  const txId = await client.deployContract({ code, args: DAO_ARGS });
  console.log(`\n  deploy tx: ${txId}`);
  console.log("  waiting for finalization…");

  const receipt = await client.waitForTransactionReceipt({
    hash: txId,
    status: "FINALIZED",
    interval: 5000,
    retries: 60,
  });

  // The contract address is the recipient field of a deploy tx.
  const address =
    receipt?.data?.contract_address ||
    receipt?.contractAddress ||
    receipt?.to_address;

  if (!address) {
    console.error("Receipt:", JSON.stringify(receipt, null, 2));
    throw new Error("Could not extract contract address from receipt.");
  }

  console.log(`\n✅ Deployed at: ${address}`);

  // Confirm the contract is live by reading the seeded DAO.
  process.stdout.write("  verifying get_dao");
  for (let i = 0; i < 20; i++) {
    try {
      const dao = await client.readContract({
        address,
        functionName: "get_dao",
        args: [],
      });
      if (dao && dao.name) {
        console.log(`\n  on-chain DAO: ${dao.name} · treasury ${dao.treasury_label}`);
        break;
      }
    } catch {
      /* not finalized yet */
    }
    process.stdout.write(".");
    await new Promise((r) => setTimeout(r, 3000));
  }

  // Write the address into .env.local for the frontend.
  const envLocal = resolve(root, ".env.local");
  const addrLine = `VITE_CLAO_ADDRESS=${address}\n`;
  const netLine = `VITE_GL_NETWORK=${chain.name}\n`;
  let contents = existsSync(envLocal) ? readFileSync(envLocal, "utf8") : "";
  contents = contents.includes("VITE_CLAO_ADDRESS=")
    ? contents.replace(/VITE_CLAO_ADDRESS=.*\n?/, addrLine)
    : contents + addrLine;
  if (!/VITE_GL_NETWORK=/.test(contents)) contents += netLine;
  writeFileSync(envLocal, contents);
  console.log(`\n📝 Wrote VITE_CLAO_ADDRESS to .env.local — restart \`npm run dev\` to go live.`);
}

main().catch((e) => {
  console.error("\n❌ Deploy failed:", e.message || e);
  process.exit(1);
});
