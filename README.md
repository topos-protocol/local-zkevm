<div id="top"></div>
<br />
<div align="center">
<p align="center">
Local zkEVM to give zk capabilities in your solidity contract development
</p>
</div>

<br />

</div>

## Getting Started

First, let's run the backend composed of the local chain.

```sh
docker compose up -d
```

Then, you can compile the sample contract and run the demo script:

```sh
cd sample-hardhat-project
npm run build
npm run demo
```

You should observe the following logs:

```
> demo
> ts-node scripts/demo.ts

Contract deployed at: 0xFF8d8e0445C6C51d2C895d6e98587D0D5ea82a05

Ketchup transaction: 0x555db1c88076b4346a572331836202e160890d745ec8a30c9b6fd05250f0bf13
Mustard transaction: 0xf577cdc146459bb4e8cc8fa5c581cd61065e5b8b95a1412e2b1a54f94ace48f3

State transition from block 0x4f excluded to 0x50 included

Trace for block 0x50: "[{\"result\":{\"traces\":{\"0x67b1d87101671b127f5f8714789c7192f7ad340e\":{\"balance\":\"0x21e19da19dd97c4d061\",\"nonce\":\"0x50\"},\"0xff8d8e0445c6c51d2c895d6e98587d0d5ea82a05\":{\"storage_read\":[\"0x0000000000000000000000000000000000000000000000000000000000000000\",\"0x9a755b0b9659f028b4092cfb092ad7428b93d32985ec68be7d7cda0711b28ae5\",\"0x9a755b0b9659f028b4092cfb092ad7428b93d32985ec68be7d7cda0711b28ae6\"],\"storage_written\":{\"0x9a755b0b9659f028b4092cfb092ad7428b93d32985ec68be7d7cda0711b28ae5\":\"0x7573610000000000000000000000000000000000000000000000000000000006\",\"0x9a755b0b9659f028b4092cfb092ad7428b93d32985ec68be7d7cda0711b28ae6\":\"0x6\"},\"code_usage\":{\"read\":\"0x03ea57b5f0a16075796702637292326c00e6f5aacecd131da66fa8a4ae5b3c89\"}}},\"meta\":{\"byte_code\":\"0x02f901528205394f8459682f008459696c94833d090094ff8d8e0445c6c51d2c895d6e98587d0d5ea82a0580b8e44b71571f000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000005737567617200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000037573610000000000000000000000000000000000000000000000000000000000c001a037f082f2ea91d1504e9bb65be8b6f728919f3e1571421136629a20bd37a1390aa03b97f214a0d472c3e4d0b81fd63aba8133e837832d753f90290cb5c9656e6660\",\"new_txn_trie_node_byte\":\"0x02f901528205394f8459682f008459696c94833d090094ff8d8e0445c6c51d2c895d6e98587d0d5ea82a0580b8e44b71571f000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000005737567617200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000037573610000000000000000000000000000000000000000000000000000000000c001a037f082f2ea91d1504e9bb65be8b6f728919f3e1571421136629a20bd37a1390aa03b97f214a0d472c3e4d0b81fd63aba8133e837832d753f90290cb5c9656e6660\",\"new_receipt_trie_node_byte\":\"0xf90109018301155cb9010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c0\",\"gas_used\":71004}}},{\"block_witness\":{\"combined\":{}}}]"

Final proof: 0xgreatproof
```


Then, you can shutdown the backend with:

```
docker compose down -v
```

## Backend

- The chain is purely local
- The backend is composed of two nodes connected to each other: one `erigon` and one `jerigon`
- The block producer is the `erigon` node
- The prover `zero-bin` is running and listening for the traces produced by `jerigon`

The reason behind having these two nodes is due to one bug on `jerigon` where transactions get stuck in the txpool.
Consequently for now, we rely on `erigon` to produce the blocks, and `jerigon` to expose the traces.
