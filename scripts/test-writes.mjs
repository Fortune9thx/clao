import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const pk = "0x510d7d3ccebaac29eade2199908e713a659dffa61777a95bf1ddda93d7e83519";
const acc = createAccount(pk);
const client = createClient({ chain: studionet, account: acc });

// Test with full method surface BUT no eq_principle (no LLM calls)
const code = `# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *
import json
import typing


class CLAOTest2(gl.Contract):
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
        self._remember("precedent", "", name, "", "DAO genesis.", "constructor")

    def _next_seq(self) -> u256:
        self.event_count = u256(int(self.event_count) + 1)
        return self.event_count

    def _seq_key(self, seq: u256) -> str:
        return str(int(seq)).zfill(10)

    def _remember(self, kind: str, proposal_id: str, title: str, verdict: str,
                  summary: str, tx_note: str) -> None:
        seq = self._next_seq()
        entry = json.dumps({
            "seq": int(seq), "kind": kind, "proposal_id": proposal_id,
            "title": title, "verdict": verdict, "summary": summary, "tx_note": tx_note,
        })
        self.memory[self._seq_key(seq)] = entry

    @gl.public.write
    def submit_proposal(self, proposal_id: str, title: str, proposer: str,
                        amount: int, quorum_required: int) -> None:
        if proposal_id in self.proposals:
            raise Exception("proposal already exists")
        proposal = json.dumps({
            "id": proposal_id, "title": title, "proposer": proposer,
            "amount": amount, "status": "GenLayer_Validation",
            "quorum_required": quorum_required, "agreement": 0, "reasoning": "",
        })
        self.proposals[proposal_id] = proposal
        self._remember("proposal", proposal_id, title, "", "Submitted.", "submit_proposal")

    @gl.public.write
    def open_dispute(self, dispute_id: str, proposal_id: str, reason: str) -> None:
        d = json.dumps({"id": dispute_id, "proposal_id": proposal_id, "reason": reason, "status": "Filed", "outcome": ""})
        self.disputes[dispute_id] = d
        self._remember("dispute", proposal_id, "Dispute filed", "Escalated", reason, "open_dispute")

    @gl.public.write
    def finalize_execution(self, proposal_id: str) -> None:
        if proposal_id not in self.proposals:
            raise Exception("unknown proposal")
        p = json.loads(self.proposals[proposal_id])
        p["status"] = "Treasury_Released"
        self.proposals[proposal_id] = json.dumps(p)

    @gl.public.view
    def get_dao(self) -> dict:
        return {
            "id": self.dao_id, "name": self.dao_name,
            "treasury_label": self.treasury_label,
            "treasury_released": int(self.treasury_released),
        }

    @gl.public.view
    def get_proposal(self, proposal_id: str) -> dict:
        if proposal_id not in self.proposals:
            return {}
        return json.loads(self.proposals[proposal_id])

    @gl.public.view
    def get_complete_storage(self) -> dict:
        return {
            "dao": {"id": self.dao_id, "name": self.dao_name,
                    "treasury_label": self.treasury_label,
                    "treasury_released": int(self.treasury_released)},
            "proposals": [json.loads(v) for v in self.proposals.values()],
            "disputes": [json.loads(v) for v in self.disputes.values()],
            "memory": [json.loads(v) for v in self.memory.values()],
        }
`;

console.log("deploying writes-only test (no LLM)...");
const txId = await client.deployContract({ code, args: ["dao-01", "Test DAO", "1M USD"] });
const receipt = await client.waitForTransactionReceipt({ hash: txId, status: "FINALIZED", interval: 3000, retries: 30 });
const exec = receipt?.consensus_data?.leader_receipt?.[0]?.execution_result;
console.log("execution_result:", exec);
console.log("result:", JSON.stringify(receipt?.consensus_data?.leader_receipt?.[0]?.result));
if (exec === "SUCCESS") console.log("address:", receipt?.data?.contract_address);
