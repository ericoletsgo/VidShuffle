import React, { useState } from "react";
import { getVideoInsight } from "../utils/agentApi";

const VideoInsight = ({ videoId, title }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyze = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getVideoInsight(videoId, title);
      setData(result);
    } catch {
      setError("Could not get insights");
    }
    setLoading(false);
  };

  if (!data && !loading) {
    return (
      <button className="insightBtnSmall" onClick={analyze}>
        Get Insights
      </button>
    );
  }

  if (loading) {
    return <p className="insightLoading">Loading...</p>;
  }

  if (error) {
    return <p className="errorMsg">{error}</p>;
  }

  return (
    <div className="videoInsightContent">
      <p className="videoSummary">{data.summary}</p>
      {data.topics?.length > 0 && (
        <div className="topicTags">
          {data.topics.map((t, i) => (
            <span key={i} className="topicTag">
              {t}
            </span>
          ))}
        </div>
      )}
      {data.takeaways?.length > 0 && (
        <ul className="takeawayList">
          {data.takeaways.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default VideoInsight;
