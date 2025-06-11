const { getTranscript, getVideoMetadata } = require("./transcript");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { video_ids } = req.body;
  if (!video_ids || !Array.isArray(video_ids)) {
    return res.status(400).json({ error: "video_ids array required" });
  }

  try {
    const batch = video_ids.slice(0, 5);

    // fetch transcripts and metadata in parallel
    const [transcriptResults, metadata] = await Promise.all([
      Promise.all(batch.map((id) => getTranscript(id))),
      getVideoMetadata(batch),
    ]);

    const transcripts = {};
    batch.forEach((id, i) => {
      transcripts[id] = transcriptResults[i];
    });

    res.json({ transcripts, metadata });
  } catch (error) {
    console.error("Transcripts error:", error.message);
    res.status(500).json({ error: "Failed to fetch transcripts" });
  }
};
