import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const pk = "0x510d7d3ccebaac29eade2199908e713a659dffa61777a95bf1ddda93d7e83519";
const acc = createAccount(pk);
const client = createClient({ chain: studionet, account: acc });

// Stub contract PLUS real cast_cognitive_vote + helpers
const code = `# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *
import json
import typing


class CLAORegistry(gl.Contract):
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
        if not dao_id or not name:
            raise Exception("dao_id and name are required")
        self.dao_id = dao_id
        self.dao_name = name
        self.treasury_label = treasury_label
        self.treasury_released = u256(0)
        self.event_count = u256(0)
        self._remember("precedent", "", name, "",
                       "DAO genesis.", "constructor")

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

    def _extract_json(self, raw: str) -> str:
        start = raw.find("{")
        end = raw.rfind("}")
        if start != -1 and end != -1 and end > start:
            return raw[start:end + 1]
        return raw

    def _parse_verdict(self, raw: str):
        try:
            data = json.loads(self._extract_json(raw))
            verdict = str(data.get("verdict", "Escalated"))
            agreement = int(data.get("agreement", 50))
            reasoning = str(data.get("reasoning", ""))
            agreement = max(0, min(100, agreement))
            return verdict, agreement, reasoning
        except Exception:
            return "Escalated", 50, raw[:160]

    @gl.public.write
    def submit_proposal(self, proposal_id: str, title: str, proposer: str,
                        amount: int, quorum_required: int) -> None:
        if proposal_id in self.proposals:
            raise Exception("proposal already exists")
        self.proposals[proposal_id] = json.dumps({
            "id": proposal_id, "title": title, "proposer": proposer,
            "amount": amount, "status": "GenLayer_Validation",
            "quorum_required": quorum_required, "agreement": 0, "reasoning": "",
        })
        self._remember("proposal", proposal_id, title, "", "Submitted.", "submit_proposal")

    @gl.public.write
    def cast_cognitive_vote(self, proposal_id: str, arguments_for: str,
                            arguments_against: str) -> str:
        if proposal_id not in self.proposals:
            raise Exception("unknown proposal")
        p = json.loads(self.proposals[proposal_id])

        title = p["title"]
        amount = int(p["amount"])
        quorum = int(p["quorum_required"])
        for_args = arguments_for
        against_args = arguments_against

        task = f"""You are a validator in the Cognitive Branch of '{self.dao_name}'.
Adjudicate proposal '{title}' requesting {amount} units (quorum {quorum}%).
Arguments FOR: {for_args}
Arguments AGAINST: {against_args}
Decide a verdict and a subjective agreement percentage (0-100).
Respond as strict JSON: {{"verdict": "Approved|Rejected|Escalated", "agreement": <int>, "reasoning": "<one sentence>"}}"""

        criteria = """A valid response is strict JSON with keys verdict, agreement
(an integer 0-100), and a concise reasoning sentence."""

        result = gl.eq_principle.prompt_non_comparative(
            lambda: f"FOR: {for_args}\\nAGAINST: {against_args}",
            task=task,
            criteria=criteria,
        )

        verdict, agreement, reasoning = self._parse_verdict(result)

        p["agreement"] = agreement
        p["reasoning"] = reasoning
        if verdict == "Approved":
            p["status"] = "Validated"
        elif verdict == "Rejected":
            p["status"] = "Rejected"
        self.proposals[proposal_id] = json.dumps(p)
        self._remember("ruling", proposal_id, title, verdict,
                       f"Consensus {agreement}% — {reasoning}", "cast_cognitive_vote")
        return reasoning

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

console.log("code length:", code.length);
console.log("deploying full vote+helpers...");
const txId = await client.deployContract({ code, args: ["dao-01", "Bradbury Alpha DAO", "2,450,000 USD"] });
const receipt = await client.waitForTransactionReceipt({ hash: txId, status: "FINALIZED", interval: 3000, retries: 30 });
const exec = receipt?.consensus_data?.leader_receipt?.[0]?.execution_result;
console.log("execution_result:", exec);
console.log("result:", JSON.stringify(receipt?.consensus_data?.leader_receipt?.[0]?.result));
if (exec === "SUCCESS") console.log("address:", receipt?.data?.contract_address);
