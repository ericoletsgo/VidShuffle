from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

from transcript import get_transcript, get_transcripts
from intelligence import summarize_video, summarize_playlist, search_transcripts

app = FastAPI(title="VidShuffle Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/transcript/{video_id}")
def fetch_transcript(video_id: str):
    text = get_transcript(video_id)
    if text is None:
        raise HTTPException(status_code=404, detail="Transcript not available")
    return {"video_id": video_id, "transcript": text}


class PlaylistRequest(BaseModel):
    video_ids: list[str]


@app.post("/transcripts")
def fetch_transcripts(req: PlaylistRequest):
    results = get_transcripts(req.video_ids)
    return {"transcripts": results}


class VideoInsightRequest(BaseModel):
    video_id: str
    title: str


@app.post("/insight/video")
def video_insight(req: VideoInsightRequest):
    transcript = get_transcript(req.video_id)
    if not transcript:
        raise HTTPException(status_code=404, detail="Transcript not available")
    result = summarize_video(req.title, transcript)
    return {"video_id": req.video_id, **result}


class PlaylistInsightRequest(BaseModel):
    videos: list[dict]


@app.post("/insight/playlist")
def playlist_insight(req: PlaylistInsightRequest):
    for video in req.videos:
        if not video.get("summary"):
            transcript = get_transcript(video["video_id"])
            if transcript:
                info = summarize_video(video.get("title", ""), transcript)
                video["summary"] = info.get("summary", "")
    result = summarize_playlist(req.videos)
    return result


class SearchRequest(BaseModel):
    query: str
    video_ids: list[str]


@app.post("/search")
def search(req: SearchRequest):
    transcripts = get_transcripts(req.video_ids)
    results = search_transcripts(req.query, {k: v for k, v in transcripts.items() if v})
    return {"results": results}
