import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const pk = "0x510d7d3ccebaac29eade2199908e713a659dffa61777a95bf1ddda93d7e83519";
const acc = createAccount(pk);
const client = createClient({ chain: studionet, account: acc });

const code = `# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *
import json


class LLMTest(gl.Contract):
    dao_name: str
    proposals: TreeMap[str, str]

    def __init__(self, dao_name: str) -> None:
        self.dao_name = dao_name

    @gl.public.write
    def cast_vote(self, proposal_id: str, for_args: str, against_args: str) -> str:
        if proposal_id not in self.proposals:
            raise Exception("unknown proposal")
        p = json.loads(self.proposals[proposal_id])
        title = p["title"]

        task = f"""You are a validator in the Cognitive Branch of '{self.dao_name}'.
Adjudicate proposal '{title}'.
Arguments FOR: {for_args}
Arguments AGAINST: {against_args}
Respond as strict JSON: {{"verdict": "Approved|Rejected", "agreement": 75, "reasoning": "one sentence"}}"""

        criteria = "A valid response is strict JSON with keys verdict, agreement (int 0-100), and reasoning."

        result = gl.eq_principle.prompt_non_comparative(
            lambda: f"FOR: {for_args}, AGAINST: {against_args}",
            task=task,
            criteria=criteria,
        )
        return result

    @gl.public.write
    def add_proposal(self, pid: str, title: str) -> None:
        self.proposals[pid] = json.dumps({"id": pid, "title": title})

    @gl.public.view
    def get_name(self) -> str:
        return self.dao_name
`;

console.log("deploying eq_principle test...");
const txId = await client.deployContract({ code, args: ["Test DAO"] });
const receipt = await client.waitForTransactionReceipt({ hash: txId, status: "FINALIZED", interval: 3000, retries: 30 });
const exec = receipt?.consensus_data?.leader_receipt?.[0]?.execution_result;
console.log("execution_result:", exec);
console.log("result:", JSON.stringify(receipt?.consensus_data?.leader_receipt?.[0]?.result));
if (exec === "SUCCESS") console.log("address:", receipt?.data?.contract_address);
