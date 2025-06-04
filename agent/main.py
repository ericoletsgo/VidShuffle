from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from transcript import get_transcript, get_transcripts

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
