import {
    Contract,
    ContractFactory,
    ContractTransaction,
    Wallet,
    providers,
    utils,
} from 'ethers'


import mcdoJSON from '../artifacts/contracts/Mcdo.sol/Mcdo.json'

async function initState() {
    // Initial state
    let dev1_pk = "26e86e45f6fc45ec6e2ecd128cec80fa1d1505e5507dcd2ae58c3130a7a97b48";
    let dev2_pk = "45a915e4d060149eb4365960e6a7a45f334393093061116b197e3240065ff2d8";
    let dev3_pk = "59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";

    let endpoint = "http://127.0.0.1:8545";
    const provider = new providers.JsonRpcProvider(endpoint)

    const myWallet = new Wallet(dev3_pk, provider)

    const mcdoContractFactory = new ContractFactory(
        mcdoJSON.abi,
        mcdoJSON.bytecode,
        myWallet
    );

    const mcdo = await mcdoContractFactory.connect(myWallet).deploy(3);

    // Wait for the contract to be deployed and get the deployed address
    await mcdo.deployed();
    console.log('Contract deployed to:', mcdo.address);
    //return mcdo
}

async function main() {
    //const mcdo = await initState();
    await initState();

    console.log('', mcdo.address);
    // My burgers are respecting the norms, not too much sugar
    // and no usage of chemicals without revealing my secret ingredients
    const sugar = 6; // Grams of sugar in the big mac (the biggy sauce)
    const mustard = 3; // I don't want to reveal my mustard

    // zkit.pause(); // (UX brainstorming)
    const state_after = await getState();

    //
    // Create the state transition proof
    //

    // (proof, resulting_state_root) = computeProof(state_n1, [tx1, tx2])
    // assert!(verify(proof, resulting_state_root, ))

    //hre.tracer.enabled = false;
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
