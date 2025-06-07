import React, { useState, useEffect } from "react";
import { getPlaylistInsight } from "../utils/agentApi";

const PlaylistOverview = ({ songs }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyze = async () => {
    setLoading(true);
    setError("");
    try {
      const videos = songs.map((s) => ({
        video_id: s.snippet.resourceId.videoId,
        title: s.snippet.title,
      }));
      const result = await getPlaylistInsight(videos);
      setData(result);
    } catch {
      setError("Could not analyze playlist");
    }
    setLoading(false);
  };

  return (
    <div className="insightSection">
      {!data && !loading && (
        <button className="insightBtn" onClick={analyze}>
          Analyze Playlist
        </button>
      )}
      {loading && <p className="insightLoading">Analyzing playlist...</p>}
      {error && <p className="errorMsg">{error}</p>}
      {data && (
        <div className="overviewContent">
          <h4>Overview</h4>
          <p>{data.overview}</p>
          {data.themes?.length > 0 && (
            <>
              <h4>Themes</h4>
              <ul className="insightList">
                {data.themes.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </>
          )}
          {data.watch_order?.length > 0 && (
            <>
              <h4>Suggested Watch Order</h4>
              <ol className="insightList">
                {data.watch_order.map((w, i) => (
                  <li key={i}>
                    {typeof w === "string" ? w : w.title || w.video_id}
                    {w.reason && (
                      <span className="watchReason"> — {w.reason}</span>
                    )}
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PlaylistOverview;
