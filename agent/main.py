import asyncio
from concurrent.futures import ThreadPoolExecutor

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

from transcript import get_transcript, get_transcripts
from intelligence import summarize_video, summarize_playlist, search_transcripts

app = FastAPI(title="VidShuffle Agent")
executor = ThreadPoolExecutor(max_workers=4)

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
async def fetch_transcript(video_id: str):
    loop = asyncio.get_event_loop()
    text = await loop.run_in_executor(executor, get_transcript, video_id)
    if text is None:
        raise HTTPException(status_code=404, detail="Transcript not available")
    return {"video_id": video_id, "transcript": text}


class PlaylistRequest(BaseModel):
    video_ids: list[str]


@app.post("/transcripts")
async def fetch_transcripts(req: PlaylistRequest):
    loop = asyncio.get_event_loop()
    results = await loop.run_in_executor(executor, get_transcripts, req.video_ids)
    return {"transcripts": results}


class VideoInsightRequest(BaseModel):
    video_id: str
    title: str


@app.post("/insight/video")
async def video_insight(req: VideoInsightRequest):
    loop = asyncio.get_event_loop()
    transcript = await loop.run_in_executor(executor, get_transcript, req.video_id)
    if not transcript:
        raise HTTPException(status_code=404, detail="Transcript not available")
    result = await loop.run_in_executor(executor, summarize_video, req.title, transcript, req.video_id)
    return {"video_id": req.video_id, **result}


class PlaylistInsightRequest(BaseModel):
    videos: list[dict]


@app.post("/insight/playlist")
async def playlist_insight(req: PlaylistInsightRequest):
    loop = asyncio.get_event_loop()
    for video in req.videos:
        if not video.get("summary"):
            transcript = await loop.run_in_executor(
                executor, get_transcript, video["video_id"]
            )
            if transcript:
                info = await loop.run_in_executor(
                    executor, summarize_video, video.get("title", ""), transcript
                )
                video["summary"] = info.get("summary", "")
    result = await loop.run_in_executor(executor, summarize_playlist, req.videos)
    return result


class SearchRequest(BaseModel):
    query: str
    video_ids: list[str]


@app.post("/search")
async def search(req: SearchRequest):
    loop = asyncio.get_event_loop()
    transcripts = await loop.run_in_executor(executor, get_transcripts, req.video_ids)
    filtered = {k: v for k, v in transcripts.items() if v}
    results = await loop.run_in_executor(executor, search_transcripts, req.query, filtered)
    return {"results": results}
