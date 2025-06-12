const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: { responseMimeType: "application/json", temperature: 0.3 },
});

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const objMatch = text.match(/\{[\s\S]*\}/);
    if (objMatch) {
      try { return JSON.parse(objMatch[0]); } catch {}
    }
    const arrMatch = text.match(/\[[\s\S]*\]/);
    if (arrMatch) {
      try { return JSON.parse(arrMatch[0]); } catch {}
    }
    return null;
  }
}

async function summarizeVideo(title, transcript) {
  const prompt = `Given this YouTube video titled "${title}" with the following transcript, provide:
1. A 2-3 sentence summary
2. 3-5 key topics covered
3. Key takeaways (bullet points)

Transcript:
${transcript.slice(0, 8000)}

Respond in JSON with keys: summary, topics, takeaways`;

  const result = await model.generateContent(prompt);
  const parsed = parseJson(result.response.text());
  return parsed || { summary: result.response.text(), topics: [], takeaways: [] };
}

async function summarizePlaylist(videos) {
  const lines = videos
    .filter((v) => v.summary)
    .map((v) => `- ${v.title}: ${v.summary}`)
    .join("\n");

  const prompt = `Given these videos from a YouTube playlist:
${lines}

Provide:
1. A playlist overview (what this playlist is about)
2. Main themes across all videos
3. A suggested watch order with reasoning (each item should have title and reason)

Respond in JSON with keys: overview, themes, watch_order`;

  const result = await model.generateContent(prompt);
  const parsed = parseJson(result.response.text());
  return parsed || { overview: result.response.text(), themes: [], watch_order: [] };
}

async function searchTranscripts(query, transcripts) {
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

module.exports = { summarizeVideo, summarizePlaylist, searchTranscripts };
