import {
    Contract,
    ContractFactory,
    ContractTransaction,
    Wallet,
    providers,
    utils,
} from 'ethers'


import mcdoJSON from '../artifacts/contracts/Mcdo.sol/Mcdo.json'


async function deployMcdo() {
    const dev_pk = "26e86e45f6fc45ec6e2ecd128cec80fa1d1505e5507dcd2ae58c3130a7a97b48"

    const endpoint = "http://127.0.0.1:8545"; // erigon
    const provider = new providers.JsonRpcProvider(endpoint)

    const myWallet = new Wallet(dev_pk, provider)

    const mcdoContractFactory = new ContractFactory(
        mcdoJSON.abi,
        mcdoJSON.bytecode,
        myWallet
    );

    const mcdo = await mcdoContractFactory.connect(myWallet).deploy();

    // Wait for the contract to be deployed and get the deployed address
    return mcdo.deployed()
}

function getTrace(b: string) {
    const endpoint = "http://127.0.0.1:8546"; // jerigon
    const provider = new providers.JsonRpcProvider(endpoint);

    return provider.send("debug_traceBlockByNumber", [b, { "tracer": "zeroTracer" }])
}

// Block start is excluded from the transition
async function prove(block_start: any, block_end: any) {
    console.log(`State transition from block ${block_start.number} excluded to ${block_end.number} included`);

    const trace = await getTrace(block_end.number);
    const trace_json = JSON.stringify(trace);

    console.log(`Trace for block ${block_end.number}: ${JSON.stringify(trace_json)}`);

    const rawResponse = await fetch('http://localhost:8080/prove', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: trace_json
    });

    // TODO: Replace the dummy proof by the real one
    //
    // Failed to deserialize the JSON body into the target type:
    // [0]: missing field `trie_pre_images` at line 1 column 6676

    // const proof = await rawResponse.json();
    // console.log(proof);
    // return proof;

    return "0xgreatproof"
}

async function getState() {
    const endpoint = "http://localhost:8546";
    const provider = new providers.JsonRpcProvider(endpoint);

    return provider.send("eth_getBlockByNumber", ["latest", false]);
}

async function main() {
    const mcdo = await deployMcdo();
    console.log('Contract deployed at:', mcdo.address);

    const revealed_sugar_quantity = 6;
    const hidden_mustard_quantity = 3;

    // zkit.start(); // (UX brainstorming)
    const state_before = await getState();

    // First transaction
    const sugar_tx = await mcdo.setIngredient(
        "sugar",
        "usa",
        revealed_sugar_quantity,
        { gasLimit: 4_000_000 });
    console.log(`Sugar transaction: ${sugar_tx.hash}`);

    // Second transaction
    const mustard_tx = await mcdo.setIngredient(
        "mustard",
        "dijon",
        hidden_mustard_quantity,
        { gasLimit: 4_000_000 });
    console.log(`Mustard transaction: ${mustard_tx.hash}`);

    // zkit.pause(); // (UX brainstorming)
    const state_after = await getState();

    //
    // Create the state transition proof
    //
    const proof = await prove(state_before, state_after);
    console.log(`Final proof: ${proof}`);

    // (proof, transition_digest) = zkit.get_proof(); // (UX brainstorming)
    // merkle_proof = transition_digest.contains(sugar_tx); // (UX brainstorming)
    // assert!(verify(proof, resulting_state_root,)) // (UX brainstorming)
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
