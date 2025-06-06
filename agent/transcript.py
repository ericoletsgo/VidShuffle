from youtube_transcript_api import YouTubeTranscriptApi

from cache import transcript_cache


def get_transcript(video_id: str) -> str | None:
    cached = transcript_cache.get(video_id)
    if cached is not None:
        return cached

    try:
        entries = YouTubeTranscriptApi.get_transcript(video_id)
        text = " ".join(e["text"] for e in entries)
        transcript_cache.set(video_id, text)
        return text
    except Exception:
        return None


def get_transcripts(video_ids: list[str]) -> dict[str, str | None]:
    results = {}
    for vid in video_ids:
        results[vid] = get_transcript(vid)
    return results
