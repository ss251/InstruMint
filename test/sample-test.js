//SPDX-License-Identifier: Unlicense

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CampaignHandler", function () {
  it("Should create a new campaign", async function () {
    const CampaignHandler = await ethers.getContractFactory("CampaignHandler");
    const campaignHandler = await CampaignHandler.deploy();
    await campaignHandler.deployed();

    const goal = 1000000;

    expect(await campaignHandler.newCampaign(goal, "Sound Pack 1", "The sound of silence")).to.emit(campaignHandler, "LogNewCampaign");
    console.log(await campaignHandler.listActive());
  });
  
});
