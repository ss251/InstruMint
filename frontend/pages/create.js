import React, { useState } from "react";
import { create as ipfsHttpClient } from "ipfs-http-client";
import Moralis from "moralis";
import { useMoralis, useMoralisQuery } from "react-moralis";
import NFT from "../utils/NFT.json";
import CampaignHandler from "../utils/CampaignHandler.json";
import { useRouter } from "next/router";
const ethers = Moralis.web3Library;

const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");
// const client = new Web3Storage({ token: process.env.NEXT_PUBLIC_WEB3_API_KEY });

import { nftAddress, campaignHandlerAddress } from "../config";
import { Contract } from "ethers";

export default function Create() {
  const { isAuthenticated, user } = useMoralis();
  const [imgFileUrl, setImgFileUrl] = useState(null);
  const [audioFileUrl, setAudioFileUrl] = useState(null);
  const [ipfsCID, setIpfsCID] = useState("");
  const [previewURL, setPreviewURL] = useState("");
  const [formInputContent, updateFormInputContent] = useState({
    name: "",
    description: "",
    image: "",
    animation_url: "",
    youtube_url: "",
  });
  const [formInputCampaign, updateFormInputCampaign] = useState({
    goal: null,
    name: "",
    description: "",
    ipfsCID: "",
  });
  const router = useRouter();

  async function onSubmitContent() {
    const { name, description, image, animation_url, youtube_url } =
      formInputContent;
    if (!name || !description || !image || !animation_url) return;
    const data = JSON.stringify({
      name,
      description,
      image: imgFileUrl,
      animation_url: audioFileUrl,
      youtube_url,
    });
    try {
      const added = await client.add(data);
      const url = `ipfs://${added.path}`;
      console.log(url);
      setIpfsCID(url);
    } catch (error) {
      console.log("Error uploading file", error);
    }
  }

  async function onSubmitCampaign(e) {
    const { goal, name, description } = formInputCampaign;
    if (!goal || !name || !description || !ipfsCID) return;

    try {
      createCampaign(ipfsCID);
    } catch (error) {
      console.log("Error calling newCampaign contract", error);
    }
  }

  async function createCampaign(ipfsCID) {
    const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();

    const CampaignABI = CampaignHandler.abi;
    const CampaignBytecode = CampaignHandler.bytecode;
    const campaignContract = new ethers.Contract(
      campaignHandlerAddress,
      CampaignABI,
      signer
    );
    console.log(campaignContract);

    let goal = ethers.utils.parseUnits(formInputCampaign.goal, "ether");

    let transaction = await campaignContract.newCampaign(
      goal,
      formInputCampaign.name,
      formInputCampaign.description,
      ipfsCID
    );
    await transaction.wait();
    setIpfsCID("");
  }

  async function onChangeImg(e) {
    const file = e.target.files[0];
    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`),
      });
      const url = `ipfs://${added.path}`;
      setImgFileUrl(url);
      setPreviewURL(`https://ipfs.io/ipfs/${added.path}`);
      updateFormInputContent({
        ...formInputContent,
        image: url,
      });
    } catch (e) {
      console.log(e);
    }
  }

  async function onChangeAudio(e) {
    const file = e.target.files[0];
    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`),
      });
      const url = `ipfs://${added.path}`;
      setAudioFileUrl(url);
      updateFormInputContent({
        ...formInputContent,
        animation_url: url,
      });
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <div className="bg-black">
      {isAuthenticated ? (
        <div className="lg:w-1/4 w-1/2 lg:ml-60 ml-24 -mt-8 lg:mt-0 flex flex-col pb-12">
          <h1 className="mt-20 font-bold text-3xl text-gray-400">
            CREATE NEW CAMPAIGN
          </h1>
          {ipfsCID === "" && (
            <>
              <h2 className="text-gray-400 mt-8">
                Let's describe the content associated with your campaign first.
              </h2>
              <h4 className="mt-8 font-bold text-gray-400">NAME</h4>
              <input
                className="mt-2 border-blue-500 rounded p-4 bg-blue-form-field"
                onChange={(e) => {
                  updateFormInputContent({
                    ...formInputContent,
                    name: e.target.value,
                  });
                }}
              ></input>
              <h4 className="mt-8 font-bold text-gray-400">DESCRIPTION</h4>
              <h4 className="w-140 mt-2 text-gray-500">
                Details about the campaign NFT
              </h4>
              <input
                className="mt-4 border rounded p-4 bg-blue-form-field"
                onChange={(e) => {
                  updateFormInputContent({
                    ...formInputContent,
                    description: e.target.value,
                  });
                }}
              ></input>
              <h4 className="mt-8 font-bold text-gray-400">IMAGE</h4>
              <input
                type="file"
                placeholder="Image"
                className="my-4 mt-2"
                onChange={onChangeImg}
              />
              {!previewURL && <img src="/uploadimg.png" />}
              {previewURL && (
                <img className="rounded mt-4" width="350" src={previewURL} />
              )}
              <h4 className="w-140 mt-8 mb-2 font-bold text-gray-400">
                VIDEO, AUDIO, OR 3D MODEL
              </h4>
              <h4 className="w-140 mt-2 text-gray-500 mb-2">
                File types supported: JPG, PNG, GIF, SVG, MP4, WEBM, MP3, WAV,
                OGG, GLB, GLTF.
              </h4>
              <input
                type="file"
                placeholder="Audio"
                className="my-4 mt-2"
                onChange={onChangeAudio}
              />

              <button
                className="font-bold mt-12 mb-24 lg:w-48 sm:w-24 bg-gradient-to-r from-teal-400 to-blue-500 hover:from-pink-600 hover:to-orange-600 text-white rounded p-4 shadow-lg"
                onClick={onSubmitContent}
              >
                GENERATE IPFS CID
              </button>
            </>
          )}
          {ipfsCID !== "" && (
            <>
              <h2 className="text-gray-400 mt-8">
                Let's get the campaign rolling.
              </h2>
              <h4 className="mt-8 font-bold text-gray-400">GOAL (MATIC)</h4>
              <input
                className="mt-2 border-blue-500 rounded p-4 bg-blue-form-field"
                onChange={(e) => {
                  updateFormInputCampaign({
                    ...formInputCampaign,
                    goal: e.target.value,
                  });
                }}
              ></input>
              <h4 className="mt-8 font-bold text-gray-400">NAME</h4>
              <input
                className="mt-2 border-blue-500 rounded p-4 bg-blue-form-field"
                onChange={(e) => {
                  updateFormInputCampaign({
                    ...formInputCampaign,
                    name: e.target.value,
                  });
                }}
              ></input>
              <h4 className="mt-8 font-bold text-gray-400">DESCRIPTION</h4>
              <h4 className="w-140 mt-2 text-gray-500">
                Details about the campaign
              </h4>
              <input
                className="mt-4 border rounded p-4 bg-blue-form-field"
                onChange={(e) => {
                  updateFormInputCampaign({
                    ...formInputCampaign,
                    description: e.target.value,
                  });
                }}
              ></input>
              <button
                className="font-bold mt-12 mb-24 lg:w-48 sm:w-24 bg-gradient-to-r from-teal-400 to-blue-500 hover:from-pink-600 hover:to-orange-600 text-white rounded p-4 shadow-lg"
                onClick={onSubmitCampaign}
              >
                CREATE NEW CAMPAIGN
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="h-screen">
          <p className="ml-[30%] lg:ml-[40%] mt-20 text-xl lg:text-3xl">
            Please connect your wallet
          </p>
        </div>
      )}
    </div>
  );
}
