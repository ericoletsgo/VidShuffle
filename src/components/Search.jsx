import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { connect } from "react-redux";
import { fetchData } from "./utils/fetchData";

const Search = ({ addSongs, currentSong, nextSong, addToPlaylistDetails }) => {
  const [playlistId, setPlaylistId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    console.log(playlistId);

    const regex = /list=([a-zA-Z0-9_-]+)/;
    const match = playlistId.match(regex);
    const id = match ? match[1] : playlistId;

    setLoading(true);

    try {
      const data = await fetchData(id);

      setLoading(false);
      addToPlaylistDetails(data.playlistDetailsObject);
      addSongs(data.responseArrToAdd);
      currentSong(data.currentSong);
      nextSong(data.nextSong);

      navigate(`/playlist/${id}`);
    } catch (err) {
      setLoading(false);
      setError("Couldn't load that playlist. Check the URL and try again.");
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    setPlaylistId(e.target.value);
  };
  return (
    <div className="searchContaienr">
      <div className="searchText">Enter a Youtube playlist</div>
      <form onSubmit={(e) => handleSubmit(e)}>
        <input
        className="inputSearch"
          pattern="^(https?:\/\/)?(www\.)?youtube\.com\/playlist\?list=PL[a-zA-Z0-9_-]+$|^(PL[a-zA-Z0-9_-]+)$"
          title="Please enter a valid YouTube playlist URL or ID"
          type="text"
          autoFocus
          onChange={(e) => handleChange(e)}
          value={playlistId}
          placeholder="playlist url or playlist ID"
        />
        <button className="submitBtn" type="submit" disabled={loading}>
          {loading ? <span className="spinner" /> : "Submit"}
        </button>
      </form>
      {error && <p className="errorMsg">{error}</p>}
    </div>
  );
};
const mapDispatchToProps = (dispatch) => {
  return {
    addSongs: (payload) => dispatch({ type: "songs/addSongs", payload }),
    currentSong: (payload) => dispatch({ type: "player/currentSong", payload }),
    nextSong: (payload) => dispatch({ type: "player/nextSong", payload }),
    addToPlaylistDetails: (payload) =>
      dispatch({ type: "playlistDetails/addToPlaylistDetails", payload }),
  };
};

export default connect(null, mapDispatchToProps)(Search);
