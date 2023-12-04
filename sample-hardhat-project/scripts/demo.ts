import axios from 'axios'
import { Block, JsonRpcProvider } from 'ethers'
import { ethers } from 'hardhat'

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

  const revealed_ketchup_quantity = 6
  const hidden_mustard_quantity = 3

  // zkit.start(); // (UX brainstorming)
  const state_before = await getState()

  // First transaction
  const sugar_tx = await mcdo.setIngredient(
    'sugar',
    'usa',
    revealed_ketchup_quantity,
    { gasLimit: 4_000_000 }
  )
  console.log(`Ketchup transaction: ${sugar_tx.hash}`)

  // Second transaction
  const mustard_tx = await mcdo.setIngredient(
    'mustard',
    'dijon',
    hidden_mustard_quantity,
    { gasLimit: 4_000_000 }
  )
  console.log(`Mustard transaction: ${mustard_tx.hash}`)

  // zkit.pause(); // (UX brainstorming)
  const state_after = await getState()

  //
  // Create the state transition proof
  //
  const proof = await prove(state_before, state_after)
  console.log(`Final proof: ${proof}`)

  // (proof, transition_digest) = zkit.get_proof(); // (UX brainstorming)
  // merkle_proof = transition_digest.contains(sugar_tx); // (UX brainstorming)
  // assert!(verify(proof, resulting_state_root,)) // (UX brainstorming)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
