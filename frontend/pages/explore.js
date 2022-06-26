import React, { useEffect, useState } from "react";
import { useMoralis, useMoralisWeb3Api } from "react-moralis";
import { MoralisProvider } from "react-moralis";
import Moralis from "moralis";
import axios from "axios";
import { create as ipfsHttpClient } from "ipfs-http-client";
import CampaignHandler from "../utils/CampaignHandler.json";

const API_ID = process.env.NEXT_PUBLIC_MORALIS_APP_ID;
const SERVER_URL = process.env.NEXT_PUBLIC_MORALIS_SERVER_URL;

import { nftAddress, campaignHandlerAddress } from "../config";
import { create } from "ipfs-http-client";
import CampaignCard from "../components/CampaignCard";

const ethers = Moralis.web3Library;

// const projectId = "2B3vjaKKVpRqv8a6IZeS5CyPkwg";
// const projectSecret = "cb0b062f98aa8c0fd5451253b537d257";
// const auth =
//   "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

// const client = create({
//   host: "ipfs.infura.io",
//   port: 5001,
//   protocol: "https",
//   headers: {
//     authorization: auth,
//   },
// });

export default function Explore() {
  const { isAuthenticated, user } = useMoralis();
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

    // const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
    // const data = await marketContract.fetchMyNFTs();

    // const items = await Promise.all(
    //   data.map(async (i) => {
    //     const tokenUri = await tokenContract.tokenURI(i.tokenId);
    //     const meta = await axios.get(tokenUri);
    //     let price = ethers.utils.formatUnits(i.price.toString(), "ether");
    //     let item = {
    //       price,
    //       tokenId: i.tokenId.toNumber(),
    //       seller: i.seller,
    //       owner: i.owner,
    //       image: meta.data.image,
    //     };
    //     return item;
    //   })
    // );
    // setNFTs(items);
    // setLoadingState("loaded");

    for (let i = 0; i < campaignCount; i++) {
      campaign = await campaignContract.campaigns(i);
      let copy = [...campaigns];
      copy.push(campaign);
      if (campaign !== campaigns[campaigns.length]) {
        setCampaigns(copy);
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

  useEffect(() => {
    fetchAllCampaigns();
  }, []);

  async function fetchContentMetadata(CID, index) {
    const response = await fetch(`https://ipfs.io/ipfs/${CID}`);
    const copy = [...content];
    copy[index] = await response.json();
    setContent(copy);
  }

  return (
    <>
      <MoralisProvider appId={API_ID} serverUrl={SERVER_URL}>
        <div className="flex flex-row sm:h-[100vh] md:h-[100vh] h-screen bg-transparent">
          {loadingState === "loaded" &&
            campaigns.map((campaign, i) => (
              <CampaignCard campaign={campaign} content={content[i]} key={i} />
            ))}
        </div>
      </MoralisProvider>
    </>
  );
}
