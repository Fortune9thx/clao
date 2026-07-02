import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pk = "0x510d7d3ccebaac29eade2199908e713a659dffa61777a95bf1ddda93d7e83519";
const acc = createAccount(pk);
const client = createClient({ chain: studionet, account: acc });

// Deploy the actual CLAORegistry.py
const code = readFileSync(resolve(__dirname, "../contracts/CLAORegistry.py"), "utf8");
console.log("code length:", code.length, "chars");
console.log("first 2 lines:", code.split("\n").slice(0, 2).join(" | "));

const txId = await client.deployContract({ code, args: ["dao-01", "Bradbury Alpha DAO", "2,450,000 USD"] });
console.log("txId:", txId);
const receipt = await client.waitForTransactionReceipt({ hash: txId, status: "FINALIZED", interval: 3000, retries: 30 });
const exec = receipt?.consensus_data?.leader_receipt?.[0]?.execution_result;
const result = receipt?.consensus_data?.leader_receipt?.[0]?.result;
console.log("execution_result:", exec);
console.log("result:", JSON.stringify(result));
if (exec === "SUCCESS") console.log("address:", receipt?.data?.contract_address);
