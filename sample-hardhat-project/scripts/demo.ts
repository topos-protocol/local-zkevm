import { ethers } from 'hardhat'

async function deployMcdo() {
  const mcdo = await ethers.deployContract('Mcdo', { gasLimit: 4_000_000 })
  return mcdo.waitForDeployment()
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

  const revealedKetchupQuantity = 6
  const hiddenMustardQuantity = 3

  // First transaction
  const ketchupTx = await mcdo.setIngredient(
    'sugar',
    'usa',
    revealedKetchupQuantity,
    { gasLimit: 4_000_000 }
  )
  await ketchupTx.wait()
  console.log(`Ketchup transaction: ${ketchupTx.hash}`)

  // Second transaction
  const mustardTx = await mcdo.setIngredient(
    'mustard',
    'dijon',
    hiddenMustardQuantity,
    { gasLimit: 4_000_000 }
  )
  const mustardReceipt = await mustardTx.wait()
  console.log(`Mustard transaction: ${mustardTx.hash}`)

  console.log(`\nBlock number: ${mustardReceipt?.blockNumber}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
