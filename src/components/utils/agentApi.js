import axios from "axios";

const AGENT_URL = import.meta.env.VITE_AGENT_URL || "http://localhost:8000";

export const checkAgentHealth = async () => {
  try {
    const res = await axios.get(`${AGENT_URL}/health`, { timeout: 3000 });
    return res.data.status === "ok";
  } catch {
    return false;
  }
};

export const getVideoInsight = async (videoId, title) => {
  const res = await axios.post(`${AGENT_URL}/insight/video`, {
    video_id: videoId,
    title,
  });
  return res.data;
};

export const getPlaylistInsight = async (videos) => {
  const res = await axios.post(`${AGENT_URL}/insight/playlist`, { videos });
  return res.data;
};

export const searchPlaylist = async (query, videoIds) => {
  const res = await axios.post(`${AGENT_URL}/search`, {
    query,
    video_ids: videoIds,
  });
  return res.data.results;
};
