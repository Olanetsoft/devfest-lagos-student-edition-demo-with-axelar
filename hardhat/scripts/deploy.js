const hre = require("hardhat");

async function main() {
  const Bounty = await hre.ethers.deployContract("Bounty", [
    "0xC249632c2D40b9001FE907806902f63038B737Ab",
    "0xbE406F0189A0B4cf3A05C286473D23791Dd44Cc6",
  ]);

  await Bounty.waitForDeployment();

  console.log(`Bounty contract deployed to ${await Bounty.getAddress()}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// Get the address of Axelar Gateway and Gas Service contracts on testnet here: https://docs.axelar.dev/resources/testnet
// Fantom testnet: 0xC1b3321A34250bfadCfaD824E99Ba80B91CeCDEF
// Avalanche testnet: 0x9AD0A88037CCcf1c736E5a39a9D3704D98691028
