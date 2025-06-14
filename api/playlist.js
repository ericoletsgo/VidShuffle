const axios = require("axios");

const baseApiUrl = "https://www.googleapis.com/youtube/v3";

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const { playlistId } = req.query;
  if (!playlistId) {
    return res.status(400).json({ error: "Playlist ID is required" });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;

  try {
    const playlistDetailsResponse = await axios.get(`${baseApiUrl}/playlists`, {
      params: { part: "snippet", id: playlistId, key: apiKey },
    });

    const playlistDetails = playlistDetailsResponse.data.items[0];
    let playlistItems = [];
    let nextToken = "";

    do {
      const playlistItemsResponse = await axios.get(`${baseApiUrl}/playlistItems`, {
        params: {
          part: "snippet",
          maxResults: 50,
          playlistId,
          key: apiKey,
          pageToken: nextToken,
        },
      });
      playlistItems.push(...playlistItemsResponse.data.items);
      nextToken = playlistItemsResponse.data.nextPageToken || "";
    } while (nextToken);

    const etag = playlistDetailsResponse.data.etag || Date.now().toString();
    res.setHeader("ETag", etag);
    res.json({ playlistDetails, playlistItems });
  } catch (error) {
    console.error("Playlist error:", error.message);
    res.status(500).json({ error: "Failed to fetch playlist data" });
  }
};
