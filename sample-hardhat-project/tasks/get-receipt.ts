import { task } from 'hardhat/config'

task('get-receipt', 'Get a transaction receipt from a transaction hash')
  .addPositionalParam('txHash')
  .setAction(async (taskArgs, hre) => {
    const { ethers } = hre
    const { txHash } = taskArgs
    const receipt = await ethers.provider.getTransactionReceipt(txHash)
    console.log(receipt)
  })
