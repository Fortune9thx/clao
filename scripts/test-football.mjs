import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const pk = "0x510d7d3ccebaac29eade2199908e713a659dffa61777a95bf1ddda93d7e83519";
const acc = createAccount(pk);
const client = createClient({ chain: studionet, account: acc });

const code = readFileSync(
  resolve(__dirname, "../node_modules/genlayer/templates/default/contracts/football_bets.py"),
  "utf8"
);

console.log("deploying football_bets.py...");
const txId = await client.deployContract({ code, args: [] });
console.log("txId:", txId);

const receipt = await client.waitForTransactionReceipt({ hash: txId, status: "FINALIZED", interval: 3000, retries: 30 });
console.log("execution_result:", receipt?.consensus_data?.leader_receipt?.[0]?.execution_result);
console.log("result:", JSON.stringify(receipt?.consensus_data?.leader_receipt?.[0]?.result));
console.log("contract_address:", receipt?.data?.contract_address);
