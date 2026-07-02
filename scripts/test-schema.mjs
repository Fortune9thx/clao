import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const pk = "0x510d7d3ccebaac29eade2199908e713a659dffa61777a95bf1ddda93d7e83519";
const acc = createAccount(pk);
const client = createClient({ chain: studionet, account: acc });

// Test getContractSchemaForCode with a minimal contract
const minCode = `# { "Depends": "py-genlayer:test" }
from genlayer import *
class T(gl.Contract):
    x: str
    def __init__(self) -> None:
        self.x = 'hi'
    @gl.public.view
    def get_x(self) -> str:
        return self.x
`;

console.log("Testing getContractSchemaForCode...");
try {
  const schema = await client.getContractSchemaForCode({ code: minCode });
  console.log("schema:", JSON.stringify(schema, null, 2));
} catch (e) {
  console.log("schema error:", e.message?.slice(0, 500));
  console.log("full error:", String(e).slice(0, 500));
}

// Also test with football_bets
const fbCode = readFileSync(
  resolve(__dirname, "../node_modules/genlayer/templates/default/contracts/football_bets.py"),
  "utf8"
);
console.log("\nTesting football_bets schema...");
try {
  const schema2 = await client.getContractSchemaForCode({ code: fbCode });
  console.log("fb schema:", JSON.stringify(schema2, null, 2).slice(0, 500));
} catch (e) {
  console.log("fb schema error:", e.message?.slice(0, 500));
}
