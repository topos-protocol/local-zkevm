import { task } from 'hardhat/config'

task(
  'get-receipt-trie-root',
  'Get a block receipt trie root from a block number'
)
  .addPositionalParam('blockNumber')
  .setAction(async (taskArgs, hre) => {
    const { ethers } = hre
    const { blockNumber } = taskArgs
    const block = await ethers.provider.send('eth_getBlockByNumber', [
      blockNumber,
      false,
    ])
    console.log(block.receiptsRoot)
  })
