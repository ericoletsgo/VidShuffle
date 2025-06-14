const { getTranscript } = require("./transcript");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

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
    console.error("Transcripts error:", error.message);
    res.status(500).json({ error: "Failed to fetch transcripts" });
  }
};
