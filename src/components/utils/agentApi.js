import axios from "axios";

const BASE_URL = "https://vid-shuffle.vercel.app/api";

export const analyzePlaylist = async (videos) => {
  const res = await axios.post(`${BASE_URL}/analyze`, { videos }, { timeout: 60000 });
  return res.data;
};

export const searchPlaylist = async (query, videoIds) => {
  const res = await axios.post(`${BASE_URL}/search`, {
    query,
    video_ids: videoIds,
  }, { timeout: 30000 });
  return res.data.results;
};
