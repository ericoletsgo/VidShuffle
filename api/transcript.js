const { YoutubeTranscript } = require("youtube-transcript");

async function getTranscript(videoId) {
  try {
    const entries = await YoutubeTranscript.fetchTranscript(videoId);
    if (!entries || entries.length === 0) return null;
    return entries.map((e) => e.text).join(" ");
  } catch {
    return null;
  }
}

async function getTranscripts(videoIds) {
  const results = {};
  const batches = [];
  for (let i = 0; i < videoIds.length; i += 5) {
    batches.push(videoIds.slice(i, i + 5));
  }
  for (const batch of batches) {
    await Promise.all(
      batch.map(async (id) => {
        results[id] = await getTranscript(id);
      })
    );
  }
  return results;
}

module.exports = { getTranscript, getTranscripts };
