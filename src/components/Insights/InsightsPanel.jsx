import React, { useState } from "react";
import PlaylistOverview from "./PlaylistOverview";
import PlaylistSearch from "./PlaylistSearch";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "search", label: "Search" },
];

const InsightsPanel = ({ songs }) => {
  const [activeTab, setActiveTab] = useState("overview");

  if (!songs || songs.length === 0) return null;

  return (
    <div className="insightsPanel">
      <div className="insightsTabs">
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
        {activeTab === "overview" && <PlaylistOverview songs={songs} />}
        {activeTab === "search" && <PlaylistSearch songs={songs} />}
      </div>
    </div>
  );
};

export default InsightsPanel;
