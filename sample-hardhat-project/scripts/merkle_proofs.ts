import { Block, hexlify, JsonRpcProvider, TransactionResponse } from 'ethers'
import { RLP } from '@ethereumjs/rlp'
import { Trie } from '@ethereumjs/trie'

/// Generate a Merkle Patricia Tree proof for a transaction
/// @param tx Transaction to generate the proof for
/// @param provider Provider to use to fetch the block
/// @throws If the block's receipts root does not match the trie root
/// @returns The transaction's Merkle Patricia Trie proof
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
  const proof = await trie.createProof(key)
  const proofStringArray = proof.map((p) => hexlify(p))
  return proofStringArray
}

/// Verify a Merkle Patricia Tree proof for a transaction
/// @param tx Transaction to verify the proof for
/// @param provider Provider to use to fetch the block
/// @param proof Proof to verify
/// @returns Whether the proof is valid
export async function verifyReceiptMptProof(
  tx: TransactionResponse,
  provider: JsonRpcProvider,
  proof: string[]
) {
  const prefetchTxs = true
  const block = await provider.getBlock(tx.blockHash!, prefetchTxs)
  const indexOfTx = block!.prefetchedTransactions.findIndex(
    (_tx) => _tx.hash === tx.hash
  )
  const rawBlock = await (provider as any).send('eth_getBlockByHash', [
    tx.blockHash,
    prefetchTxs,
  ])

  const receiptsRoot = rawBlock.receiptsRoot
  const receiptRootBuffer = Buffer.from(receiptsRoot.slice(2), 'hex')
  const key = Buffer.from(RLP.encode(indexOfTx))
  let proofBufferArray: Buffer[] = []
  proof.forEach((p) => proofBufferArray.push(Buffer.from(p.slice(2), 'hex')))

  const trie = new Trie()
  const value = await trie.verifyProof(receiptRootBuffer, key, proofBufferArray)
  if (value === null) {
    return false
  }
  return true
}

/// Create a Merkle Patricia Tree for a block's receipts
/// @param block Block to create the trie for
/// @returns The receipt's Merkle Patricia Trie
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
