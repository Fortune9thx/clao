import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const pk = "0x510d7d3ccebaac29eade2199908e713a659dffa61777a95bf1ddda93d7e83519";
const acc = createAccount(pk);
const client = createClient({ chain: studionet, account: acc });

// Test: eq_principle + tuple-unpacking private helpers
const code = `# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *
import json


class ParseTest(gl.Contract):
    dao_name: str
    proposals: TreeMap[str, str]

    def __init__(self, dao_name: str) -> None:
        self.dao_name = dao_name

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
    def cast_vote(self, for_args: str, against_args: str) -> str:
        task = f"Vote FOR: {for_args} AGAINST: {against_args}. JSON: {{\\"verdict\\": \\"Approved|Rejected\\", \\"agreement\\": 75, \\"reasoning\\": \\"ok\\"}}"
        criteria = "Valid JSON with verdict, agreement (0-100), reasoning."
        result = gl.eq_principle.prompt_non_comparative(
            lambda: f"FOR: {for_args}, AGAINST: {against_args}",
            task=task,
            criteria=criteria,
        )
        verdict, agreement, reasoning = self._parse_verdict(result)
        return reasoning

    @gl.public.view
    def get_name(self) -> str:
        return self.dao_name
`;

console.log("deploying parse-helpers test...");
const txId = await client.deployContract({ code, args: ["TestDAO"] });
const receipt = await client.waitForTransactionReceipt({ hash: txId, status: "FINALIZED", interval: 3000, retries: 30 });
const exec = receipt?.consensus_data?.leader_receipt?.[0]?.execution_result;
console.log("execution_result:", exec);
console.log("result:", JSON.stringify(receipt?.consensus_data?.leader_receipt?.[0]?.result));
if (exec === "SUCCESS") console.log("address:", receipt?.data?.contract_address);
