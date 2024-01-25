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

  const signers = await ethers.getSigners()
  const nonce = await ethers.provider.getTransactionCount(signers[0])

  // First transaction
  mcdo
    .setIngredient('sugar', 'usa', revealedKetchupQuantity, {
      gasLimit: 4_000_000,
      nonce,
    })
    .then(async (tx) => {
      const receipt = await tx.wait()
      console.log(
        `Ketchup transaction: ${tx.hash} (inserted in block ${receipt?.blockNumber})`
      )
    })

  // Second transaction
  mcdo
    .setIngredient('mustard', 'dijon', hiddenMustardQuantity, {
      gasLimit: 4_000_000,
      nonce: nonce + 1,
    })
    .then(async (tx) => {
      const receipt = await tx.wait()
      console.log(
        `Mustard transaction: ${tx.hash} (inserted in block ${receipt?.blockNumber})`
      )
    })
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
