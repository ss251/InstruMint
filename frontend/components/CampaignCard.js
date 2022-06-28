import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import Moralis from "moralis";
import CampaignHandler from "../utils/CampaignHandler.json";

import { nftAddress, campaignHandlerAddress } from "../config";

const OPENSEA_LINK = `https://testnets.opensea.io/assets/mumbai/${nftAddress}`;

const ethers = Moralis.web3Library;

const useAudio = (url) => {
  const [audio] = useState(new Audio(url));
  const [playing, setPlaying] = useState(false);

  const toggle = () => setPlaying(!playing);

  useEffect(() => {
    playing ? audio.play() : audio.pause();
  }, [playing]);

  useEffect(() => {
    audio.addEventListener("ended", () => setPlaying(false));
    return () => {
      audio.removeEventListener("ended", () => setPlaying(false));
    };
  }, []);

  return [playing, toggle];
};

const CampaignCard = (props) => {
  const campaign = props.campaign;
  const content = props.content;

  const { isAuthenticated } = useMoralis();

  let animation_url = content.animation_url;
  if (animation_url.indexOf("http") === -1) {
    animation_url = `https://ipfs.infura.io/ipfs/${content.animation_url.substring(
      7,
      content.animation_url.length
    )}`;
  }

  let image_url = content.image;
  if (image_url.indexOf("http") === -1) {
    image_url = `https://ipfs.infura.io/ipfs/${content.image.substring(
      7,
      content.image.length
    )}`;
  }

  const [playing, toggle] = useAudio(animation_url);
  const [goal, setGoal] = useState(campaign.goal);
  const [total, setTotal] = useState(campaign.total);
  const isFunded = campaign.isFunded;
  const [tokenURI, setTokenURI] = useState(campaign.tokenURI);
  const [opensea, setOpensea] = useState(OPENSEA_LINK);

  useEffect(() => {
    let campaignHandlerContract;

    const onNewContribution = (sender, amount, campaignId) => {
      console.log("NewContribution", sender, amount, campaignId);
      if (campaignId === campaign.campaignId - ethers.BigNumber.from(1)) {
        setTotal(ethers.BigNumber.from(campaign.total).add(amount));
      }
    };

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    campaignHandlerContract = new ethers.Contract(
      campaignHandlerAddress,
      CampaignHandler.abi,
      signer
    );
    campaignHandlerContract.on("LogContribute", onNewContribution);
  }, [campaign.campaignId]);

  useEffect(() => {
    fetchTokenURI();
  }, []);

  async function fetchTokenURI() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const campaignHandlerContract = new ethers.Contract(
      campaignHandlerAddress,
      CampaignHandler.abi,
      signer
    );

    await campaignHandlerContract
      .creatorToCampaign(campaign.creator, campaign.campaignId - 1)
      .then(function (result) {
        setTokenURI(result.tokenURI);
      })
      .catch(function (error) {
        console.log(error);
      });
    setOpensea(`${OPENSEA_LINK}/${tokenURI}`);
  }

  async function onContribute() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    let campaignHandlerContract = new ethers.Contract(
      campaignHandlerAddress,
      CampaignHandler.abi,
      signer
    );

    await campaignHandlerContract.contribute(
      ethers.utils.parseEther("0.5"),
      campaign.campaignId - 1,
      {
        value: ethers.utils.parseEther("0.5"),
      }
    );
  }

  async function onMint() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    let campaignHandlerContract = new ethers.Contract(
      campaignHandlerAddress,
      CampaignHandler.abi,
      signer
    );

    await campaignHandlerContract.mintAndUpdate(
      campaign.ipfsCID,
      campaign.campaignId - 1
    );
  }

  async function withdrawFunds() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    let campaignHandlerContract = new ethers.Contract(
      campaignHandlerAddress,
      CampaignHandler.abi,
      signer
    );

    await campaignHandlerContract.withdraw(campaign.campaignId - 1);
  }

  const viewNFT = () => {
    window.open(opensea, "_blank");
  };

  return (
    <div className="mr-8 ml-12">
      <img src={image_url} className="rounded w-60 mt-10 " />
      <button className="text-white " onClick={toggle}>
        {playing ? (
          <img
            className="w-12 rounded-full bg-transparent -mt-40 ml-24"
            src="/pause-button.png"
          />
        ) : (
          <img
            className="w-12 rounded-full bg-transparent -mt-40 ml-24"
            src="/play-button.png"
          />
        )}
      </button>
      <h3 className="text-white text-xl mb-2 ">{campaign.contentName}</h3>
      <p className="text-gray-400 w-60 ">{campaign.contentInfo}</p>
      <div className="flex flex-row  mt-2">
        <h3 className="text-white text-lg ">{`Goal: ${ethers.utils.formatEther(
          goal
        )}`}</h3>
        <img className="w-10 mr-4" src="/polygon-logo.svg" />
        <h3 className="text-white text-lg">{`Raised: ${ethers.utils.formatEther(
          total
        )}`}</h3>
        <img className="w-10" src="/polygon-logo.svg" />
      </div>
      {isAuthenticated && !isFunded && props.page === "profile" && (
        <button
          className="font-bold mt-6 mb-24  lg:w-48 md:w-36 sm:w-24 bg-gradient-to-r from-teal-400 to-blue-500 hover:from-pink-600 hover:to-orange-600 text-white rounded p-4 shadow-lg"
          onClick={onContribute}
        >
          Contribute
        </button>
      )}
      {isAuthenticated && isFunded && tokenURI._hex === "0x00" && (
        <button
          className="font-bold mt-6 mb-24  lg:w-48 md:w-36 sm:w-24 bg-gradient-to-r from-teal-400 to-blue-500 hover:from-pink-600 hover:to-orange-600 text-white rounded p-4 shadow-lg"
          onClick={onMint}
        >
          Mint
        </button>
      )}
      <div className="flex flex-col">
        {isFunded && tokenURI._hex !== "0x00" && (
          <button
            className="font-bold mt-6 mb-2  lg:w-48 md:w-36 sm:w-24 bg-gradient-to-r from-teal-400 to-blue-500 hover:from-pink-600 hover:to-orange-600 text-white rounded p-4 shadow-lg"
            onClick={viewNFT}
          >
            View NFT
          </button>
        )}
        {isFunded && tokenURI._hex !== "0x00" && props.page === "profile" && (
          <button
            className="font-bold mt-6 mb-24  lg:w-48 md:w-36 sm:w-24 bg-gradient-to-r from-teal-400 to-blue-500 hover:from-pink-600 hover:to-orange-600 text-white rounded p-4 shadow-lg"
            onClick={withdrawFunds}
          >
            Withdraw Funds
          </button>
        )}
      </div>
    </div>
  );
};

export default CampaignCard;
