const { getTranscript } = require("./transcript");
const { searchTranscripts } = require("./intelligence");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { query, video_ids } = req.body;
  if (!query || !video_ids) {
    return res.status(400).json({ error: "query and video_ids required" });
  }

  try {
    const batch = video_ids.slice(0, 5);
    const results = await Promise.all(batch.map((id) => getTranscript(id)));
    const transcripts = {};
    batch.forEach((id, i) => { transcripts[id] = results[i]; });
    const filtered = Object.fromEntries(
      Object.entries(transcripts).filter(([, v]) => v)
    );
    const searchResults = await searchTranscripts(query, filtered);
    res.json({ results: searchResults });
  } catch (error) {
    console.error("Search error:", error.message);
    res.status(500).json({ error: error.message || "Search failed" });
  }
};
