import React, { useEffect, useState } from "react";
import Moralis from "moralis";
import CampaignHandler from "../utils/CampaignHandler.json";

import { campaignHandlerAddress } from "../config";
import CampaignCard from "../components/CampaignCard";

const ethers = Moralis.web3Library;

export default function Explore() {
  const [campaigns, setCampaigns] = useState([]);
  const [ipfsCID, setIpfsCID] = useState("");
  const [content, setContent] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");

  const fetchAllCampaigns = async () => {
    setLoadingState("not-loaded");
    const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();

    let campaign;

    const CampaignABI = CampaignHandler.abi;
    const campaignContract = new ethers.Contract(
      campaignHandlerAddress,
      CampaignABI,
      signer
    );
    console.log(campaignContract);

    let campaignCount = await campaignContract.getCampaignCount();

    campaignCount = ethers.BigNumber.from(campaignCount).toNumber();

    console.log(campaignCount);

    function timeout(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    for (let i = 0; i < campaignCount; i++) {
      campaign = await campaignContract.campaigns(i);
      if (campaigns.indexOf(campaign) === -1) {
        setCampaigns((campaigns) => [...campaigns, campaign]);
      }

      await fetchContentMetadata(
        campaign.ipfsCID.substring(7, campaign.ipfsCID.length),
        i
      );
      console.log(campaign);
    }

    setIpfsCID(campaign.ipfsCID);
    setLoadingState("loaded");
    console.log(campaign.ipfsCID);
  };

  async function fetchContentMetadata(CID, index) {
    const response = await fetch(`https://ipfs.io/ipfs/${CID}`);
    const json = await response.json();
    setContent((content) => [...content, json]);
  }

  useEffect(() => {
    fetchAllCampaigns();
  }, []);

  return (
    <>
      <div className="bg-black">
        <div className="flex flex-row flex-wrap justify-center">
          {loadingState === "loaded" &&
            campaigns.map((campaign, i) => (
              <CampaignCard campaign={campaign} content={content[i]} key={i} />
            ))}
        </div>
      </div>
    </>
  );
}
