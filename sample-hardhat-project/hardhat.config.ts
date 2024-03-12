import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'

const config: HardhatUserConfig = {
  defaultNetwork: 'erigon',
  networks: {
    erigon: {
      url: 'http://127.0.0.1:22000',
      accounts: [
        '0xca3a6f8b83ed5876201605ae8507490d0a0205c0748e6376ed9661c9fecb98d7',
      ],
    },
  },
  solidity: '0.8.19',
}

export default config
