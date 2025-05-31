import React from "react";
import { connect } from "react-redux";
import { fetchData } from "./utils/fetchData";
import { useNavigate } from "react-router-dom";

const PlaylistUsed = ({
  playlistDetails,
  addSongs,
  currentSong,
  nextSong,
  deleteFromPlaylistDetails,
}) => {
  const navigate = useNavigate();

  const handleClick = async (id) => {
    const data = await fetchData(id);
    addSongs(data.responseArrToAdd);
    currentSong(data.currentSong);
    nextSong(data.nextSong);
    navigate(`/playlist/${id}`);
  };

  if (!playlistDetails || playlistDetails.length === 0) return null;

  return (
    <div className="playlistUsedSection">
      <h3 className="sectionHeading">Recent Playlists</h3>
      {playlistDetails.map((element) => (
        <div className="playlistUsed" key={element.playlistId}>
          <div
            onClick={() => handleClick(element.playlistId)}
            className="usedContent"
          >
            <img src={element.PlaylistImage} height="auto" width="auto" />
            <p className="usedPlaylistName">{element.playlistName}</p>
          </div>
          <button
            className="playlistUsedButton"
            aria-label="Remove playlist"
            onClick={() => deleteFromPlaylistDetails(element.playlistId)}
          >
            X
          </button>
        </div>
      ))}
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    playlistDetails: state.playlistDetails,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    addSongs: (payload) => dispatch({ type: "songs/addSongs", payload }),
    currentSong: (payload) => dispatch({ type: "player/currentSong", payload }),
    nextSong: (payload) => dispatch({ type: "player/nextSong", payload }),
    deleteFromPlaylistDetails: (payload) =>
      dispatch({ type: "playlistDetails/deleteFromPlaylistDetails", payload }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PlaylistUsed);
