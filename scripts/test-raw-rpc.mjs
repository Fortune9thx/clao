// Call gen_getContractSchemaForCode directly to see what params genlayer-js sends
const origFetch = globalThis.fetch;
globalThis.fetch = async (url, opts) => {
  if (opts?.body) {
    try {
      const body = JSON.parse(opts.body);
      if (body.method === "gen_getContractSchemaForCode") {
        const raw = JSON.stringify(body, null, 2);
        // Show first 600 chars of the raw param
        console.log("RAW gen_getContractSchemaForCode body (first 600 chars):");
        console.log(raw.slice(0, 600));
        console.log("...");
        // Check if comment is present
        const paramStr = JSON.stringify(body.params);
        console.log("\nContains 'Depends':", paramStr.includes("Depends"));
        console.log("Contains 'py-genlayer':", paramStr.includes("py-genlayer"));
        console.log("Contains 'runner_comment':", paramStr.includes("runner_comment"));
        // Decode first param if it looks like hex
        if (body.params?.[0]?.code) {
          const code = body.params[0].code;
          console.log("\ncode param type:", typeof code, "length:", code.length);
          console.log("code starts with:", code.slice(0, 100));
        } else if (body.params?.[0]) {
          const p = body.params[0];
          console.log("\nparam[0] keys:", Object.keys(p));
          for (const [k, v] of Object.entries(p)) {
            if (typeof v === "string" && v.length > 100) {
              console.log(`  ${k}: [${v.length} chars] ${v.slice(0, 120)}`);
            } else {
              console.log(`  ${k}:`, JSON.stringify(v));
            }
          }
        }
      }
    } catch (e) {
      console.error("intercept error:", e.message);
    }
  }
  return origFetch(url, opts);
};

import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const pk = "0x510d7d3ccebaac29eade2199908e713a659dffa61777a95bf1ddda93d7e83519";
const acc = createAccount(pk);
const client = createClient({ chain: studionet, account: acc });

const code = `# { "Depends": "py-genlayer:test" }
from genlayer import *
class T(gl.Contract):
    x: str
    def __init__(self) -> None:
        self.x = 'hi'
`;

console.log("Original code first 80 chars:", JSON.stringify(code.slice(0, 80)));

try {
  await client.getContractSchemaForCode({ code });
} catch (_) {}
