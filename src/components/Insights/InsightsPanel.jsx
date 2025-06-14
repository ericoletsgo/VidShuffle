import React, { useState, useEffect } from "react";
import { analyzePlaylist } from "../utils/agentApi";
import PlaylistSearch from "./PlaylistSearch";

const InsightsPanel = ({ songs }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!songs || songs.length === 0) return;

    setLoading(true);
    setError("");
    setProgress("Starting analysis...");

    const videos = songs
      .filter(
        (s) =>
          s.snippet.title !== "Private video" &&
          s.snippet.title !== "Deleted video"
      )
      .map((s) => ({
        video_id: s.snippet.resourceId.videoId,
        title: s.snippet.title,
      }));

    analyzePlaylist(videos, setProgress)
      .then((data) => setAnalysis(data))
      .catch((err) => {
        const msg = err?.response?.data?.error || err?.message || "Unknown error";
        setError("Analysis failed: " + msg);
      })
      .finally(() => setLoading(false));
  }, [songs]);

  if (!songs || songs.length === 0) return null;

  const videoMap = {};
  if (analysis?.videos) {
    analysis.videos.forEach((v) => {
      videoMap[v.video_id] = v;
    });
  }

  return (
    <div className="insightsPanel">
      <div className="insightsTabs">
        <span className="insightsTitle">Playlist Intelligence</span>
        {["overview", "videos", "search"].map((tab) => (
          <button
            key={tab}
            className={`insightTab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      <div className="insightsContent">
        {loading && (
          <div className="insightLoading">
            <span className="spinner" /> {progress}
          </div>
        )}
        {error && <p className="errorMsg">{error}</p>}

        {analysis && activeTab === "overview" && (
          <div className="overviewContent">
            <p className="overviewText">{analysis.overview}</p>

            {analysis.key_takeaways?.length > 0 && (
              <>
                <h4>Key Takeaways</h4>
                <ul className="insightList">
                  {analysis.key_takeaways.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </>
            )}

            {analysis.themes?.length > 0 && (
              <div className="topicTags">
                {analysis.themes.map((t, i) => (
                  <span key={i} className="topicTag">{t}</span>
                ))}
              </div>
            )}

            {analysis.watch_order?.length > 0 && (
              <>
                <h4>Suggested Watch Order</h4>
                <ol className="watchOrderList">
                  {analysis.watch_order.map((w, i) => (
                    <li key={i}>
                      <span className="watchTitle">{w.title}</span>
                      {w.reason && (
                        <span className="watchReason">{w.reason}</span>
                      )}
                    </li>
                  ))}
                </ol>
              </>
            )}
          </div>
        )}

        {analysis && activeTab === "videos" && (
          <div className="videosInsightList">
            {(analysis.videos || []).map((v) => (
              <div key={v.video_id} className="videoInsightCard">
                <div className="videoInsightHeader">
                  <span className="videoInsightTitle">
                    {songs.find(
                      (s) => s.snippet.resourceId.videoId === v.video_id
                    )?.snippet.title || v.video_id}
                  </span>
                  {v.difficulty && (
                    <span className={`difficultyBadge ${v.difficulty}`}>
                      {v.difficulty}
                    </span>
                  )}
                </div>
                <p className="videoSummary">{v.summary}</p>
                {v.topics?.length > 0 && (
                  <div className="topicTags">
                    {v.topics.map((t, i) => (
                      <span key={i} className="topicTag">{t}</span>
                    ))}
                  </div>
                )}
                {v.prerequisites?.length > 0 && (
                  <p className="prereqText">
                    Watch first:{" "}
                    {v.prerequisites
                      .map(
                        (pid) =>
                          songs.find(
                            (s) => s.snippet.resourceId.videoId === pid
                          )?.snippet.title || pid
                      )
                      .join(", ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === "search" && <PlaylistSearch songs={songs} />}
      </div>
    </div>
  );
};

export default InsightsPanel;
