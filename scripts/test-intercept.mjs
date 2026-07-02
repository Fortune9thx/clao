// Intercept RPC calls to see what genlayer-js sends for a deploy
const origFetch = globalThis.fetch;
globalThis.fetch = async (url, opts) => {
  if (opts?.body) {
    try {
      const body = JSON.parse(opts.body);
      if (body.method && !body.method.startsWith("eth_chainId") && !body.method.startsWith("eth_blockNumber")) {
        console.log("\n=== RPC call:", body.method, "===");
        if (body.params?.[0]) {
          const p = body.params[0];
          if (typeof p === "object") {
            for (const [k, v] of Object.entries(p)) {
              if (typeof v === "string" && v.length > 100) {
                console.log("  ", k, ": [string len=" + v.length + "]", v.slice(0, 80) + "...");
              } else {
                console.log("  ", k, ":", JSON.stringify(v)?.slice(0, 200));
              }
            }
          } else if (typeof p === "string") {
            console.log("  param[0]:", p.slice(0, 200));
          }
        }
      }
    } catch {}
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

console.log("sending deploy...");
const txId = await client.deployContract({ code, args: [] });
console.log("\ntxId:", txId);
