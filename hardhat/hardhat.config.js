require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env" });
require("solidity-coverage");

const PRIVATE_KEY = process.env.PRIVATE_KEY;

// This is a sample Hardhat task. To learn how to create your own go to
// <https://hardhat.org/guides/create-task.html>
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to <https://hardhat.org/config/> to learn more

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  networks: {
    avalanche: {
      url: "https://avalanche-fuji-c-chain.publicnode.com",
      chainId: 43113,
      accounts: [PRIVATE_KEY],
    },
    fantom: {
      url: "https://fantom-testnet.publicnode.com",
      chainId: 4002,
      accounts: [PRIVATE_KEY],
    },
  },
};
