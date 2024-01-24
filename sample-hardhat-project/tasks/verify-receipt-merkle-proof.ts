import { RLP } from '@ethereumjs/rlp'
import { Trie } from '@ethereumjs/trie'
import { task } from 'hardhat/config'

task('verify-receipt-merkle-proof', 'Verify a receipt merkle proof')
  .addPositionalParam('txHash')
  .addPositionalParam('proof')
  .addPositionalParam('receiptTrieRoot')
  .setAction(async (taskArgs, hre) => {
    const { ethers } = hre
    const { proof, receiptTrieRoot, txHash } = taskArgs

    const transaction = await ethers.provider.getTransaction(txHash)

    if (transaction && transaction.blockHash) {
      const prefetchTxs = true
      const block = await ethers.provider.getBlock(
        transaction.blockHash,
        prefetchTxs
      )

      if (block) {
        const txIndex = block?.prefetchedTransactions.findIndex(
          (tx) => tx.hash === txHash
        )
        const key = Buffer.from(RLP.encode(txIndex))

        const receiptTrieRootAsBuffer = Buffer.from(
          receiptTrieRoot.slice(2),
          'hex'
        )

        const proofBufferArray = [Buffer.from(proof.slice(2), 'hex')]

        const trie = new Trie()

        try {
          await trie.verifyProof(receiptTrieRootAsBuffer, key, proofBufferArray)
          console.log('✅ Merkle proof has been verified')
        } catch (error) {
          console.log('❌ Merkle proof is invalid!')
        }
      }
    }
  })
