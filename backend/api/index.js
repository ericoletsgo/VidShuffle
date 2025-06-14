const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const { getTranscript } = require("./transcript");
const { analyzePlaylist, searchTranscripts } = require("./intelligence");

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

// step 1: fetch transcripts for a batch of videos (up to 5 at a time)
app.post("/api/transcripts", async (req, res) => {
  const { video_ids } = req.body;
  if (!video_ids || !Array.isArray(video_ids)) {
    return res.status(400).json({ error: "video_ids array required" });
  }

  try {
    const batch = video_ids.slice(0, 5);
    const results = await Promise.all(batch.map((id) => getTranscript(id)));
    const transcripts = {};
    batch.forEach((id, i) => {
      transcripts[id] = results[i];
    });
    res.json({ transcripts });
  } catch (error) {
    console.error("Transcripts error:", error.message || error);
    res.status(500).json({ error: "Failed to fetch transcripts" });
  }
});

// step 2: analyze with already-fetched transcripts (no fetching, just gemini)
app.post("/api/analyze", async (req, res) => {
  const { videos } = req.body;
  if (!videos || !Array.isArray(videos)) {
    return res.status(400).json({ error: "videos array required" });
  }

  try {
    const hasAny = videos.some((v) => v.transcript);
    if (!hasAny) {
      return res.status(404).json({ error: "No transcripts available" });
    }

    const analysis = await analyzePlaylist(videos);
    res.json(analysis);
  } catch (error) {
    console.error("Analyze error:", error.message || error);
    res.status(500).json({ error: error.message || "Analysis failed" });
  }
});

app.post("/api/search", async (req, res) => {
  const { query, video_ids } = req.body;
  if (!query || !video_ids) {
    return res.status(400).json({ error: "query and video_ids required" });
  }

  try {
    const batch = video_ids.slice(0, 5);
    const transcriptResults = await Promise.all(batch.map((id) => getTranscript(id)));
    const transcripts = {};
    batch.forEach((id, i) => { transcripts[id] = transcriptResults[i]; });
    const filtered = Object.fromEntries(
      Object.entries(transcripts).filter(([, v]) => v)
    );
    const searchResults = await searchTranscripts(query, filtered);
    res.json({ results: searchResults });
  } catch (error) {
    console.error("Search error:", error.message || error);
    res.status(500).json({ error: error.message || "Search failed" });
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
