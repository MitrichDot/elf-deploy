import "@nomiclabs/hardhat-waffle";
import "hardhat-typechain";
import "solidity-coverage";
import "@nomiclabs/hardhat-etherscan";

import { HardhatUserConfig } from "hardhat/config";

const ALCHEMY_KEY = process.env.ALCHEMY_KEY || '';
const DEPLOYER_PRIVATE_KEY =
  process.env.DEPLOYER_PRIVATE_KEY || '0000000000000000000000000000000000000000000000000000000000000000';

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  solidity: {
    compilers: [
      {
        version: "0.7.1",
        settings: {
          optimizer: {
            enabled: true,
            runs: 10000,
          },
        },
      },
      {
        version: "0.8.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 7500,
          },
        },
      },
    ],
    overrides: {
      "contracts/balancer-core-v2/vault/Vault.sol": {
        version: "0.7.1",
        settings: {
          optimizer: {
            enabled: true,
            runs: 400,
          },
        },
      },
      "contracts/balancer-core-v2/pools/weighted/WeightedPoolFactory.sol": {
        version: "0.7.1",
        settings: {
          optimizer: {
            enabled: true,
            runs: 800,
          },
        },
      },
    },
  },
  mocha: { timeout: 0 },
  networks: {
    hardhat: {
      forking: {
        url:
          "https://eth-mainnet.alchemyapi.io/v2/kwjMP-X-Vajdk1ItCfU-56Uaq1wwhamK",
        blockNumber: 11853372,
      },
      accounts: {
        accountsBalance: "100000000000000000000000", // 100000 ETH
        count: 5,
      },
    },
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_KEY}`,
      accounts: [
        `0x${DEPLOYER_PRIVATE_KEY}`
      ],
    },
    mainnet: {
      url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`,
      accounts: [
        `0x${DEPLOYER_PRIVATE_KEY}`
      ],
    },
  },
  etherscan: {
    apiKey: "Z73GWKPFXX87ENVY9KK9DK7NJS4ZYA7JM2"
  }
};

export default config;
