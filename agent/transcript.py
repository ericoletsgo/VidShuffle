from youtube_transcript_api import YouTubeTranscriptApi


def get_transcript(video_id: str) -> str | None:
    try:
        entries = YouTubeTranscriptApi.get_transcript(video_id)
        return " ".join(e["text"] for e in entries)
    except Exception:
        return None


def get_transcripts(video_ids: list[str]) -> dict[str, str | None]:
    results = {}
    for vid in video_ids:
        results[vid] = get_transcript(vid)
    return results
