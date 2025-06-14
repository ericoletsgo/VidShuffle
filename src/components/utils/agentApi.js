import axios from "axios";

const BASE_URL = "/api";

async function fetchTranscriptBatch(videoIds) {
  const res = await axios.post(
    `${BASE_URL}/transcripts`,
    { video_ids: videoIds },
    { timeout: 15000 }
  );
  return res.data.transcripts;
}

export const analyzePlaylist = async (videos, onProgress) => {
  // fetch transcripts in batches of 5
  const allTranscripts = {};
  for (let i = 0; i < videos.length; i += 5) {
    const batch = videos.slice(i, i + 5);
    const ids = batch.map((v) => v.video_id);
    if (onProgress) onProgress(`Fetching transcripts ${i + 1}-${Math.min(i + 5, videos.length)}...`);
    try {
      const transcripts = await fetchTranscriptBatch(ids);
      Object.assign(allTranscripts, transcripts);
    } catch {
      // skip failed batches
    }
  }

  // attach truncated transcripts to keep payload small
  const withTranscripts = videos
    .map((v) => ({
      video_id: v.video_id,
      title: v.title,
      transcript: allTranscripts[v.video_id]
        ? allTranscripts[v.video_id].slice(0, 1500)
        : null,
    }))
    .filter((v) => v.transcript);

  if (withTranscripts.length === 0) throw new Error("No transcripts available");

  if (onProgress) onProgress("Analyzing with AI...");

  const res = await axios.post(
    `${BASE_URL}/analyze`,
    { videos: withTranscripts },
    { timeout: 60000 }
  );
  return res.data;
};

export const searchPlaylist = async (query, videoIds) => {
  const res = await axios.post(
    `${BASE_URL}/search`,
    { query, video_ids: videoIds },
    { timeout: 30000 }
  );
  return res.data.results;
};
