const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CampaignHandler", function () {
  it("Should create a campaign, contribute to campaign, close campaign, mint NFT, and withdraw funds to creator", async function () {
    // we need nftAddress for initialization of CampaignHandler contract
    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy();
    const nftAddress = nft.address;

    const Campaign = await ethers.getContractFactory("CampaignHandler");
    const campaign = await Campaign.deploy(nftAddress);
    await campaign.deployed();
    const campaignAddress = campaign.address;

    await campaign.newCampaign(
      2,
      "Drill beat",
      "Open source beat NFT minted upon campaign sucess.",
      "https://bafybeif6jx27diov6osmj4nqgyar45qdfestjnrnhomeud26wxa375rxdm.ipfs.dweb.link/4215"
    );

    let campaignId = await campaign.getCampaignCount();

    // checking for campaign creation
    expect(campaignId.toNumber()).to.equal(1);

    campaignId = campaignId.toNumber() - 1;

    // making 2 contributions
    await campaign.contribute(1, campaignId, {
      value: 1,
    });

    await campaign.contribute(1, campaignId, {
      value: 1,
    });

    // checking if the last contribution successfully closed the campaign
    const activeCampaigns = await campaign.listActive();

    // there should be no active campaigns now
    expect(activeCampaigns.length).to.equal(0);

    /* if this function is successful, it means that the creator is able to mint an NFT only after */
    /* campaign closes. */
    await campaign.mintAndUpdate(
      "https://bafybeif6jx27diov6osmj4nqgyar45qdfestjnrnhomeud26wxa375rxdm.ipfs.dweb.link/4215",
      campaignId
    );

    // withdraw is successful only when a creator has minted their NFT
    await campaign.withdraw(campaignId);
  });
});
