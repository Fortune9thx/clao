import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const pk = "0x510d7d3ccebaac29eade2199908e713a659dffa61777a95bf1ddda93d7e83519";
const acc = createAccount(pk);
const client = createClient({ chain: studionet, account: acc });

const code = `from genlayer import *

class MinimalTest(gl.Contract):
    value: str

    def __init__(self, initial: str) -> None:
        self.value = initial

    @gl.public.write
    def set_value(self, v: str) -> None:
        self.value = v

    @gl.public.view
    def get_value(self) -> str:
        return self.value
`;

console.log("deploying minimal contract...");
const txId = await client.deployContract({ code, args: ["hello"] });
console.log("txId:", txId);

const receipt = await client.waitForTransactionReceipt({ hash: txId, status: "FINALIZED", interval: 3000, retries: 30 });
console.log("execution_result:", receipt?.consensus_data?.leader_receipt?.[0]?.execution_result);
console.log("contract_address:", receipt?.data?.contract_address);
console.log("result:", JSON.stringify(receipt?.consensus_data?.leader_receipt?.[0]?.result));
