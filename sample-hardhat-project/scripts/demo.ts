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

  const revealed_ketchup_quantity = 6
  const hidden_mustard_quantity = 3

  // First transaction
  const ketchup_tx = await mcdo.setIngredient(
    'sugar',
    'usa',
    revealed_ketchup_quantity,
    { gasLimit: 4_000_000 }
  )
  await ketchup_tx.wait()
  console.log(`\n\nKetchup transaction: ${ketchup_tx.hash}`)

  // Second transaction
  const mustard_tx = await mcdo.setIngredient(
    'mustard',
    'dijon',
    hidden_mustard_quantity,
    { gasLimit: 4_000_000 }
  )
  await mustard_tx.wait()
  console.log(`\n\nMustard transaction: ${mustard_tx.hash}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
