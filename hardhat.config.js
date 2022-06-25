require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();
const projectId = process.env.PROJECT_ID;
const privateKey = process.env.PRIVATE_KEY;
const polygonscanApiKey = process.env.POLYGONSCAN_API_KEY;

module.exports = {
  networks: {
    hardhat: {
      chainId: 1337,
    },
    mumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${projectId}`,
      accounts: [privateKey],
    },
    mainnet: {
      url: `https://polygon-mainnet.infura.io/v3/${projectId}`,
      accounts: [privateKey],
    },
  },
  etherscan: {
    apiKey: polygonscanApiKey,
  },
  solidity: "0.8.4",
};
