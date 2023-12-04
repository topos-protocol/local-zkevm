import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'

const config: HardhatUserConfig = {
  defaultNetwork: 'erigon',
  networks: {
    erigon: {
      url: 'http://127.0.0.1:8545',
      accounts: [
        '0x26e86e45f6fc45ec6e2ecd128cec80fa1d1505e5507dcd2ae58c3130a7a97b48',
      ],
    },
  },
  solidity: '0.8.19',
}

export default config
