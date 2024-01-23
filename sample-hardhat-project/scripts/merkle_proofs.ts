import { Block, hexlify, JsonRpcProvider, TransactionResponse } from 'ethers'
import { RLP } from '@ethereumjs/rlp'
import { Trie } from '@ethereumjs/trie'

/**
 * Generate a merkle proof for a transaction's receipt
 *
 * @param tx Transaction to generate the proof for
 * @param provider Provider to use to fetch the transaction information
 * @returns The receipt's merkle proof
 */
export async function generateReceiptMptProof(
  tx: TransactionResponse,
  provider: JsonRpcProvider
) {
  const { block, indexOfTx } = await fetchAndFindTransaction(tx, provider)
  const receiptsRoot = await getReceiptRoot(tx.blockHash!, provider)

  const trie = await createReceiptMpt(block!)
  const trieRoot = trie.root()
  if ('0x' + trieRoot.toString('hex') !== receiptsRoot) {
    throw new Error(
      `Block receipts root does not match trie root
       trieRoot: "0x${trieRoot.toString('hex')}"
       receiptsRoot: "${receiptsRoot}"`
    )
  }
  const key = Buffer.from(RLP.encode(indexOfTx))
  const proof = (await trie.createProof(key)).map((p) => hexlify(p)).toString()
  return proof
}

/**
 * Verify a merkle proof for a transaction's receipt
 *
 * @param tx Transaction to verify the proof for
 * @param provider Provider to use to fetch the transaction information
 * @param proof The receipt's merkle proof
 * @returns Whether the proof is valid or not
 */
export async function verifyReceiptMptProof(
  tx: TransactionResponse,
  provider: JsonRpcProvider,
  proof: string
) {
  const { indexOfTx } = await fetchAndFindTransaction(tx, provider)

  const receiptsRoot = await getReceiptRoot(tx.blockHash!, provider)
  const receiptRootBuffer = Buffer.from(receiptsRoot.slice(2), 'hex')

  const key = Buffer.from(RLP.encode(indexOfTx))

  const proofStringArray = proof.split(',')
  const proofBufferArray: Buffer[] = []
  proofStringArray.forEach((p) =>
    proofBufferArray.push(Buffer.from(p.slice(2), 'hex'))
  )

  const trie = new Trie()
  const value = await trie.verifyProof(receiptRootBuffer, key, proofBufferArray)
  return value !== null
}

/**
 * Fetches the block and finds the index of the transaction within the block
 *
 * @param tx - The transaction to find
 * @param provider - Provider to use to fetch the transaction information
 * @returns An object containing the block and the index of the transaction
 */
async function fetchAndFindTransaction(
  tx: TransactionResponse,
  provider: JsonRpcProvider
) {
  const prefetchTxs = true
  const block = await provider.getBlock(tx.blockHash!, prefetchTxs)
  const indexOfTx = block!.prefetchedTransactions.findIndex(
    (_tx) => _tx.hash === tx.hash
  )
  return { block, indexOfTx }
}

/**
 * Get the block's receipts root
 *
 * @param blockHash Hash of the block to get the receipts root for
 * @param provider Provider to use to fetch the transaction information
 * @returns The block's receipts root
 */
export async function getReceiptRoot(blockHash: string, provider: JsonRpcProvider) {
  const rawBlock = await provider.send('eth_getBlockByHash', [blockHash, true])
  return rawBlock.receiptsRoot
}

/**
 * Create a Merkle Patricia Tree for a block's receipts
 *
 * @param block Block to create the trie for
 * @returns The block's Merkle Patricia Trie
 */
async function createReceiptMpt(block: Block) {
  const trie = new Trie()
  await Promise.all(
    block.prefetchedTransactions.map(async (tx, index) => {
      const receipt = await tx.wait()
      const { cumulativeGasUsed, logs, logsBloom, type, status } = receipt!

      const key = Buffer.from(RLP.encode(index))
      const value = RLP.encode([
        status,
        Number(cumulativeGasUsed),
        logsBloom,
        logs.map((l) => [l.address, l.topics as string[], l.data]),
      ])

      if (type === 0) {
        trie.put(key, Buffer.from(value))
      } else {
        const buf = Buffer.concat([Buffer.from([type]), value])
        trie.put(key, buf)
      }
    })
  )
  return trie
}
