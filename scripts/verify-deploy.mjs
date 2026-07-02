import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const ADDRESS = "0x87F65d5EADC7D24F08DD91C5397961dE3240c833";

const pk = "0x510d7d3ccebaac29eade2199908e713a659dffa61777a95bf1ddda93d7e83519";
const acc = createAccount(pk);
const client = createClient({ chain: studionet, account: acc });

console.log("verifying deployed CLAORegistry at", ADDRESS);

const dao = await client.readContract({ address: ADDRESS, functionName: "get_dao", args: [] });
console.log("get_dao:", JSON.stringify(dao));

const memory = await client.readContract({ address: ADDRESS, functionName: "get_memory_timeline", args: [] });
console.log("memory timeline:", JSON.stringify(memory));

// Write to .env.local
const envLocal = resolve(root, ".env.local");
const addrLine = `VITE_CLAO_ADDRESS=${ADDRESS}\n`;
const netLine = `VITE_GL_NETWORK=Genlayer Studio Network\n`;
let contents = readFileSync(envLocal, "utf8");
contents = contents.replace(/VITE_CLAO_ADDRESS=.*\n?/, addrLine);
if (!/VITE_GL_NETWORK=/.test(contents)) contents += netLine;
writeFileSync(envLocal, contents);
console.log("\n.env.local updated:");
console.log(readFileSync(envLocal, "utf8"));
