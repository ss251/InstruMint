import React, { useEffect, useState } from "react";
import { useMoralis, useMoralisWeb3Api } from "react-moralis";
import { MoralisProvider } from "react-moralis";
import Moralis from "moralis";
import CampaignHandler from "../utils/CampaignHandler.json";

import { nftAddress, campaignHandlerAddress } from "../config";

const ethers = Moralis.web3Library;

const useAudio = (url) => {
  const { isAuthenticated, user } = useMoralis();
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

  const [playing, toggle] = useAudio(content.animation_url);
  const [goal, setGoal] = useState(campaign.goal);
  const [total, setTotal] = useState(campaign.total);

  const { user, isAuthenticated } = useMoralis();

  useEffect(() => {
    if (isAuthenticated) {
      let campaignHandlerContract;

      const onNewContribution = (sender, amount, campaignId) => {
        console.log("NewContribution", sender, amount, campaignId);
        // if (
        //   sender === user.attributes.ethAddress &&
        //   campaignId === campaign.campaignId - 1
        // )
        {
          setTotal(amount);
          setGoal(ethers.BigNumber.from(campaign.goal).sub(total));
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

      return () => {
        if (campaignHandlerContract) {
          campaignHandlerContract.off("LogContribute", onNewContribution);
        }
      };
    }
  }, []);

  async function onContribute() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    let campaignHandlerContract = new ethers.Contract(
      campaignHandlerAddress,
      CampaignHandler.abi,
      signer
    );

    await campaignHandlerContract.contribute(
      ethers.utils.parseEther("0.1"),
      campaign.campaignId - 1,
      {
        value: ethers.utils.parseEther("0.1"),
      }
    );
  }

  return (
    <div>
      <img src={content.image} className="rounded w-60 mt-10 ml-10" />
      <button className="text-white ml-10" onClick={toggle}>
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
      <h3 className="text-white text-xl mb-2 ml-10">{campaign.contentName}</h3>
      <p className="text-gray-400 w-60 ml-10">{campaign.contentInfo}</p>
      <div className="flex flex-row ml-10 mt-2">
        <h3 className="text-white text-lg ">{`Goal: ${ethers.utils.formatEther(
          goal
        )}`}</h3>
        <img className="w-10 mr-4" src="/polygon-logo.svg" />
        <h3 className="text-white text-lg">{`Raised: ${ethers.utils.formatEther(
          total
        )}`}</h3>
        <img className="w-10" src="/polygon-logo.svg" />
      </div>
      {isAuthenticated && (
        <button
          className="font-bold mt-6 mb-24 ml-10 lg:w-48 md:w-36 sm:w-24 bg-gradient-to-r from-teal-400 to-blue-500 hover:from-pink-600 hover:to-orange-600 text-white rounded p-4 shadow-lg"
          onClick={onContribute}
        >
          Contribute
        </button>
      )}
    </div>
  );
};

export default CampaignCard;
