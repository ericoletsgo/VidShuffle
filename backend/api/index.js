const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

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

if (require.main === module) {
  const PORT = 5000;
  app.listen(PORT, () => {
    console.log(`Backend server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
