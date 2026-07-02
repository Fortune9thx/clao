import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const pk = "0x510d7d3ccebaac29eade2199908e713a659dffa61777a95bf1ddda93d7e83519";
const acc = createAccount(pk);
const client = createClient({ chain: studionet, account: acc });

// Test the exact pattern our contract uses: str fields + constructor args +
// multiple TreeMaps + u256 + json + memory TreeMap with zfill keys
const code = `# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *
import json
import typing


class CLAOTest(gl.Contract):
    dao_id: str
    dao_name: str
    treasury_label: str
    treasury_released: u256

    proposals: TreeMap[str, str]
    disputes: TreeMap[str, str]
    reputation: TreeMap[str, str]
    memory: TreeMap[str, str]
    event_count: u256

    def __init__(self, dao_id: str, name: str, treasury_label: str) -> None:
        self.dao_id = dao_id
        self.dao_name = name
        self.treasury_label = treasury_label
        self.treasury_released = u256(0)
        self.event_count = u256(0)
        seq = self._next_seq()
        entry = json.dumps({"seq": int(seq), "kind": "genesis", "title": name})
        self.memory[str(int(seq)).zfill(10)] = entry

    def _next_seq(self) -> u256:
        self.event_count = u256(int(self.event_count) + 1)
        return self.event_count

    @gl.public.write
    def add_proposal(self, pid: str, title: str) -> None:
        p = json.dumps({"id": pid, "title": title, "status": "pending"})
        self.proposals[pid] = p

    @gl.public.view
    def get_dao(self) -> dict:
        return {
            "id": self.dao_id, "name": self.dao_name,
            "treasury_label": self.treasury_label,
            "treasury_released": int(self.treasury_released),
        }

    @gl.public.view
    def get_proposal(self, pid: str) -> dict:
        if pid not in self.proposals:
            return {}
        return json.loads(self.proposals[pid])

    @gl.public.view
    def get_memory(self) -> list:
        return [json.loads(v) for v in self.memory.values()]
`;

console.log("deploying full-types test...");
const txId = await client.deployContract({ code, args: ["dao-01", "Test DAO", "1,000,000 USD"] });
const receipt = await client.waitForTransactionReceipt({ hash: txId, status: "FINALIZED", interval: 3000, retries: 30 });
const exec = receipt?.consensus_data?.leader_receipt?.[0]?.execution_result;
console.log("execution_result:", exec);
console.log("result:", JSON.stringify(receipt?.consensus_data?.leader_receipt?.[0]?.result));
if (exec === "SUCCESS") {
  const addr = receipt?.data?.contract_address;
  console.log("contract_address:", addr);
}
