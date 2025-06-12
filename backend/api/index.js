const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const { getTranscript, getTranscripts } = require("./transcript");
const { summarizeVideo, summarizePlaylist, searchTranscripts } = require("./intelligence");

const app = express();

app.use(cors());
app.use(express.json());

const baseApiUrl = "https://www.googleapis.com/youtube/v3";
const apiKey = process.env.YOUTUBE_API_KEY;

const playlistCache = {};

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.get("/api/playlist", async (req, res) => {
  const { playlistId } = req.query;

  if (!playlistId) {
    return res.status(400).json({ error: "Playlist ID is required" });
  }

  const clientEtag = req.headers["if-none-match"];
  if (clientEtag && playlistCache[playlistId]?.etag === clientEtag) {
    return res.status(304).end();
  }

  try {
    const playlistDetailsResponse = await axios.get(`${baseApiUrl}/playlists`, {
      params: {
        part: "snippet",
        id: playlistId,
        key: apiKey,
      },
    });

    const playlistDetails = playlistDetailsResponse.data.items[0];

    let playlistItems = [];
    let nextToken = "";

    do {
      const playlistItemsResponse = await axios.get(`${baseApiUrl}/playlistItems`, {
        params: {
          part: "snippet",
          maxResults: 50,
          playlistId: playlistId,
          key: apiKey,
          pageToken: nextToken,
        },
      });

      playlistItems.push(...playlistItemsResponse.data.items);
      nextToken = playlistItemsResponse.data.nextPageToken || "";
    } while (nextToken);

    const etag = playlistDetailsResponse.data.etag || Date.now().toString();

    playlistCache[playlistId] = { etag };

    res.set("ETag", etag);
    res.json({
      playlistDetails,
      playlistItems,
    });
  } catch (error) {
    console.error("Error fetching playlist data:", error);
    res.status(500).json({ error: "Failed to fetch playlist data" });
  }
});

app.get("/api/transcript/:videoId", async (req, res) => {
  try {
    const text = await getTranscript(req.params.videoId);
    if (!text) return res.status(404).json({ error: "Transcript not available" });
    res.json({ video_id: req.params.videoId, transcript: text });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch transcript" });
  }
});

app.post("/api/insight/video", async (req, res) => {
  const { video_id, title } = req.body;
  if (!video_id || !title) return res.status(400).json({ error: "video_id and title required" });

  try {
    const transcript = await getTranscript(video_id);
    if (!transcript) return res.status(404).json({ error: "Transcript not available" });
    const result = await summarizeVideo(title, transcript);
    res.json({ video_id, ...result });
  } catch (error) {
    console.error("Video insight error:", error);
    res.status(500).json({ error: "Failed to generate insight" });
  }
});

app.post("/api/insight/playlist", async (req, res) => {
  const { videos } = req.body;
  if (!videos) return res.status(400).json({ error: "videos array required" });

  try {
    for (const video of videos) {
      if (!video.summary) {
        const transcript = await getTranscript(video.video_id);
        if (transcript) {
          const info = await summarizeVideo(video.title || "", transcript);
          video.summary = info.summary || "";
        }
      }
    }
    const result = await summarizePlaylist(videos);
    res.json(result);
  } catch (error) {
    console.error("Playlist insight error:", error);
    res.status(500).json({ error: "Failed to generate playlist insight" });
  }
});

app.post("/api/search", async (req, res) => {
  const { query, video_ids } = req.body;
  if (!query || !video_ids) return res.status(400).json({ error: "query and video_ids required" });

  try {
    const transcripts = await getTranscripts(video_ids);
    const filtered = Object.fromEntries(
      Object.entries(transcripts).filter(([, v]) => v)
    );
    const results = await searchTranscripts(query, filtered);
    res.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Search failed" });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

if (require.main === module) {
  const PORT = 5000;
  app.listen(PORT, () => {
    console.log(`Backend server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
