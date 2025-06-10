import React, { useState, useEffect } from "react";
import PlaylistOverview from "./PlaylistOverview";
import PlaylistSearch from "./PlaylistSearch";
import { checkAgentHealth } from "../utils/agentApi";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "search", label: "Search" },
];

const InsightsPanel = ({ songs }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [agentOnline, setAgentOnline] = useState(null);

  useEffect(() => {
    checkAgentHealth().then(setAgentOnline);
  }, []);

  if (!songs || songs.length === 0) return null;

  return (
    <div className="insightsPanel">
      <div className="insightsTabs">
        <span className="insightsTitle">Playlist Intelligence</span>
        <span className={`agentStatus ${agentOnline ? "online" : "offline"}`}>
          {agentOnline === null ? "" : agentOnline ? "Agent Online" : "Agent Offline"}
        </span>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`insightTab ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="insightsContent">
        {!agentOnline && agentOnline !== null && (
          <p className="agentOfflineMsg">
            The intelligence agent is not running. Start it with: uvicorn main:app --reload
          </p>
        )}
        {agentOnline && activeTab === "overview" && (
          <PlaylistOverview songs={songs} />
        )}
        {agentOnline && activeTab === "search" && (
          <PlaylistSearch songs={songs} />
        )}
      </div>
    </div>
  );
};

export default InsightsPanel;
