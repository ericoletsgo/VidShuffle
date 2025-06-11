const { GoogleGenerativeAI } = require("@google/generative-ai");

function getModel() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY not set");
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.3,
    },
  });
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const objMatch = text.match(/\{[\s\S]*\}/);
    if (objMatch) {
      try {
        return JSON.parse(objMatch[0]);
      } catch {}
    }
    const arrMatch = text.match(/\[[\s\S]*\]/);
    if (arrMatch) {
      try {
        return JSON.parse(arrMatch[0]);
      } catch {}
    }
    return null;
  }
}

function formatVideoEntry(v, i) {
  let entry = `${i + 1}. "${v.title}" (${v.video_id})`;
  if (v.transcript) {
    entry += `\nTranscript: ${v.transcript.slice(0, 1500)}`;
  } else if (v.description || v.tags?.length) {
    if (v.description) entry += `\nDescription: ${v.description.slice(0, 500)}`;
    if (v.tags?.length) entry += `\nTags: ${v.tags.join(", ")}`;
    if (v.duration) entry += `\nDuration: ${v.duration}`;
  }
  return entry;
}

async function analyzePlaylist(videos) {
  const model = getModel();

  const hasTranscripts = videos.filter((v) => v.transcript).length;
  const videoList = videos.map(formatVideoEntry).join("\n\n");

  const dataNote =
    hasTranscripts < videos.length
      ? `\nNote: ${hasTranscripts} of ${videos.length} videos have transcript data. For others, use the title, description, and tags to infer content. Use your knowledge of these videos and creators if you recognize them.`
      : "";

  const prompt = `You are analyzing a YouTube playlist. For each video, I have varying levels of data (transcript excerpts, descriptions, tags, or just titles). Provide a comprehensive analysis using all available information.${dataNote}

Videos:
${videoList.slice(0, 12000)}

Respond in JSON with these keys:
- overview: 2-3 sentences about what this playlist covers
- themes: array of 3-6 main themes across all videos
- videos: array of objects for each video with keys:
  - video_id: the video ID
  - summary: 1-2 sentence summary of what this specific video covers
  - topics: array of 2-4 topic tags
  - difficulty: "beginner", "intermediate", or "advanced" (if applicable, otherwise null)
  - prerequisites: which other videos in the playlist should be watched first (array of video_ids, empty if none)
- watch_order: array of objects with keys "video_id", "title", "reason" suggesting the best order to watch
- key_takeaways: array of 4-6 main things someone would learn from this entire playlist`;

  const result = await model.generateContent(prompt);
  const parsed = parseJson(result.response.text());
  if (!parsed) throw new Error("Failed to parse Gemini response");
  return parsed;
}

async function searchTranscripts(query, transcripts) {
  const model = getModel();

  const combined = Object.entries(transcripts)
    .filter(([, text]) => text)
    .map(([vid, text]) => `[Video ${vid}]: ${text.slice(0, 3000)}`)
    .join("\n\n")
    .slice(0, 12000);

  const prompt = `Search query: "${query}"

Find the most relevant sections from these video transcripts:
${combined}

Return the top 3-5 most relevant results as JSON array with keys: video_id, relevance_snippet, score (0-100)`;

  const result = await model.generateContent(prompt);
  const parsed = parseJson(result.response.text());
  return Array.isArray(parsed) ? parsed : [];
}

module.exports = { analyzePlaylist, searchTranscripts };
