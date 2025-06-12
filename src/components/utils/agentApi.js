import axios from "axios";

const BASE_URL = "https://vid-shuffle.vercel.app/api";

export const checkAgentHealth = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/health`, { timeout: 3000 });
    return res.data.status === "ok";
  } catch {
    return false;
  }
};

export const getVideoInsight = async (videoId, title) => {
  const res = await axios.post(`${BASE_URL}/insight/video`, {
    video_id: videoId,
    title,
  });
  return res.data;
};

export const getPlaylistInsight = async (videos) => {
  const res = await axios.post(`${BASE_URL}/insight/playlist`, { videos });
  return res.data;
};

export const searchPlaylist = async (query, videoIds) => {
  const res = await axios.post(`${BASE_URL}/search`, {
    query,
    video_ids: videoIds,
  });
  return res.data.results;
};
