import axios from "axios";

const BASE_URL = "/api";

async function fetchTranscriptBatch(videoIds) {
  const res = await axios.post(
    `${BASE_URL}/transcripts`,
    { video_ids: videoIds },
    { timeout: 15000 }
  );
  return res.data;
}

export const analyzePlaylist = async (videos, onProgress) => {
  const allTranscripts = {};
  const allMetadata = {};

  // fetch transcripts + metadata in batches of 5
  for (let i = 0; i < videos.length; i += 5) {
    const batch = videos.slice(i, i + 5);
    const ids = batch.map((v) => v.video_id);
    if (onProgress)
      onProgress(
        `Fetching video data ${i + 1}-${Math.min(i + 5, videos.length)}...`
      );
    try {
      const data = await fetchTranscriptBatch(ids);
      if (data.transcripts) Object.assign(allTranscripts, data.transcripts);
      if (data.metadata) Object.assign(allMetadata, data.metadata);
    } catch {
      // skip failed batches
    }
  }

  // build video data: prefer transcript, fall back to metadata
  const withData = videos
    .map((v) => {
      const transcript = allTranscripts[v.video_id];
      const meta = allMetadata[v.video_id];

      if (transcript) {
        return {
          video_id: v.video_id,
          title: v.title,
          transcript: transcript.slice(0, 1500),
        };
      }

      if (meta && (meta.description || meta.tags?.length)) {
        return {
          video_id: v.video_id,
          title: v.title,
          description: meta.description,
          tags: meta.tags,
          duration: meta.duration,
        };
      }

      // still include video with just its title
      return {
        video_id: v.video_id,
        title: v.title,
      };
    })
    .filter((v) => v.title);

  if (withData.length === 0) throw new Error("No video data available");

  if (onProgress) onProgress("Analyzing with AI...");

  const res = await axios.post(
    `${BASE_URL}/analyze`,
    { videos: withData },
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
