import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const pk = "0x510d7d3ccebaac29eade2199908e713a659dffa61777a95bf1ddda93d7e83519";
const acc = createAccount(pk);
const client = createClient({ chain: studionet, account: acc });

const code = `# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *
import json


class MapTest(gl.Contract):
    data: TreeMap[str, str]
    count: u256

    def __init__(self) -> None:
        self.count = u256(0)

    @gl.public.write
    def set(self, key: str, value: str) -> None:
        self.data[key] = value
        self.count = u256(int(self.count) + 1)

    @gl.public.view
    def get(self, key: str) -> str:
        if key not in self.data:
            return ""
        return self.data[key]

    @gl.public.view
    def get_all(self) -> dict:
        return {"count": int(self.count), "items": {k: v for k, v in self.data.items()}}
`;

console.log("deploying TreeMap[str,str] test...");
const txId = await client.deployContract({ code, args: [] });
const receipt = await client.waitForTransactionReceipt({ hash: txId, status: "FINALIZED", interval: 3000, retries: 30 });
const exec = receipt?.consensus_data?.leader_receipt?.[0]?.execution_result;
console.log("execution_result:", exec);
console.log("result:", JSON.stringify(receipt?.consensus_data?.leader_receipt?.[0]?.result));
if (exec === "SUCCESS") {
  console.log("contract_address:", receipt?.data?.contract_address);
}
