const hre = require("hardhat");

async function main() {
    const CampaignHandler = await hre.ethers.getContractFactory("CampaignHandler");
    const campaignHandler = await CampaignHandler.deploy();

  await campaignHandler.deployed();

  console.log("CampaignHandler deployed to:", campaignHandler.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });