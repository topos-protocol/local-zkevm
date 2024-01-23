import { Block, hexlify, JsonRpcProvider, TransactionResponse } from 'ethers'
import { RLP } from '@ethereumjs/rlp'
import { Trie } from '@ethereumjs/trie'

/// Generate a Merkle Patricia Tree proof for a transaction
/// @param tx Transaction to generate the proof for
/// @param provider Provider to use to fetch the block
export async function generateReceiptMptProof(
  tx: TransactionResponse,
  provider: JsonRpcProvider
) {
  const prefetchTxs = true
  const block = await provider.getBlock(tx.blockHash!, prefetchTxs)
  const rawBlock = await (provider as any).send('eth_getBlockByHash', [
    tx.blockHash,
    prefetchTxs,
  ])

  const receiptsRoot = rawBlock.receiptsRoot
  const trie = await createReceiptMpt(block!)
  const trieRoot = trie.root()
  if ('0x' + trieRoot.toString('hex') !== receiptsRoot) {
    throw new Error(
      `Block receipts root does not match trie root
       trieRoot: "0x${trieRoot.toString('hex')}"
       receiptsRoot: "${receiptsRoot}"`
    )
  }

  const indexOfTx = block!.prefetchedTransactions.findIndex(
    (_tx) => _tx.hash === tx.hash
  )
  const key = Buffer.from(RLP.encode(indexOfTx))

  const { stack: _stack } = await trie.findPath(key)
  const stack = _stack.map((node) => node.raw())
  const proofBlob = hexlify(RLP.encode([1, indexOfTx, stack]))
  return { proofBlob, receiptsRoot }
}

/// Create a Merkle Patricia Tree for a block's receipts
/// @param block Block to create the trie for
async function createReceiptMpt(block: Block) {
  const trie = new Trie()
  await Promise.all(
    block.prefetchedTransactions.map(async (tx, index) => {
      const receipt = await tx.wait()
      const { cumulativeGasUsed, logs, logsBloom, type, status } = receipt!

      const key = Buffer.from(RLP.encode(index))
      const value = Buffer.from(
        RLP.encode([
          status,
          Number(cumulativeGasUsed),
          logsBloom,
          logs.map((l) => [l.address, l.topics as string[], l.data]),
        ])
      )

      if (type === 0) {
        trie.put(key, value)
      } else {
        const buf = Buffer.concat([
          Buffer.from([type]),
          RLP.encode([
            status,
            Number(cumulativeGasUsed),
            logsBloom,
            logs.map((l) => [l.address, l.topics as string[], l.data]),
          ]),
        ])
        trie.put(key, buf)
      }
    })
  )
  return trie
}
