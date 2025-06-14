const { analyzePlaylist } = require("./intelligence");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

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
    console.error("Analyze error:", error.message);
    res.status(500).json({ error: error.message || "Analysis failed" });
  }
};
