import React, { useState } from "react";
import { searchPlaylist } from "../utils/agentApi";

const PlaylistSearch = ({ songs }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const videoIds = songs.map((s) => s.snippet.resourceId.videoId);
      const res = await searchPlaylist(query, videoIds);
      setResults(res || []);
    } catch {
      setResults([]);
    }
    setLoading(false);
  };

  return (
    <div className="insightSection">
      <form onSubmit={handleSearch} className="searchInsightForm">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search across all videos..."
          className="insightSearchInput"
        />
        <button type="submit" className="insightBtn" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>
      {searched && results.length === 0 && !loading && (
        <p className="noResults">No results found</p>
      )}
      {results.length > 0 && (
        <ul className="searchResults">
          {results.map((r, i) => (
            <li key={i} className="searchResult">
              <div className="resultScore">{r.score}%</div>
              <div className="resultContent">
                <p className="resultSnippet">{r.relevance_snippet}</p>
                <span className="resultVideoId">{r.video_id}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PlaylistSearch;
