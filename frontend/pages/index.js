import React, { useEffect, useState } from "react";
import { useMoralisWeb3Api } from "react-moralis";
import { MoralisProvider } from "react-moralis";

const API_ID = process.env.NEXT_PUBLIC_MORALIS_APP_ID;
const SERVER_URL = process.env.NEXT_PUBLIC_MORALIS_SERVER_URL;

export default function Home() {
  return (
    <div className="flex lg:flex-row flex-col bg-transparent items-center mt-20 lg:mt-0 justify-evenly sm:h-[100vh] md:h-[100vh] h-screen"></div>
  );
}
