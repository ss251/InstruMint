import React, { useState, useEffect } from "react";

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

  const [playing, toggle] = useAudio(content.animation_url);

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
    </div>
  );
};

export default CampaignCard;
