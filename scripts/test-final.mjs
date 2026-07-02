import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const pk = "0x510d7d3ccebaac29eade2199908e713a659dffa61777a95bf1ddda93d7e83519";
const acc = createAccount(pk);
const client = createClient({ chain: studionet, account: acc });

// test-add-resolve + all remaining methods, ASCII-only strings, helpers at top
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

    def _parse_outcome(self, raw: str):
        try:
            data = json.loads(self._extract_json(raw))
            return str(data.get("outcome", "Upheld")), str(data.get("reasoning", ""))
        except Exception:
            return "Upheld", raw[:160]

    @gl.public.write
    def register_dao(self, dao_id: str, name: str, treasury_label: str) -> None:
        self.dao_id = dao_id
        self.dao_name = name
        self.treasury_label = treasury_label
        self._remember("precedent", "", name, "", "DAO registered.", "register_dao")

    @gl.public.write
    def submit_proposal(self, proposal_id: str, title: str, proposer: str,
                        amount: int, quorum_required: int) -> None:
        if not proposal_id or not title:
            raise Exception("proposal_id and title are required")
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
(an integer 0-100), and a concise reasoning sentence. The verdict must follow
logically from weighing the arguments against governance risk."""

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
                       f"Consensus {agreement}% -- {reasoning}", "cast_cognitive_vote")
        return reasoning

    @gl.public.write
    def record_ruling(self, proposal_id: str, verdict: str, rationale: str) -> None:
        title = proposal_id
        if proposal_id in self.proposals:
            p = json.loads(self.proposals[proposal_id])
            title = p["title"]
        self._remember("ruling", proposal_id, title, verdict, rationale, "record_ruling")

    @gl.public.write
    def open_dispute(self, dispute_id: str, proposal_id: str, reason: str) -> None:
        self.disputes[dispute_id] = json.dumps({
            "id": dispute_id, "proposal_id": proposal_id, "reason": reason,
            "status": "Filed", "outcome": "",
        })
        if proposal_id in self.proposals:
            p = json.loads(self.proposals[proposal_id])
            p["status"] = "Disputed"
            self.proposals[proposal_id] = json.dumps(p)
        self._remember("dispute", proposal_id, "Dispute filed", "Escalated", reason, "open_dispute")

    @gl.public.write
    def resolve_dispute(self, dispute_id: str) -> str:
        if dispute_id not in self.disputes:
            raise Exception("unknown dispute")
        d = json.loads(self.disputes[dispute_id])
        reason = d["reason"]
        proposal_id = d["proposal_id"]

        task = f"""Adjudicate a governance dispute on proposal '{proposal_id}'.
Stated reason for dispute: {reason}
Decide whether the original verdict should be Upheld or Overturned.
Respond as strict JSON: {{"outcome": "Upheld|Overturned", "reasoning": "<one sentence>"}}"""
        criteria = "Strict JSON with keys outcome (Upheld|Overturned) and reasoning."

        result = gl.eq_principle.prompt_non_comparative(
            lambda: reason, task=task, criteria=criteria,
        )
        outcome, reasoning = self._parse_outcome(result)
        d["status"] = "Resolved"
        d["outcome"] = outcome
        self.disputes[dispute_id] = json.dumps(d)
        self._remember("dispute", proposal_id, "Dispute resolved", "Escalated",
                       f"{outcome} -- {reasoning}", "resolve_dispute")
        return outcome

    @gl.public.write
    def finalize_execution(self, proposal_id: str) -> None:
        if proposal_id not in self.proposals:
            raise Exception("unknown proposal")
        p = json.loads(self.proposals[proposal_id])
        if p["status"] not in ("Validated", "GenLayer_Validation"):
            raise Exception("proposal not eligible")
        p["status"] = "Treasury_Released"
        self.proposals[proposal_id] = json.dumps(p)
        self.treasury_released = u256(int(self.treasury_released) + int(p["amount"]))
        self._remember("ruling", proposal_id, p["title"], "Approved", "Treasury released.", "finalize_execution")

    @gl.public.write
    def update_reputation(self, address: str, new_score: int, reason: str) -> None:
        rep = json.dumps({"address": address, "score": new_score, "reason": reason})
        self.reputation[address] = rep
        self._remember("precedent", "", "Reputation updated", "",
                       f"{address} -> {new_score} ({reason})", "update_reputation")

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
    def get_memory_timeline(self) -> list:
        return [json.loads(v) for v in self.memory.values()]

    @gl.public.view
    def get_reputation(self, address: str) -> dict:
        if address not in self.reputation:
            return {}
        return json.loads(self.reputation[address])

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
console.log("deploying final full CLAORegistry...");
const txId = await client.deployContract({ code, args: ["dao-01", "Bradbury Alpha DAO", "2,450,000 USD"] });
const receipt = await client.waitForTransactionReceipt({ hash: txId, status: "FINALIZED", interval: 3000, retries: 30 });
const exec = receipt?.consensus_data?.leader_receipt?.[0]?.execution_result;
console.log("execution_result:", exec);
console.log("result:", JSON.stringify(receipt?.consensus_data?.leader_receipt?.[0]?.result));
if (exec === "SUCCESS") console.log("address:", receipt?.data?.contract_address);
