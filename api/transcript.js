const axios = require("axios");

const INNERTUBE_URL =
  "https://www.youtube.com/youtubei/v1/player?prettyPrint=false";

async function fetchCaptionTracks(videoId) {
  const res = await axios.post(
    INNERTUBE_URL,
    {
      context: {
        client: { clientName: "ANDROID", clientVersion: "20.10.38" },
      },
      videoId,
    },
    {
      headers: {
        "Content-Type": "application/json",
        "User-Agent":
          "com.google.android.youtube/20.10.38 (Linux; U; Android 14)",
      },
      timeout: 5000,
    }
  );

  return (
    res.data?.captions?.playerCaptionsTracklistRenderer?.captionTracks || []
  );
}

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n/g, " ");
}

function parseTranscriptXml(xml) {
  const parts = [];

  // srv3 format: <p t="ms" d="ms">...<s>word</s>...</p>
  const pRegex = /<p\s+t="\d+"\s+d="\d+"[^>]*>([\s\S]*?)<\/p>/g;
  let m;
  while ((m = pRegex.exec(xml)) !== null) {
    let text = m[1].replace(/<[^>]+>/g, "");
    text = decodeEntities(text).trim();
    if (text) parts.push(text);
  }
  if (parts.length > 0) return parts.join(" ");

  // classic format: <text start="" dur="">...</text>
  const tRegex = /<text[^>]*>([\s\S]*?)<\/text>/g;
  while ((m = tRegex.exec(xml)) !== null) {
    const text = decodeEntities(m[1]).trim();
    if (text) parts.push(text);
  }
  return parts.join(" ");
}

async function getTranscript(videoId) {
  try {
    const tracks = await fetchCaptionTracks(videoId);
    if (!tracks.length) return null;

    const en = tracks.find(
      (t) => t.languageCode === "en" || t.languageCode?.startsWith("en")
    );
    const track = en || tracks[0];
    if (!track?.baseUrl) return null;

    const capRes = await axios.get(track.baseUrl, { timeout: 5000 });
    const xml = typeof capRes.data === "string" ? capRes.data : "";
    const text = parseTranscriptXml(xml);
    return text || null;
  } catch (err) {
    console.error(`Transcript failed for ${videoId}:`, err.message);
    return null;
  }
}

async function getVideoMetadata(videoIds) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return {};

  try {
    const res = await axios.get(
      "https://www.googleapis.com/youtube/v3/videos",
      {
        params: {
          part: "snippet,contentDetails",
          id: videoIds.join(","),
          key,
        },
        timeout: 5000,
      }
    );

    const meta = {};
    for (const item of res.data.items || []) {
      meta[item.id] = {
        description: item.snippet?.description?.slice(0, 1000) || "",
        tags: item.snippet?.tags?.slice(0, 10) || [],
        duration: item.contentDetails?.duration || "",
        category: item.snippet?.categoryId || "",
      };
    }
    return meta;
  } catch (err) {
    console.error("Metadata fetch failed:", err.message);
    return {};
  }
}

module.exports = { getTranscript, getVideoMetadata };
