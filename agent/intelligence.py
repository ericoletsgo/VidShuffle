import os
import json
import re

import vertexai
from vertexai.generative_models import GenerativeModel, GenerationConfig

from cache import insight_cache

vertexai.init(project=os.getenv("GOOGLE_CLOUD_PROJECT"), location="us-central1")

model = GenerativeModel("gemini-1.5-flash")
json_config = GenerationConfig(
    response_mime_type="application/json",
    temperature=0.3,
)


def parse_json(text):
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{[\s\S]*\}", text)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass
        match = re.search(r"\[[\s\S]*\]", text)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass
    return None


def summarize_video(title: str, transcript: str, video_id: str = "") -> dict:
    cache_key = f"video:{video_id or title}"
    cached = insight_cache.get(cache_key)
    if cached:
        return cached

    prompt = f"""Given this YouTube video titled "{title}" with the following transcript, provide:
1. A 2-3 sentence summary
2. 3-5 key topics covered
3. Key takeaways (bullet points)

Transcript:
{transcript[:8000]}

Respond in JSON with keys: summary, topics, takeaways"""

    response = model.generate_content(prompt, generation_config=json_config)
    result = parse_json(response.text)
    if result:
        insight_cache.set(cache_key, result)
        return result
    fallback = {"summary": response.text, "topics": [], "takeaways": []}
    insight_cache.set(cache_key, fallback)
    return fallback


def summarize_playlist(videos: list[dict]) -> dict:
    video_summaries = "\n".join(
        f"- {v['title']}: {v['summary']}" for v in videos if v.get("summary")
    )

    prompt = f"""Given these videos from a YouTube playlist:
{video_summaries}

Provide:
1. A playlist overview (what this playlist is about)
2. Main themes across all videos
3. A suggested watch order with reasoning (which videos to watch first based on topic flow, each item should have title and reason)

Respond in JSON with keys: overview, themes, watch_order"""

    response = model.generate_content(prompt, generation_config=json_config)
    result = parse_json(response.text)
    if result:
        return result
    return {"overview": response.text, "themes": [], "watch_order": []}


def search_transcripts(query: str, transcripts: dict[str, str]) -> list[dict]:
    combined = "\n\n".join(
        f"[Video {vid}]: {text[:3000]}" for vid, text in transcripts.items() if text
    )

    prompt = f"""Search query: "{query}"

Find the most relevant sections from these video transcripts:
{combined[:12000]}

Return the top 3-5 most relevant results as JSON array with keys: video_id, relevance_snippet, score (0-100)"""

    response = model.generate_content(prompt, generation_config=json_config)
    result = parse_json(response.text)
    if isinstance(result, list):
        return result
    return []
