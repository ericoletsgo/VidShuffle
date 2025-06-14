const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const { getTranscript, getTranscripts } = require("./transcript");
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

app.post("/api/analyze", async (req, res) => {
  const { videos } = req.body;
  if (!videos || !Array.isArray(videos)) {
    return res.status(400).json({ error: "videos array required" });
  }

  try {
    // free tier has 10s limit, keep it tight
    const capped = videos.slice(0, 5);
    const ids = capped.map((v) => v.video_id);

    // fetch all transcripts in parallel
    const transcriptPromises = ids.map((id) => getTranscript(id));
    const transcriptResults = await Promise.all(transcriptPromises);

    const withTranscripts = capped.map((v, i) => ({
      ...v,
      transcript: transcriptResults[i] || null,
    }));

    const hasAny = withTranscripts.some((v) => v.transcript);
    if (!hasAny) {
      return res.status(404).json({ error: "No transcripts available for this playlist" });
    }

    const analysis = await analyzePlaylist(withTranscripts);
    res.json(analysis);
  } catch (error) {
    console.error("Analyze error:", error.message || error);
    res.status(500).json({ error: error.message || "Analysis failed" });
  }
});

app.post("/api/search", async (req, res) => {
  const { query, video_ids } = req.body;
  if (!query || !video_ids) return res.status(400).json({ error: "query and video_ids required" });

  try {
    const sliced = video_ids.slice(0, 5);
    const transcriptPromises = sliced.map((id) => getTranscript(id));
    const results = await Promise.all(transcriptPromises);
    const transcripts = {};
    sliced.forEach((id, i) => { transcripts[id] = results[i]; });
    const filtered = Object.fromEntries(
      Object.entries(transcripts).filter(([, v]) => v)
    );
    const results = await searchTranscripts(query, filtered);
    res.json({ results });
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
