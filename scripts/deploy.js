const hre = require("hardhat");

async function main() {
  const NFT = await hre.ethers.getContractFactory("NFT");
  const nft = await NFT.deploy();

  await nft.deployed();

  console.log("NFT deployed to:", nft.address);

  const CampaignHandler = await hre.ethers.getContractFactory(
    "CampaignHandler"
  );
  const campaignHandler = await CampaignHandler.deploy(nft.address);

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
