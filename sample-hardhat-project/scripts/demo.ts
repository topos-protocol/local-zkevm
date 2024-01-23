import axios from 'axios'
import { Block, JsonRpcProvider } from 'ethers'
import { ethers } from 'hardhat'
import { generateReceiptMptProof } from './generate_merkle_proof'

const jerigonProvider = new JsonRpcProvider('http://127.0.0.1:8546')
const zeroBinAPI = axios.create({ baseURL: 'http://127.0.0.1:8080' })

async function deployMcdo() {
  const mcdo = await ethers.deployContract('Mcdo', { gasLimit: 4_000_000 })
  return mcdo.waitForDeployment()
}

function getTrace(blockNumber: string) {
  return jerigonProvider.send('debug_traceBlockByNumber', [
    blockNumber,
    { tracer: 'zeroTracer' },
  ])
}

// Block start is excluded from the transition
async function prove(blockStart: Block, blockEnd: Block) {
  console.log(
    `State transition from block ${blockStart.number} excluded to ${blockEnd.number} included`
  )

  const trace = await getTrace(blockEnd.number.toString())
  const trace_json = JSON.stringify(trace)

  console.log(
    `Trace for block ${blockEnd.number}: ${JSON.stringify(trace_json)}`
  )

  try {
    const rawResponse = await zeroBinAPI.post('prove', trace_json)
  } catch (error) {
    console.error(error)
  }

  // TODO: Replace the dummy proof by the real one
  //
  // Failed to deserialize the JSON body into the target type:
  // [0]: missing field `trie_pre_images` at line 1 column 6676

  // const proof = await rawResponse.json();
  // console.log(proof);
  // return proof;

  return '0xgreatproof'
}

async function getState() {
  const blockNumber = 'latest'
  const transactionDetailFlag = false

  return jerigonProvider.send('eth_getBlockByNumber', [
    blockNumber,
    transactionDetailFlag,
  ])
}

async function main() {
  const mcdo = await deployMcdo()
  console.log('Contract deployed at:', await mcdo.getAddress())
  console.log(
    'Deployment transaction:',
    await mcdo
      .deploymentTransaction()
      ?.getTransaction()
      .then((txResponse) => txResponse?.hash)
  )

  const revealed_ketchup_quantity = 6
  const hidden_mustard_quantity = 3

  // zkit.start(); // (UX brainstorming)
  //const state_before = await getState()

  // First transaction
  const ketchup_tx = await mcdo.setIngredient(
    'sugar',
    'usa',
    revealed_ketchup_quantity,
    { gasLimit: 4_000_000 }
  )
  await ketchup_tx.wait()
  console.log(`\n\nKetchup transaction: ${ketchup_tx.hash}`)
  const tx1 = await jerigonProvider.getTransaction(ketchup_tx.hash)
  console.log(`ketchup trace: ${JSON.stringify(tx1)}`)

  // Second transaction
  const mustard_tx = await mcdo.setIngredient(
    'mustard',
    'dijon',
    hidden_mustard_quantity,
    { gasLimit: 4_000_000 }
  )
  await mustard_tx.wait()
  console.log(`\n\nMustard transaction: ${mustard_tx.hash}`)
  const tx2 = await jerigonProvider.getTransaction(mustard_tx.hash)
  console.log(`mustard trace: ${JSON.stringify(tx2)}`)

  const { proofBlob, receiptsRoot } = await generateReceiptMptProof(tx1!, jerigonProvider)
  console.log(`\n\nKetchup transaction`)
  console.log(`Merkle proof: ${JSON.stringify(proofBlob, null, 2)}`)
  console.log(`Receipts root: ${JSON.stringify(receiptsRoot, null, 2)}`)

  const { proofBlob: proofBlob2, receiptsRoot: receiptsRoot2 } = await generateReceiptMptProof(tx2!, jerigonProvider)
  console.log(`\n\nMustard transaction`)
  console.log(`Merkle proof: ${JSON.stringify(proofBlob2, null, 2)}`)
  console.log(`Receipts root: ${JSON.stringify(receiptsRoot2, null, 2)}`)

  // zkit.pause(); // (UX brainstorming)
  //const state_after = await getState()

  //
  // Create the state transition proof
  //
  //const proof = await prove(state_before, state_after)
  //console.log(`Final proof: ${proof}`)

  // (proof, transition_digest) = zkit.get_proof(); // (UX brainstorming)
  // merkle_proof = transition_digest.contains(sugar_tx); // (UX brainstorming)
  // assert!(verify(proof, resulting_state_root,)) // (UX brainstorming)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
